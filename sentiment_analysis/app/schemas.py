import re
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

class ClauseBreakdown(BaseModel):
    text: str = Field(..., description="The substring segment of the review.")
    label: str = Field(..., description="Sentiment class: positive, negative, or neutral.")
    score: float = Field(..., description="Model confidence score for this specific clause.")

    model_config = {
        "from_attributes": True
    }


class SentimentAnalysisRequest(BaseModel):
    text: str = Field(..., description="Review text to analyze.")
    star_rating: Optional[int] = Field(None, ge=1, le=5, description="Associated star rating from 1 to 5 stars.")
    review_id: Optional[str] = Field(None, description="Optional review ID. If provided alongside homestay_id, result will be stored in database.")
    homestay_id: Optional[str] = Field(None, description="Optional homestay ID. Must be provided if review_id is specified.")

    @field_validator("text")
    @classmethod
    def validate_and_preprocess_text(cls, v: str) -> str:
        # 1. Clean HTML tags
        cleaned = re.sub(r"<[^>]*>", "", v)
        
        # 2. Normalize whitespace
        normalized = cleaned.strip()
        
        # 3. Reject empty/whitespace-only input
        if not normalized:
            raise ValueError("Review text cannot be empty or whitespace-only.")
        
        # 4. Reject URLs/links (Spam/Promotional)
        if re.search(r"https?://\S+|www\.\S+", normalized, re.IGNORECASE):
            raise ValueError("Review rejected (contains promotional links/URLs).")

        # 5. Reject phone numbers / contact details (Fee bypass prevention for TripAI platform)
        # Catches standard Nepali mobile numbers (98xxxxxxxx, 97xxxxxxxx) and general international numbers
        if re.search(r"\b9[78]\d{8}\b|\b\+?\d{1,3}[-.\s]??\d{3,4}[-.\s]??\d{4,6}\b", normalized):
            raise ValueError("Review rejected (contains phone numbers or contact details).")

        # 6. Reject spam with repeated characters (e.g., "aaaaaaa", "gooddddddddddddd")
        if re.search(r"(.)\1{5,}", normalized):
            raise ValueError("Review rejected as spam (excessive repeated characters detected).")
        
        # 7. Reject all-caps gibberish
        # If text is >= 8 chars and contains only uppercase letters, numbers, and punctuation,
        # we check for gibberish by ensuring it has at least one vowel (English: AEIOUY) to allow
        # common uppercase words/initialisms but reject pure consonant-spam.
        uppercase_clean = re.sub(r"[^A-Z]", "", normalized)
        if len(normalized) >= 8 and normalized.isupper() and len(uppercase_clean) > 0:
            vowels = re.findall(r"[AEIOUY]", uppercase_clean)
            if not vowels:
                raise ValueError("Review rejected as spam (all-caps consonant gibberish).")
            
        return normalized

    @field_validator("homestay_id")
    @classmethod
    def validate_homestay_id_presence(cls, v: Optional[str], info) -> Optional[str]:
        # If review_id is provided, homestay_id must also be provided
        data = info.data
        if data.get("review_id") is not None and v is None:
            raise ValueError("homestay_id is required if review_id is provided.")
        return v


class SentimentAnalysisResponse(BaseModel):
    overall_label: str = Field(..., description="Combined overall sentiment: positive, negative, neutral, mixed.")
    overall_score: float = Field(..., description="Continuous aggregated score in range [-1.0, 1.0].")
    confidence: float = Field(..., description="Combined confidence score in range [0.0, 1.0].")
    clauses: List[ClauseBreakdown] = Field(..., description="Breakdown of analysis per split clause.")
    mismatch_flag: bool = Field(..., description="True if computed sentiment strongly conflicts with rating.")
    review_id: Optional[str] = None
    homestay_id: Optional[str] = None


class ReviewSentimentOut(BaseModel):
    review_id: str
    homestay_id: str
    overall_label: str
    overall_score: float
    confidence: float
    clause_breakdown: List[ClauseBreakdown]
    mismatch_flag: bool
    tier_used: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class HomestaySentimentAggOut(BaseModel):
    homestay_id: str
    pos_count: int
    neg_count: int
    neutral_count: int
    mixed_count: int
    weighted_avg_score: float
    total_reviews: int = Field(..., description="Total review count (sum of all label counts).")
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

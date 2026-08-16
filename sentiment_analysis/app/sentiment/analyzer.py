import re
from typing import List, Dict, Any, Optional
from transformers import pipeline
from app import config
from app.schemas import ClauseBreakdown

# Global sentiment pipeline instance. Loaded once on startup via FastAPI lifespan.
_sentiment_pipeline = None

def load_model() -> None:
    """
    Loads the sentiment analysis model once on application startup.
    Uses the specified DistilBERT model.
    """
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        # Load the Hugging Face sentiment pipeline with the pre-trained student model
        _sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model=config.MODEL_NAME
        )

def get_pipeline():
    """
    Retrieves the global pipeline instance.
    Raises RuntimeError if the model is not loaded yet.
    """
    if _sentiment_pipeline is None:
        raise RuntimeError("Sentiment pipeline is not loaded. Call load_model() first.")
    return _sentiment_pipeline


def split_into_clauses(text: str) -> List[str]:
    """
    Splits the input review text into individual clauses based on:
    1. Sentence boundaries (. ! ? and newlines)
    2. Contrast conjunctions (but, however, although, though)
    
    This helps in catching mixed-sentiment reviews (e.g., "room was good but service was bad").
    """
    # Step 1: Split on sentence boundaries (including Devanagari full stop '।')
    sentences = re.split(r"[.!?\n\r।]+", text)
    
    clauses = []
    # Step 2: Split each sentence on contrast conjunctions
    # Supports both English (but, however, although, though) and Nepali/Romanized Nepali (tara, tarapani, तर, तापनि)
    conjunction_pattern = re.compile(
        r"\b(?:but|however|although|though|tara|tarapani)\b|(?:\s|^)(?:तर|तापनि)(?:\s|$)", 
        re.IGNORECASE
    )
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        
        # Split by conjunctions
        parts = conjunction_pattern.split(sentence)
        for part in parts:
            # Strip trailing/leading punctuation that might be left by conjunctions (like commas or colons)
            part_cleaned = part.strip().strip(",;: ")
            if part_cleaned:
                clauses.append(part_cleaned)
                
    return clauses


def analyze_clause(clause: str) -> Dict[str, Any]:
    """
    Runs sentiment analysis on a single clause using the Hugging Face pipeline,
    and applies a threshold override to handle near-neutral / low-confidence cases.
    """
    classifier = get_pipeline()
    
    # Model inference (returns e.g. [{'label': 'positive', 'score': 0.98}])
    raw_res = classifier(clause)[0]
    raw_label = raw_res["label"].lower()  # 'positive', 'negative', 'neutral'
    raw_score = float(raw_res["score"])
    
    # Apply near-neutral/low-confidence override
    # If the model predicts positive/negative but with confidence lower than the threshold,
    # we treat the clause sentiment as neutral.
    if raw_label in ("positive", "negative") and raw_score < config.NEUTRAL_THRESHOLD:
        label = "neutral"
        score = raw_score  # Keep the raw confidence score for confidence averaging
    else:
        label = raw_label
        score = raw_score
        
    return {
        "text": clause,
        "label": label,
        "score": score
    }


def combine_sentiments(clauses_analysis: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Combines individual clause analyses to determine:
    1. The overall label (positive, negative, neutral, mixed)
    2. The overall score (continuous score in the range [-1.0, 1.0])
    3. The overall confidence (average of the clause confidence scores)
    
    Rules for overall label combination:
    - At least one positive and one negative clause -> 'mixed'
    - Positive clauses, no negative clauses -> 'positive'
    - Negative clauses, no positive clauses -> 'negative'
    - Only neutral/low-confidence clauses -> 'neutral'
    """
    if not clauses_analysis:
        return {
            "overall_label": "neutral",
            "overall_score": 0.0,
            "confidence": 0.0
        }
        
    pos_count = 0
    neg_count = 0
    neutral_count = 0
    
    total_score_sum = 0.0
    total_confidence_sum = 0.0
    
    for clause in clauses_analysis:
        label = clause["label"]
        score = clause["score"]
        
        # Calculate signed score for average overall_score
        # positive -> +score, negative -> -score, neutral -> 0
        if label == "positive":
            pos_count += 1
            total_score_sum += score
        elif label == "negative":
            neg_count += 1
            total_score_sum -= score
        else:
            neutral_count += 1
            # neutral contributes 0 to overall score sum
            
        total_confidence_sum += score

    total_clauses = len(clauses_analysis)
    
    # 1. Determine overall label
    if pos_count > 0 and neg_count > 0:
        overall_label = "mixed"
    elif pos_count > 0:
        overall_label = "positive"
    elif neg_count > 0:
        overall_label = "negative"
    else:
        overall_label = "neutral"
        
    # 2. Overall continuous score (normalized between -1.0 and 1.0)
    # Professional review analysis practice: Factual/neutral clauses should not dilute the intensity 
    # of opinionated clauses. We average the score over opinionated clauses only, falling back to 0.0 if none.
    opinionated_clauses = pos_count + neg_count
    if opinionated_clauses > 0:
        overall_score = total_score_sum / opinionated_clauses
    else:
        overall_score = 0.0
    
    # 3. Overall confidence score (average of all clause confidences)
    confidence = total_confidence_sum / total_clauses
    
    return {
        "overall_label": overall_label,
        "overall_score": round(overall_score, 4),
        "confidence": round(confidence, 4)
    }


def compute_mismatch_flag(overall_score: float, star_rating: Optional[int]) -> bool:
    """
    Computes the mismatch flag comparing the continuous overall_score [-1.0, 1.0]
    with the user's star rating [1, 5].
    
    Normalizes rating: 5 -> 1.0, 4 -> 0.5, 3 -> 0.0, 2 -> -0.5, 1 -> -1.0.
    A mismatch is triggered if the absolute difference >= RATING_MISMATCH_THRESHOLD (default: 1.2).
    
    Sarcasm Caveat (Explicit Academic Scope Limit):
    - Traditional sentiment models cannot detect semantic sarcasm (e.g. "nice, my bathroom flooded").
    - The mismatch flag serves as a partial, indirect catch (e.g. 1 star rating + positive text sentiment = mismatch_flag: true).
    """
    if star_rating is None:
        return False
        
    # Normalize star rating from [1, 5] to [-1.0, 1.0]
    # Formula: normalized = (rating - 3) / 2
    normalized_rating = (star_rating - 3.0) / 2.0
    
    # Compute absolute difference
    difference = abs(normalized_rating - overall_score)
    
    return difference >= config.RATING_MISMATCH_THRESHOLD


def analyze_review_sentiment(text: str, star_rating: Optional[int] = None) -> Dict[str, Any]:
    """
    High-level analyzer entrypoint. Performs:
    1. Preprocessing (whitespace cleaning)
    2. Clause splitting
    3. Individual clause analysis
    4. Sentiment combination (overall label/score/confidence)
    5. Mismatch flagging (if star rating is present)
    """
    # Split into clauses
    clauses = split_into_clauses(text)
    
    # If splitting results in no clauses, fall back to analyzing the full text
    if not clauses:
        clauses = [text.strip()]
        
    # Analyze each clause
    clauses_analysis = [analyze_clause(clause) for clause in clauses]
    
    # Combine results
    combined = combine_sentiments(clauses_analysis)
    
    # Determine rating mismatch
    mismatch = compute_mismatch_flag(combined["overall_score"], star_rating)
    
    # Map raw dict list to Pydantic objects for safety
    clauses_breakdown = [
        ClauseBreakdown(text=c["text"], label=c["label"], score=c["score"])
        for c in clauses_analysis
    ]
    
    return {
        "overall_label": combined["overall_label"],
        "overall_score": combined["overall_score"],
        "confidence": combined["confidence"],
        "clauses": clauses_breakdown,
        "mismatch_flag": mismatch
    }

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests

from ml.ai_pipeline import AIPipeline


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


# =====================================================
# LOAD AI PIPELINE ONCE
# =====================================================

pipeline = AIPipeline()


# =====================================================
# SENTIMENT SERVICE
# =====================================================

SENTIMENT_SERVICE_URL = (
    "http://127.0.0.1:8001/sentiment/analyze"
)


# =====================================================
# REQUEST SCHEMAS
# =====================================================

class AIQueryRequest(BaseModel):
    query: str


class SentimentRequest(BaseModel):
    text: str
    star_rating: int | None = None
    review_id: str | None = None
    homestay_id: str | None = None


# =====================================================
# AI RECOMMENDATION
# =====================================================

@router.post("/query")
def ai_query(
    request: AIQueryRequest,
):

    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty",
        )

    try:

        result = pipeline.process(
            query
        )

        return result

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# =====================================================
# SENTIMENT ANALYSIS
# =====================================================

@router.post("/sentiment")
def analyze_sentiment(
    request: SentimentRequest,
):

    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Review text cannot be empty",
        )

    payload = {
        "text": text,
        "star_rating": request.star_rating,
        "review_id": request.review_id,
        "homestay_id": request.homestay_id,
    }

    try:

        response = requests.post(
            SENTIMENT_SERVICE_URL,
            json=payload,
            timeout=60,
        )

    except requests.RequestException as exc:

        raise HTTPException(
            status_code=503,
            detail=(
                "Sentiment analysis service is unavailable. "
                "Please make sure the sentiment service "
                "is running on port 8001."
            ),
        ) from exc

    if response.status_code >= 400:

        try:
            detail = response.json().get(
                "detail",
                "Sentiment analysis failed.",
            )

        except Exception:
            detail = (
                "Sentiment analysis service "
                "returned an error."
            )

        raise HTTPException(
            status_code=response.status_code,
            detail=detail,
        )

    try:

        return response.json()

    except ValueError as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "Invalid response received from "
                "sentiment analysis service."
            ),
        ) from exc
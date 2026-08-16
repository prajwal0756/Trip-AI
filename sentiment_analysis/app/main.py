from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import config, database, crud, models, schemas
from app.sentiment import analyzer

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context manager that controls the application lifespan.
    Loads the Hugging Face sentiment analysis model ONCE on startup.
    Creates database tables if they do not exist.
    """
    # 1. Initialize DB tables
    models.Base.metadata.create_all(bind=database.engine)
    
    # 2. Load model into memory
    print(f"Loading Hugging Face model: '{config.MODEL_NAME}'...")
    analyzer.load_model()
    print("Model loaded successfully. Ready for inference.")
    
    yield
    
    # Shutdown logic (if any)
    print("Shutting down FastAPI Application...")


app = FastAPI(
    title="TripAI Sentiment Analysis Service",
    description="Microservice for analyzing, storing, and aggregating homestay review sentiment.",
    version="1.0.0",
    lifespan=lifespan
)


@app.post(
    "/sentiment/analyze",
    response_model=schemas.SentimentAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze sentiment of a homestay review",
    response_description="Analysis results, including clause breakdown and mismatch flag."
)
def analyze_sentiment(
    request: schemas.SentimentAnalysisRequest,
    db: Session = Depends(database.get_db)
):
    """
    Analyzes the sentiment of a single review text (clause splitting, scoring, and label combining).
    
    If `review_id` and `homestay_id` are provided in the payload:
    - Stores the analysis result in the database.
    - Incrementally updates the homestay running aggregates using a Bayesian formula.
    - Fails if the `review_id` already exists.
    """
    # Check if review already exists to prevent duplicate entries
    if request.review_id:
        existing = crud.get_review_sentiment(db, request.review_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Sentiment analysis for review_id '{request.review_id}' already exists."
            )
            
    # Perform core sentiment analysis
    analysis_res = analyzer.analyze_review_sentiment(
        text=request.text,
        star_rating=request.star_rating
    )
    
    # Persist and aggregate if identifiers are provided
    if request.review_id and request.homestay_id:
        crud.save_review_sentiment(
            db=db,
            review_id=request.review_id,
            homestay_id=request.homestay_id,
            analysis=analysis_res,
            tier_used="standard"
        )
        
    return schemas.SentimentAnalysisResponse(
        overall_label=analysis_res["overall_label"],
        overall_score=analysis_res["overall_score"],
        confidence=analysis_res["confidence"],
        clauses=analysis_res["clauses"],
        mismatch_flag=analysis_res["mismatch_flag"],
        review_id=request.review_id,
        homestay_id=request.homestay_id
    )


@app.get(
    "/review/{id}/sentiment",
    response_model=schemas.ReviewSentimentOut,
    summary="Get sentiment details for a specific review",
    response_description="Stored review sentiment details."
)
def get_review_sentiment(
    id: str,
    db: Session = Depends(database.get_db)
):
    """
    Fetches the detailed sentiment analysis results for a previously stored review by its ID.
    """
    review_sentiment = crud.get_review_sentiment(db, id)
    if not review_sentiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sentiment details for review_id '{id}' not found."
        )
    return review_sentiment


@app.get(
    "/homestay/{id}/sentiment",
    response_model=schemas.HomestaySentimentAggOut,
    summary="Get sentiment aggregate for a homestay",
    response_description="Running counts of sentiments and Bayesian weighted score."
)
def get_homestay_sentiment_agg(
    id: str,
    db: Session = Depends(database.get_db)
):
    """
    Fetches the running sentiment aggregate metrics for a homestay.
    
    If the homestay has no reviews yet, returns a default neutral aggregate
    with the platform-wide average score.
    """
    agg = crud.get_homestay_sentiment_agg(db, id)
    if not agg:
        # Fallback to returning a default neutral representation containing the platform average
        platform_avg = crud.get_platform_average_score(db)
        import datetime
        return schemas.HomestaySentimentAggOut(
            homestay_id=id,
            pos_count=0,
            neg_count=0,
            neutral_count=0,
            mixed_count=0,
            weighted_avg_score=platform_avg,
            total_reviews=0,
            updated_at=datetime.datetime.utcnow()
        )
        
    total_reviews = agg.pos_count + agg.neg_count + agg.neutral_count + agg.mixed_count
    return schemas.HomestaySentimentAggOut(
        homestay_id=agg.homestay_id,
        pos_count=agg.pos_count,
        neg_count=agg.neg_count,
        neutral_count=agg.neutral_count,
        mixed_count=agg.mixed_count,
        weighted_avg_score=agg.weighted_avg_score,
        total_reviews=total_reviews,
        updated_at=agg.updated_at
    )

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import config, models, schemas

def get_review_sentiment(db: Session, review_id: str) -> Optional[models.ReviewSentiment]:
    """
    Fetches the sentiment analysis record for a specific review ID.
    """
    return db.query(models.ReviewSentiment).filter(models.ReviewSentiment.review_id == review_id).first()


def get_homestay_sentiment_agg(db: Session, homestay_id: str) -> Optional[models.HomestaySentimentAgg]:
    """
    Fetches the running sentiment aggregation for a specific homestay ID.
    """
    return db.query(models.HomestaySentimentAgg).filter(models.HomestaySentimentAgg.homestay_id == homestay_id).first()


def get_platform_average_score(db: Session) -> float:
    """
    Computes the platform-wide average sentiment score (C) across all reviews.
    Falls back to a default value if no reviews exist.
    """
    # SQL query: SELECT AVG(overall_score) FROM review_sentiment
    avg_score = db.query(func.avg(models.ReviewSentiment.overall_score)).scalar()
    if avg_score is None:
        return config.DEFAULT_PLATFORM_AVG_SCORE
    return float(avg_score)


def save_review_sentiment(
    db: Session,
    review_id: str,
    homestay_id: str,
    analysis: dict,
    tier_used: str = "standard"
) -> models.ReviewSentiment:
    """
    Saves a review's sentiment analysis and incrementally updates the homestay aggregate.
    Operates within a single transaction to maintain consistency.
    """
    # 1. Create and insert the ReviewSentiment record
    db_review = models.ReviewSentiment(
        review_id=review_id,
        homestay_id=homestay_id,
        overall_label=analysis["overall_label"],
        overall_score=analysis["overall_score"],
        confidence=analysis["confidence"],
        clause_breakdown=[c.model_dump() for c in analysis["clauses"]],
        mismatch_flag=analysis["mismatch_flag"],
        tier_used=tier_used
    )
    db.add(db_review)
    # Flush to the DB so this review is included in platform-wide averages
    db.flush()

    # 2. Fetch or initialize the HomestaySentimentAgg record
    db_agg = db.query(models.HomestaySentimentAgg).filter(
        models.HomestaySentimentAgg.homestay_id == homestay_id
    ).with_for_update().first()  # Row-level lock to prevent concurrent update races

    label = analysis["overall_label"]
    score = analysis["overall_score"]

    if not db_agg:
        # Initialize running aggregate
        db_agg = models.HomestaySentimentAgg(
            homestay_id=homestay_id,
            pos_count=1 if label == "positive" else 0,
            neg_count=1 if label == "negative" else 0,
            neutral_count=1 if label == "neutral" else 0,
            mixed_count=1 if label == "mixed" else 0,
            avg_score=score,
            weighted_avg_score=0.0  # Computed below
        )
        db.add(db_agg)
        v = 1
    else:
        # Calculate old total review count
        v_old = db_agg.pos_count + db_agg.neg_count + db_agg.neutral_count + db_agg.mixed_count
        
        # Increment appropriate counter
        if label == "positive":
            db_agg.pos_count += 1
        elif label == "negative":
            db_agg.neg_count += 1
        elif label == "neutral":
            db_agg.neutral_count += 1
        elif label == "mixed":
            db_agg.mixed_count += 1
            
        v = v_old + 1
        
        # Update raw average score (R) incrementally
        # Formula: R_new = (R_old * v_old + new_score) / (v_old + 1)
        db_agg.avg_score = ((db_agg.avg_score * v_old) + score) / v

    # 3. Calculate platform-wide average score (C)
    C = get_platform_average_score(db)
    
    # 4. Compute Bayesian weighted average score
    # Formula: weighted_score = (v / (v + m)) * R + (m / (v + m)) * C
    m = config.BAYESIAN_MIN_REVIEWS
    R = db_agg.avg_score
    
    db_agg.weighted_avg_score = (v / (v + m)) * R + (m / (v + m)) * C

    db.commit()
    db.refresh(db_review)
    return db_review

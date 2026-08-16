from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, JSON, Integer, DateTime
from app.database import Base

class ReviewSentiment(Base):
    """
    Stores the detailed sentiment analysis results for each individual homestay review.
    """
    __tablename__ = "review_sentiment"

    # review_id acts as the unique identifier and primary key (passed from TripAI platform)
    review_id = Column(String, primary_key=True, index=True)
    homestay_id = Column(String, index=True, nullable=False)
    
    # Combined sentiment metrics
    overall_label = Column(String, nullable=False)  # 'positive', 'negative', 'neutral', 'mixed'
    overall_score = Column(Float, nullable=False)   # Continuous score in range [-1.0, 1.0]
    confidence = Column(Float, nullable=False)      # Average model confidence across all clauses [0.0, 1.0]
    
    # Store per-clause sentiment break-down as JSON list.
    # Format: [{"text": str, "label": str, "score": float}, ...]
    clause_breakdown = Column(JSON, nullable=False)
    
    # Flags rating mismatch (possible sarcasm / review rating inconsistency)
    mismatch_flag = Column(Boolean, default=False, nullable=False)
    
    # Model execution metadata
    tier_used = Column(String, default="standard", nullable=False)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class HomestaySentimentAgg(Base):
    """
    Stores running aggregates of sentiment counts and weighted Bayesian scores per homestay.
    Updated incrementally upon new review inserts; never recomputed from scratch.
    """
    __tablename__ = "homestay_sentiment_agg"

    homestay_id = Column(String, primary_key=True, index=True)
    
    # Aggregated label counters
    pos_count = Column(Integer, default=0, nullable=False)
    neg_count = Column(Integer, default=0, nullable=False)
    neutral_count = Column(Integer, default=0, nullable=False)
    mixed_count = Column(Integer, default=0, nullable=False)
    
    # The Bayesian average sentiment score for TripAI's ranking system
    weighted_avg_score = Column(Float, default=0.0, nullable=False)
    
    # Running raw average score (R) to support clean incremental updates without drift
    avg_score = Column(Float, default=0.0, nullable=False)
    
    # Track update times
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

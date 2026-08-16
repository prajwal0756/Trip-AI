from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DECIMAL,
    TIMESTAMP,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
# from sqlalchemy.ext.associationproxy import association_proxy

from app.database.base import Base


class Destination(Base):
    __tablename__ = "destinations"

    destination_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    destination_name = Column(
        String(200),
        nullable=False
    )

    district = Column(
        String(100),
        nullable=False
    )

    province = Column(
        String(100),
        nullable=False
    )

    region = Column(
        String(100)
    )

    category = Column(
        String(255)
    )

    travel_type = Column(
        String(100)
    )

    # IMPORTANT:
    # Database column is still called "activities".
    # Python attribute is changed to activities_text
    # because "activities" is now used for the ORM relationship.
    activities_text = Column(
        "activities",
        Text
    )

    best_season = Column(
        String(100)
    )

    estimated_budget_npr = Column(
        Integer
    )

    average_duration_days = Column(
        Integer
    )

    difficulty_level = Column(
        String(50)
    )

    family_friendly = Column(
        String(10)
    )

    latitude = Column(
        DECIMAL(10, 7)
    )

    longitude = Column(
        DECIMAL(10, 7)
    )

    average_rating = Column(
        DECIMAL(3, 2),
        default=0
    )

    review_count = Column(
        Integer,
        default=0
    )

    popularity_score = Column(
        DECIMAL(5, 2),
        default=0
    )

    description = Column(
        Text
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    # ==================================================
    # IMAGE RELATIONSHIP
    # ==================================================

    images = relationship(
        "DestinationImage",
        back_populates="destination",
        cascade="all, delete-orphan"
    )

    # ==================================================
    # CATEGORY RELATIONSHIP
    # ==================================================

    categories = relationship(
        "DestinationCategory",
        back_populates="destination"
    )

    activity_mappings = relationship(
        "DestinationActivity",
        back_populates="destination"
    )

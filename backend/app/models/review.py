from sqlalchemy import (
    Column,
    Integer,
    Text,
    TIMESTAMP,
    ForeignKey,
)
from sqlalchemy.sql import func

from app.database.base import Base


class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
    )

    destination_id = Column(
        Integer,
        ForeignKey("destinations.destination_id"),
        nullable=False,
    )

    review_text = Column(
        Text,
        nullable=True,
    )

    rating_value = Column(
        Integer,
        nullable=False,
    )

    review_date = Column(
        TIMESTAMP,
        server_default=func.now(),
    )
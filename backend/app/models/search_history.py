from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func

from app.database.base import Base


class SearchHistory(Base):
    __tablename__ = "search_history"

    search_id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
        index=True,
    )

    query = Column(
        String(255),
        nullable=False,
    )

    search_type = Column(
        String(50),
        nullable=False,
        default="destination",
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False,
    )

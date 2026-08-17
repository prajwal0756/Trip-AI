from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Float,
    TIMESTAMP,
    Text,
    ForeignKey,
)

from sqlalchemy.sql import func

from app.database.base import Base


class Booking(Base):

    __tablename__ = "bookings"

    booking_id = Column(
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

    homestay_id = Column(
        String(20),
        ForeignKey("homestays.homestay_id"),
        nullable=False,
        index=True,
    )

    owner_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=True,
        index=True,
    )

    check_in = Column(
        Date,
        nullable=False,
    )

    check_out = Column(
        Date,
        nullable=False,
    )

    guests = Column(
        Integer,
        nullable=False,
    )

    total_price = Column(
        Float,
        nullable=False,
    )

    status = Column(
        String(20),
        nullable=False,
        default="upcoming",
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False,
    )

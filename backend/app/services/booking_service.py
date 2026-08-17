from datetime import date

from sqlalchemy.orm import Session

from app.models.booking import Booking


def create_booking(
    db: Session,
    user_id: int,
    homestay_id: str,
    check_in: date,
    check_out: date,
    guests: int,
    total_price: float,
):

    if check_out <= check_in:
        raise ValueError(
            "Check-out date must be after check-in date."
        )

    booking = Booking(
        user_id=user_id,
        homestay_id=homestay_id,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        total_price=total_price,
        status="upcoming",
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking


def get_user_bookings(
    db: Session,
    user_id: int,
):

    return (
        db.query(Booking)
        .filter(
            Booking.user_id == user_id
        )
        .order_by(
            Booking.created_at.desc()
        )
        .all()
    )


def get_booking(
    db: Session,
    booking_id: int,
    user_id: int,
):

    return (
        db.query(Booking)
        .filter(
            Booking.booking_id == booking_id,
            Booking.user_id == user_id,
        )
        .first()
    )


def update_booking_status(
    db: Session,
    booking: Booking,
    status: str,
):

    allowed_statuses = {
        "upcoming",
        "completed",
        "cancelled",
    }

    if status not in allowed_statuses:
        raise ValueError(
            "Invalid booking status."
        )

    booking.status = status

    db.commit()
    db.refresh(booking)

    return booking

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.booking import Booking
from app.models.homestay import Homestay

from app.schemas.booking import BookingResponse


router = APIRouter(
    prefix="/owner",
    tags=["Owner"],
)


# =====================================================
# GET OWNER BOOKINGS
# =====================================================

@router.get(
    "/bookings",
    response_model=list[BookingResponse],
)
def get_owner_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.role != "owner":
        raise HTTPException(
            status_code=403,
            detail="Owner access required.",
        )

    return (
        db.query(Booking)
        .join(
            Homestay,
            Booking.homestay_id == Homestay.homestay_id,
        )
        .filter(
            Homestay.owner_id == current_user.user_id
        )
        .order_by(
            Booking.created_at.desc()
        )
        .all()
    )
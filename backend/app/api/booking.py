from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User

from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
)

from app.services.booking_service import (
    create_booking,
    get_user_bookings,
    get_booking,
    update_booking_status,
)


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


# =====================================================
# CREATE BOOKING
# =====================================================

@router.post(
    "/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        return create_booking(
            db=db,
            user_id=current_user.user_id,
            homestay_id=data.homestay_id,
            check_in=data.check_in,
            check_out=data.check_out,
            guests=data.guests,
            total_price=data.total_price,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


# =====================================================
# GET MY BOOKINGS
# =====================================================

@router.get(
    "/",
    response_model=list[BookingResponse],
)
def my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    return get_user_bookings(
        db=db,
        user_id=current_user.user_id,
    )


# =====================================================
# UPDATE BOOKING STATUS
# =====================================================

@router.patch(
    "/{booking_id}/status",
    response_model=BookingResponse,
)
def change_status(
    booking_id: int,
    status_value: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    booking = get_booking(
        db=db,
        booking_id=booking_id,
        user_id=current_user.user_id,
    )

    if not booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    try:

        return update_booking_status(
            db=db,
            booking=booking,
            status=status_value,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

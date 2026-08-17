from datetime import date, datetime

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):

    homestay_id: str

    check_in: date

    check_out: date

    guests: int = Field(
        ge=1,
    )

    total_price: float = Field(
        ge=0,
    )


class BookingResponse(BaseModel):

    booking_id: int

    user_id: int

    homestay_id: str

    check_in: date

    check_out: date

    guests: int

    total_price: float

    status: str

    created_at: datetime

    model_config = {
        "from_attributes": True
    }

from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    user_id: int
    destination_id: int
    review_text: str
    rating_value: int = Field(
        ge=1,
        le=5,
    )


class ReviewResponse(BaseModel):
    review_id: int
    user_id: int
    destination_id: int
    review_text: str | None
    rating_value: int
    review_date: datetime | None

    class Config:
        from_attributes = True
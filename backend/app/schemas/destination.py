from decimal import Decimal
from pydantic import BaseModel, Field

from app.schemas.image import ImageResponse
from app.schemas.category import CategoryResponse
from app.schemas.activity import ActivityResponse


# -----------------------------
# Homepage Card
# -----------------------------
# class DestinationList(BaseModel):
#     destination_id: int
#     destination_name: str
#     province: str
#     district: str
#     category: str | None = None
#     travel_type: str | None = None
#     estimated_budget_npr: int | None = None
#     average_rating: Decimal | None = None
#     popularity_score: Decimal | None = None

#     class Config:
#         from_attributes = True



# # -----------------------------
# # Destination List
# # -----------------------------
# class DestinationList(BaseModel):
#     destination_id: int
#     destination_name: str
#     province: str
#     district: str
#     category: str | None = None
#     travel_type: str | None = None
#     estimated_budget_npr: int | None = None
#     average_rating: Decimal | None = None
#     popularity_score: Decimal | None = None

#     class Config:
#         from_attributes = True


class DestinationList(BaseModel):
    destination_id: int
    destination_name: str
    province: str
    district: str
    category: str | None = None
    travel_type: str | None = None
    estimated_budget_npr: int | None = None
    average_rating: Decimal | None = None
    popularity_score: Decimal | None = None

    images: list[ImageResponse] = Field(
        default_factory=list
    )

    class Config:
        from_attributes = True


# -----------------------------
# Destination Detail
# -----------------------------
class DestinationDetail(BaseModel):

    destination_id: int
    destination_name: str
    district: str
    province: str
    region: str

    description: str

    best_season: str | None = None
    travel_type: str | None = None

    estimated_budget_npr: int | None = None
    average_duration_days: int | None = None

    difficulty_level: str | None = None
    family_friendly: str | None = None

    latitude: Decimal | None = None
    longitude: Decimal | None = None

    average_rating: Decimal | None = None
    review_count: int | None = None
    popularity_score: Decimal | None = None

    images: list[ImageResponse] = Field(
        default_factory=list
    )

    categories: list[CategoryResponse] = Field(
        default_factory=list
    )

    activities: list[ActivityResponse] = Field(
        default_factory=list
    )

    class Config:
        from_attributes = True


# -----------------------------
# Filter Option
# -----------------------------
class FilterOption(BaseModel):
    value: str
    count: int
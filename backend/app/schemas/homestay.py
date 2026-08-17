from typing import Optional

from pydantic import BaseModel


class HomestayResponse(BaseModel):
    homestay_id: str
    homestay_name: str

    district: str
    province: Optional[str] = None

    municipality: Optional[str] = None
    address: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    price_per_night_npr: Optional[float] = None

    key_feature_vibe: Optional[str] = None

    max_guests: Optional[int] = None
    room_count: Optional[int] = None

    meals_available: Optional[str] = None
    meal_types: Optional[str] = None

    amenities: Optional[str] = None
    activities: Optional[str] = None
    nearby_attractions: Optional[str] = None

    homestay_type: Optional[str] = None

    family_friendly: Optional[str] = None

    rating: Optional[float] = None
    review_count: Optional[int] = None

    description: Optional[str] = None

    class Config:
        from_attributes = True

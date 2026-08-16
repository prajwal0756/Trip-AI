# from pydantic import BaseModel
# from typing import List

# class RecommendationRequest(BaseModel):
#     preferences: str
#     budget: str
#     travelers_count: int

# class HomestayResponse(BaseModel):
#     name: str
#     location: str
#     price_per_night: float
#     description: str

# class RecommendationResponse(BaseModel):
#     recommended_destination: str
#     destination_overview: str
#     homestays: List[HomestayResponse]
from pydantic import BaseModel


class RecommendationRequest(BaseModel):

    destination_name: str

    top_n: int = 10


class RecommendationResponse(BaseModel):

    destination_id: int

    destination_name: str

    province: str

    district: str

    category: str

    travel_type: str

    activities: str

    best_season: str

    estimated_budget_npr: int

    average_rating: float

    review_count: int

    popularity_score: float

    latitude: float

    longitude: float

    description: str

    similarity_score: float

    final_score: float

    model_config = {
        "from_attributes": True
    }
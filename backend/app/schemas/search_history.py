from datetime import datetime

from pydantic import BaseModel


class SearchHistoryCreate(BaseModel):
    query: str
    search_type: str = "destination"


class SearchHistoryResponse(BaseModel):
    search_id: int
    query: str
    search_type: str
    created_at: datetime

    class Config:
        from_attributes = True

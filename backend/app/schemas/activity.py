from pydantic import BaseModel


class ActivityResponse(BaseModel):
    activity_id: int
    activities: str
    difficulty_level: str | None = None

    class Config:
        from_attributes = True
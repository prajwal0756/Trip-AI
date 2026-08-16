from pydantic import BaseModel


class ImageResponse(BaseModel):
    image_id: int
    image_url: str
    image_type: str | None = None

    class Config:
        from_attributes = True
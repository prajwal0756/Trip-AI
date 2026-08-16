from pydantic import BaseModel


class CategoryResponse(BaseModel):
    category_id: int
    category: str

    class Config:
        from_attributes = True
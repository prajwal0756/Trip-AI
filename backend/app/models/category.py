from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base import Base


class Category(Base):

    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True)

    category = Column(String(100), nullable=False)

    description = Column(Text)

    destinations = relationship(
        "DestinationCategory",
        back_populates="category"
    )
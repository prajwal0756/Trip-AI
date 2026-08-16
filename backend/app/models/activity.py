from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base import Base


class Activity(Base):

    __tablename__ = "activities"

    activity_id = Column(Integer, primary_key=True)

    activities = Column(String(150), nullable=False)

    description = Column(Text)

    difficulty_level = Column(String(50))

    destinations = relationship(
        "DestinationActivity",
        back_populates="activity"
    )
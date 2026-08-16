from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class DestinationCategory(Base):

    __tablename__ = "destination_category"

    destination_category_id = Column(
        Integer,
        primary_key=True
    )

    destination_id = Column(
        Integer,
        ForeignKey("destinations.destination_id")
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.category_id")
    )

    destination = relationship(
        "Destination",
        back_populates="categories"
    )

    category = relationship(
        "Category",
        back_populates="destinations"
    )


class DestinationActivity(Base):

    __tablename__ = "destination_activity"

    destination_activity_id = Column(
        Integer,
        primary_key=True
    )

    destination_id = Column(
        Integer,
        ForeignKey("destinations.destination_id")
    )

    activity_id = Column(
        Integer,
        ForeignKey("activities.activity_id")
    )

    destination = relationship(
    "Destination",
    back_populates="activity_mappings")

    activity = relationship(
        "Activity",
        back_populates="destinations"
    )
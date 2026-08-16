from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class DestinationImage(Base):

    __tablename__ = "images"

    image_id = Column(
        Integer,
        primary_key=True
    )

    destination_id = Column(
        Integer,
        ForeignKey("destinations.destination_id")
    )

    image_url = Column(
        String(255)
    )

    image_type = Column(
        String(50)
    )

    destination = relationship(
        "Destination",
        back_populates="images"
    )
from app.database.base import Base

from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey


class Homestay(Base):
    __tablename__ = "homestays"

    homestay_id = Column(String(20), primary_key=True)

    owner_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=True,
        index=True,
    )

    homestay_name = Column(String(255), nullable=False)

    district = Column(String(100), nullable=False)
    province = Column(String(100))

    municipality = Column(String(150))
    address = Column(String(255))

    latitude = Column(Float)
    longitude = Column(Float)

    price_per_night_npr = Column(Float)

    key_feature_vibe = Column(Text)

    max_guests = Column(Integer)
    room_count = Column(Integer)

    meals_available = Column(String(20))
    meal_types = Column(Text)

    amenities = Column(Text)
    activities = Column(Text)
    nearby_attractions = Column(Text)

    homestay_type = Column(String(100))

    family_friendly = Column(String(20))

    rating = Column(Float)
    review_count = Column(Integer)

    description = Column(Text)

from app.core.database import engine
from app.database.base import Base

# Import models so SQLAlchemy registers them with Base.metadata
from app.models.user import User
from app.models.destination import Destination
from app.models.destination_image import DestinationImage
from app.models.category import Category
from app.models.activity import Activity
from app.models.destination_mapping import (
    DestinationCategory,
    DestinationActivity,
)
from app.models.homestay import Homestay

Base.metadata.create_all(bind=engine)

print("Database tables created successfully.")

from app.core.database import engine
from app.database.base import Base

# Import models so SQLAlchemy registers them with Base.metadata
from app.models.user import User
from app.models.homestay import Homestay
from app.models.booking import Booking

Base.metadata.create_all(bind=engine)

print("Booking table created successfully.")

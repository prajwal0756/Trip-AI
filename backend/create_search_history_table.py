from app.core.database import engine
from app.database.base import Base

from app.models.user import User
from app.models.search_history import SearchHistory

Base.metadata.create_all(bind=engine)

print("Search history table created successfully.")

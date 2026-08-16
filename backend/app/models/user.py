from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(150), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    password_hash = Column(String(255), nullable=False)

    profile_image = Column(String(255), nullable=True)

    phone_number = Column(String(30), nullable=True)

    role = Column(String(30), default="user")

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )
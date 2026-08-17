from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# backend/
BASE_DIR = Path(__file__).resolve().parents[2]

# backend/.env
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):

    DATABASE_URL: str

    SECRET_KEY: str

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()


# Compatibility for old imports

DATABASE_URL = settings.DATABASE_URL

SECRET_KEY = settings.SECRET_KEY

ALGORITHM = settings.ALGORITHM

ACCESS_TOKEN_EXPIRE_MINUTES = (
    settings.ACCESS_TOKEN_EXPIRE_MINUTES
)
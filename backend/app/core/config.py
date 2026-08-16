# from dotenv import load_dotenv
# import os

# # Load environment variables from backend/.env
# load_dotenv()

# DATABASE_URL = os.getenv("DATABASE_URL")

# SECRET_KEY = os.getenv("SECRET_KEY")

# ALGORITHM = os.getenv("ALGORITHM")

# ACCESS_TOKEN_EXPIRE_MINUTES = int(
#     os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
# )


from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    DATABASE_URL: str

    SECRET_KEY: str

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30


    class Config:
        env_file = ".env"



settings = Settings()


# Compatibility for old imports
DATABASE_URL = settings.DATABASE_URL

SECRET_KEY = settings.SECRET_KEY

ALGORITHM = settings.ALGORITHM

ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
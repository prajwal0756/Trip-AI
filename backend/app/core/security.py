# from datetime import datetime, timedelta, timezone

# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from jose import JWTError, jwt
# from passlib.context import CryptContext
# from sqlalchemy.orm import Session

# from app.core.config import (
#     SECRET_KEY,
#     ALGORITHM,
#     ACCESS_TOKEN_EXPIRE_MINUTES,
# )
# from app.core.database import SessionLocal
# from app.models.user import User


# # ==========================
# # Password Hashing
# # ==========================

# pwd_context = CryptContext(
#     schemes=["bcrypt"],
#     deprecated="auto",
# )


# def hash_password(password: str) -> str:
#     """
#     Hash a plain-text password.
#     """
#     return pwd_context.hash(password)


# # Alias so both function names work across your app
# get_password_hash = hash_password


# def verify_password(
#     plain_password: str,
#     hashed_password: str,
# ) -> bool:
#     """
#     Verify a plain password against a hashed password.
#     """
#     return pwd_context.verify(
#         plain_password,
#         hashed_password,
#     )


# # ==========================
# # JWT Token Creation
# # ==========================

# def create_access_token(data: dict) -> str:
#     """
#     Create a signed JWT access token.
#     """
#     to_encode = data.copy()

#     expire = datetime.now(timezone.utc) + timedelta(
#         minutes=ACCESS_TOKEN_EXPIRE_MINUTES
#     )

#     to_encode.update({"exp": expire})

#     encoded_jwt = jwt.encode(
#         to_encode,
#         SECRET_KEY,
#         algorithm=ALGORITHM,
#     )

#     return encoded_jwt


# # ==========================
# # JWT Token Verification
# # ==========================

# def verify_token(token: str):
#     """
#     Decode and verify a JWT.
#     Returns the payload if valid, otherwise None.
#     """
#     try:
#         payload = jwt.decode(
#             token,
#             SECRET_KEY,
#             algorithms=[ALGORITHM],
#         )
#         return payload

#     except JWTError:
#         return None


# # ==========================
# # Database Dependency
# # ==========================

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# # ==========================
# # OAuth2 Configuration
# # ==========================

# oauth2_scheme = OAuth2PasswordBearer(
#     tokenUrl="/auth/login"
# )


# # ==========================
# # Current User Dependency
# # ==========================

# def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: Session = Depends(get_db),
# ):
#     payload = verify_token(token)

#     if payload is None:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid token",
#         )

#     email = payload.get("sub")

#     if email is None:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid token",
#         )

#     user = (
#         db.query(User)
#         .filter(User.email == email)
#         .first()
#     )

#     if user is None:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="User not found",
#         )

#     return user
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# ---------------------------
# Password Functions
# ---------------------------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )

# ---------------------------
# JWT Token
# ---------------------------

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload

    except JWTError:
        return None


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
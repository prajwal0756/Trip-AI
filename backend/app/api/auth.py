from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User

from app.schemas.user import UserRegister
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserResponse,
)

from app.services.auth_service import (
    create_user,
    get_user_by_email,
    login_user,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# =====================================================
# REGISTER
# =====================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
):

    existing_user = get_user_by_email(
        db,
        user.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    return create_user(
        db,
        user,
    )


# =====================================================
# LOGIN
# =====================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):

    result = login_user(
        db,
        request.email,
        request.password,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    return result

# =====================================================
# SWAGGER / OAUTH2 LOGIN
# =====================================================

@router.post(
    "/token",
    response_model=TokenResponse,
)
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    result = login_user(
        db,
        form_data.username,
        form_data.password,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    return result
# =====================================================
# CURRENT USER
# =====================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def me(
    current_user: User = Depends(
        get_current_user
    ),
):

    return current_user
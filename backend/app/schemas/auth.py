from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):

    full_name: str = Field(
        min_length=2,
        max_length=150
    )

    email: EmailStr

    password: str = Field(
        min_length=6,
        max_length=100
    )

    phone_number: str | None = None


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


class TokenResponse(BaseModel):

    access_token: str

    token_type: str


class UserResponse(BaseModel):

    user_id: int
    full_name: str
    email: str
    phone_number: str | None = None
    role: str

    model_config = {
        "from_attributes": True
    }
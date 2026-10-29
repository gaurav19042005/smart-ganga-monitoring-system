from pydantic import BaseModel, EmailStr
from datetime import datetime


class RegisterEmailRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


class LoginEmailRequest(BaseModel):
    email: EmailStr


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str
    role: str
    is_active: bool
    email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
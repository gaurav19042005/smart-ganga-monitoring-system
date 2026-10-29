from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    phone = Column(String(15), unique=True, nullable=False, index=True)

    password = Column(String(255), nullable=True)

    role = Column(String(20), default="public")

    is_active = Column(Boolean, default=True)

    # Email verification
    email_verified = Column(Boolean, default=False)

    verification_token = Column(
        String(255),
        nullable=True,
        unique=True
    )

    verification_expires = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
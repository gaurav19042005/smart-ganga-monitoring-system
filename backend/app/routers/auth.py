from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    RegisterEmailRequest,
    LoginEmailRequest,
    UserResponse,
)
from app.services.auth import create_access_token
from app.auth.dependencies import get_current_user

import secrets
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

VERIFICATION_BASE_URL = os.getenv(
    "VERIFICATION_BASE_URL",
    "http://127.0.0.1:8000"
).rstrip("/")


# =========================================================
# NORMALIZE PHONE
# =========================================================

def normalize_phone(phone: str) -> str:
    phone = phone.strip().replace(" ", "").replace("-", "")

    if phone.startswith("0"):
        phone = "+91" + phone[1:]
    elif phone.startswith("91") and not phone.startswith("+"):
        phone = "+" + phone

    return phone


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
def register(
    request: RegisterEmailRequest,
    db: Session = Depends(get_db)
):
    phone = normalize_phone(request.phone)

    if not phone:
        raise HTTPException(
            status_code=400,
            detail="Mobile number is required"
        )

    # Check existing email
    existing_email = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_email:
        if existing_email.email_verified:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        db.delete(existing_email)
        db.commit()

    # Check existing phone
    existing_phone = (
        db.query(User)
        .filter(User.phone == phone)
        .first()
    )

    if existing_phone:
        if existing_phone.email_verified:
            raise HTTPException(
                status_code=400,
                detail="Mobile number already registered"
            )

        db.delete(existing_phone)
        db.commit()

    # Generate verification token
    verification_token = secrets.token_urlsafe(48)

    verification_expires = (
        datetime.now(timezone.utc)
        + timedelta(minutes=30)
    )

    # Create unverified user
    new_user = User(
        full_name=request.full_name,
        email=request.email,
        phone=phone,
        password=None,
        role="public",
        is_active=False,
        email_verified=False,
        verification_token=verification_token,
        verification_expires=verification_expires
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Build verification link
    verification_link = (
        f"{VERIFICATION_BASE_URL}/auth/verify-email"
        f"?token={verification_token}"
    )

    subject = "Smart Ganga - Verify Your Email"

    body = f"""Hello {new_user.full_name},

Welcome to the Smart Ganga Monitoring System.

Please verify your email address by clicking the link below:

{verification_link}

This verification link is valid for 30 minutes.

If you did not create this account, please ignore this email.

Regards,
Smart Ganga Monitoring System
"""

    # Send verification email and check the result
    try:
        from app.services.email_service import send_custom_email

        email_sent = send_custom_email(
            new_user.email,
            subject,
            body
        )

        if not email_sent:
            db.delete(new_user)
            db.commit()

            raise HTTPException(
                status_code=500,
                detail=(
                    "Verification email could not be sent. "
                    "Please try again later."
                )
            )

    except HTTPException:
        raise

    except Exception as exc:
        db.rollback()

        # Remove the unverified account if it still exists
        try:
            user_to_remove = (
                db.query(User)
                .filter(User.id == new_user.id)
                .first()
            )

            if user_to_remove and not user_to_remove.email_verified:
                db.delete(user_to_remove)
                db.commit()
        except Exception:
            db.rollback()

        print("EMAIL ERROR:", repr(exc))

        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email."
        )

    return {
        "status": "success",
        "message": (
            "Verification email accepted by the email server. "
            "Please check your inbox and spam folder."
        )
    }


# =========================================================
# VERIFY EMAIL
# =========================================================

@router.get(
    "/verify-email",
    response_class=HTMLResponse
)
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.verification_token == token)
        .first()
    )

    if not user:
        return HTMLResponse(
            """
            <!DOCTYPE html>
            <html>
            <head><title>Invalid Verification Link</title></head>
            <body style="font-family:Arial;text-align:center;padding:50px;">
                <h1>Invalid Verification Link</h1>
                <p>This link is invalid or has already been used.</p>
            </body>
            </html>
            """,
            status_code=400
        )

    now = datetime.now(timezone.utc)
    expiry = user.verification_expires

    if expiry:
        # Support databases that return timezone-naive datetimes
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)

        if expiry < now:
            return HTMLResponse(
                """
                <!DOCTYPE html>
                <html>
                <head><title>Link Expired</title></head>
                <body style="font-family:Arial;text-align:center;padding:50px;">
                    <h1>Verification Link Expired</h1>
                    <p>Please register again to request a new link.</p>
                </body>
                </html>
                """,
                status_code=400
            )

    user.email_verified = True
    user.is_active = True
    user.verification_token = None
    user.verification_expires = None

    db.commit()

    return HTMLResponse(
        """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Smart Ganga - Email Verified</title>
        </head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
            <h1>Email Verified Successfully!</h1>
            <p>Your Smart Ganga account has been verified.</p>
            <p>You can now return to the application and log in.</p>
            <h3>Smart Ganga Monitoring System</h3>
        </body>
        </html>
        """
    )


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(
    request: LoginEmailRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account found with this email"
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    access_token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role
        }
    )

    return {
        "status": "success",
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
    }


# =========================================================
# CURRENT USER PROFILE
# =========================================================

@router.get(
    "/profile",
    response_model=UserResponse
)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user
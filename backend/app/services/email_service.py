import os
import smtplib
import ssl
from pathlib import Path
from email.message import EmailMessage
from dotenv import load_dotenv

# Load backend/.env explicitly
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=ENV_FILE, override=False)


def send_custom_email(to_email: str, subject: str, body: str) -> bool:
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        print(f"EMAIL ERROR: SMTP credentials are missing. .env path: {ENV_FILE}")
        return False

    message = EmailMessage()
    message["From"] = smtp_email
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as server:
            server.ehlo()
            server.starttls(context=ssl.create_default_context())
            server.login(smtp_email, smtp_password)
            server.send_message(message)

        print(f"Email accepted by SMTP server for {to_email}")
        return True

    except Exception as exc:
        print(f"EMAIL ERROR: {exc!r}")
        return False


def send_otp_email(to_email: str, otp: str) -> bool:
    subject = "Smart Ganga - Email Verification"
    body = (
        "Hello,\n\n"
        f"Your Smart Ganga verification code is: {otp}\n\n"
        "Use this code to verify your email address. "
        "Do not share this code with anyone.\n\n"
        "Regards,\nSmart Ganga Team"
    )
    return send_custom_email(to_email, subject, body)
from datetime import datetime, timedelta
from typing import Any
from jose import JWTError, jwt
from app.config.settings import settings

def create_token(data: dict[str, Any], expires_delta: timedelta) -> str:
    """Helper to create a JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_access_token(user_id: str, role: str) -> str:
    """Create JWT access token (15 mins)"""
    expire = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_token(
        data={"sub": user_id, "role": role, "type": "access"},
        expires_delta=expire
    )

def create_refresh_token(user_id: str) -> str:
    """Create JWT refresh token (7 days)"""
    expire = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return create_token(
        data={"sub": user_id, "type": "refresh"},
        expires_delta=expire
    )

def create_verification_token(email: str) -> str:
    """Create email verification token (24 hours)"""
    expire = timedelta(hours=24)
    return create_token(
        data={"email": email, "type": "verification"},
        expires_delta=expire
    )

def decode_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# auto_error=False so we can raise our own 401 in get_current_user below.
# By default, HTTPBearer raises 403 (not 401) when no token is sent at all,
# which blurs the "not logged in" vs "logged in but not allowed" distinction.
oauth2_scheme = HTTPBearer(auto_error=False)


# ---------- Password helpers ----------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ---------- Access token (JWT) helpers ----------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": expire,
        "iat": now,
        "jti": secrets.token_hex(8),  # unique ID -- guarantees no two tokens collide
        "type": "access",
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------- Refresh token helpers ----------

def generate_refresh_token() -> Tuple[str, datetime]:
    """
    Generates an opaque, random refresh token (NOT a JWT) plus its expiry.
    This gets stored in the refresh_tokens table so it can actually be
    revoked on logout/rotation -- a stateless JWT alone can't do that.
    """
    token = secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return token, expires_at


# Imported here (not at the top) to avoid a circular import between
# auth.py and models.py.
from app.models import User, UserRole  # noqa: E402


# ---------- Dependencies for protected routes ----------

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extracts and validates the JWT from the Authorization header,
    then fetches the matching user from the database.
    Missing/invalid token -> 401. Use on any route that requires login.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")

    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is deactivated")

    return user


def require_role(required_role: UserRole):
    """
    Dependency factory: Depends(require_role(UserRole.admin)).
    Keeps role-check logic in one reusable place instead of duplicating
    it on every admin/coach-only route.
    """
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires '{required_role.value}' role",
            )
        return current_user
    return dependency


# Alias kept for compatibility with routes written in Milestone 1/2 already
# using require_admin directly.
require_admin = require_role(UserRole.admin)

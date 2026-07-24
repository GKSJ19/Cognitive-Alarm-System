from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, RefreshToken
from app.schemas import UserCreate, UserLogin, UserResponse, TokenPair, RefreshRequest
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    generate_refresh_token,
    get_current_user,
)
from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenPair)
@limiter.limit("30/minute")
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is deactivated")

    access_token = create_access_token(data={"user_id": user.id, "role": user.role.value})

    raw_refresh, expires_at = generate_refresh_token()
    db.add(RefreshToken(user_id=user.id, token=raw_refresh, expires_at=expires_at))
    db.commit()

    return TokenPair(access_token=access_token, refresh_token=raw_refresh)


@router.post("/refresh", response_model=TokenPair)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    """
    Exchanges a valid, unexpired, unrevoked refresh token for a new access
    token. The refresh token itself is rotated (old one revoked, new one
    issued) so a leaked/stolen refresh token can't be replayed indefinitely.
    """
    record = db.query(RefreshToken).filter(RefreshToken.token == payload.refresh_token).first()

    if record is not None:
        # SQLite doesn't preserve tzinfo the way PostgreSQL does, so a value
        # read back from the DB can come back naive even though it was
        # stored as UTC. Normalize before comparing to avoid a crash.
        expires_at = record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
    else:
        expires_at = None

    if not record or record.revoked or expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Account is unavailable")

    record.revoked = True
    new_raw_refresh, new_expires_at = generate_refresh_token()
    db.add(RefreshToken(user_id=user.id, token=new_raw_refresh, expires_at=new_expires_at))
    db.commit()

    new_access_token = create_access_token(data={"user_id": user.id, "role": user.role.value})
    return TokenPair(access_token=new_access_token, refresh_token=new_raw_refresh)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    payload: RefreshRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Revokes the given refresh token so it can no longer be used to get new
    access tokens. Requires a valid access token to call (proves the caller
    actually owns the session they're trying to end).
    """
    record = db.query(RefreshToken).filter(
        RefreshToken.token == payload.refresh_token,
        RefreshToken.user_id == current_user.id,
    ).first()
    if record:
        record.revoked = True
        db.commit()
    return None

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, RefreshToken, PasswordResetToken
from app.schemas import (
    UserCreate, UserLogin, UserResponse, TokenPair, RefreshRequest,
    GoogleSignInRequest, PasswordResetRequest, PasswordResetConfirm,
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    generate_refresh_token,
    generate_password_reset_token,
    get_current_user,
    is_locked_out,
    register_failed_login,
    clear_failed_logins,
)
from app.firebase import verify_firebase_token
from app.limiter import limiter
from app.audit import write_audit_log

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
    client_ip = request.client.host if request.client else None
    user = db.query(User).filter(User.email == credentials.email).first()

    # Check lockout BEFORE checking the password -- a locked account should
    # reject immediately, without even revealing whether the password given
    # would have been correct.
    if user and is_locked_out(user):
        write_audit_log(db, "login_blocked_locked", user_id=user.id, ip_address=client_ip)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account temporarily locked due to repeated failed logins. "
                   f"Try again later or use password reset.",
        )

    valid = user and user.hashed_password and verify_password(credentials.password, user.hashed_password)

    if not valid:
        if user:
            register_failed_login(db, user)
        write_audit_log(
            db, "login_failed",
            user_id=user.id if user else None,
            detail=f"email={credentials.email}",
            ip_address=client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        write_audit_log(db, "login_blocked_inactive", user_id=user.id, ip_address=client_ip)
        raise HTTPException(status_code=401, detail="Account is deactivated")

    clear_failed_logins(db, user)
    write_audit_log(db, "login_success", user_id=user.id, ip_address=client_ip)

    access_token = create_access_token(data={"user_id": user.id, "role": user.role.value})

    raw_refresh, expires_at = generate_refresh_token()
    db.add(RefreshToken(user_id=user.id, token=raw_refresh, expires_at=expires_at))
    db.commit()

    return TokenPair(access_token=access_token, refresh_token=raw_refresh)


@router.post("/google", response_model=TokenPair)
@limiter.limit("10/minute")
def google_sign_in(request: Request, payload: GoogleSignInRequest, db: Session = Depends(get_db)):
    """
    Exchanges a Firebase ID token (from Flutter's Google Sign-In) for this
    backend's own JWT access/refresh token pair. Finds an existing user by
    firebase_uid, or creates one on first sign-in. From here on, the
    frontend uses the SAME access_token/refresh_token flow as email/password
    login -- Firebase's token is not used again after this call.
    """
    decoded = verify_firebase_token(payload.firebase_id_token)
    firebase_uid = decoded["uid"]
    email = decoded.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email on file")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()

    if user is None:
        # First time this Firebase user has signed in -- check if an
        # email/password account already exists with the same email
        # before creating a new one, so we don't end up with duplicates.
        user = db.query(User).filter(User.email == email).first()

        if user is None:
            # Brand new user entirely
            base_username = email.split("@")[0]
            username = base_username
            suffix = 1
            while db.query(User).filter(User.username == username).first():
                suffix += 1
                username = f"{base_username}{suffix}"

            user = User(
                username=username,
                email=email,
                hashed_password=None,  # Google-only account -- no password
                firebase_uid=firebase_uid,
            )
            db.add(user)
        else:
            # Existing email/password account -- link it to this Firebase UID
            user.firebase_uid = firebase_uid

        db.commit()
        db.refresh(user)

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


@router.post("/password-reset/request", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("5/minute")
def request_password_reset(request: Request, payload: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Generates a single-use, short-lived password reset token.

    Always returns 202, whether or not the email exists -- this prevents
    an attacker from using this endpoint to discover which emails are
    registered ("account enumeration").

    DELIVERY MODE: no email-sending service is wired up yet, so in this
    dev/demo build the token is returned directly in the response so the
    flow can be tested end-to-end. Swap the `dev_reset_token` field out
    for an actual email send once the team decides on an email provider --
    see README_MILESTONE3.md for exactly where to make that change.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    response = {"message": "If that email is registered, a reset link has been sent."}

    if user is None:
        return response  # Same response either way -- don't leak account existence

    raw_token, expires_at = generate_password_reset_token()
    db.add(PasswordResetToken(user_id=user.id, token=raw_token, expires_at=expires_at))
    db.commit()

    write_audit_log(db, "password_reset_requested", user_id=user.id,
                     ip_address=request.client.host if request.client else None)

    # --- DEV MODE: remove this line once real email sending is wired up ---
    response["dev_reset_token"] = raw_token
    # ------------------------------------------------------------------

    return response


@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
def confirm_password_reset(request: Request, payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Verifies a reset token and sets the new password. Token is single-use."""
    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == payload.reset_token
    ).first()

    if record is not None:
        expires_at = record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
    else:
        expires_at = None

    if not record or record.used or expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.hashed_password = hash_password(payload.new_password)
    record.used = True

    # A password reset is also a good moment to clear any active lockout
    # and revoke all existing sessions, in case the reset was triggered
    # because the account was compromised.
    user.failed_login_attempts = 0
    user.locked_until = None
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id, RefreshToken.revoked == False  # noqa: E712
    ).update({"revoked": True})

    db.commit()

    write_audit_log(db, "password_reset_completed", user_id=user.id,
                     ip_address=request.client.host if request.client else None)

    return {"message": "Password has been reset successfully. Please log in again."}

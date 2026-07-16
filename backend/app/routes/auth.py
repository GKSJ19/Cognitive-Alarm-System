from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta

from app.dependencies import get_db, get_current_user
from app.models import User
from app.schemas import UserCreate, UserResponse, UserLogin, TokenResponse, TokenRefreshRequest, OAuthLoginRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.security import hash_password, verify_password, create_access_token, decode_access_token, create_reset_token


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user in the platform."""
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create new user
    hashed_pwd = hash_password(user_in.password)
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        password_hash=hashed_pwd,
        role=user_in.role.value,  # extract enum string
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=TokenResponse)
async def login(request: Request, db: Session = Depends(get_db)):
    """Authenticate a user using their email and password (supports both JSON and Form data)."""
    content_type = request.headers.get("content-type", "")
    email = None
    password = None
    
    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email")
            password = body.get("password")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body")
    else:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid form data")
            
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
        
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(days=7)
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=TokenResponse)
def refresh(refresh_in: TokenRefreshRequest, db: Session = Depends(get_db)):
    """Refresh session tokens."""
    payload = decode_access_token(refresh_in.refresh_token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    # Generate new tokens
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    new_refresh_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(days=7)
    )
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get profile of the currently logged-in user."""
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Perform a logout action (instruct client to clear their stored token)."""
    return {"detail": "Successfully logged out. Please discard token on client side."}


@router.post("/google", response_model=TokenResponse)
def login_google(req: OAuthLoginRequest, db: Session = Depends(get_db)):
    """Authenticate or register a user via Google OAuth."""
    token = req.id_token
    
    if token.startswith("mock_google_"):
        google_id = token
        email = req.email or f"{token}@example.com"
        full_name = req.full_name or "Google User"
    else:
        try:
            import jwt
            decoded = jwt.decode(token, options={"verify_signature": False})
            google_id = decoded.get("sub") or token
            email = decoded.get("email") or req.email or "google_user@example.com"
            full_name = decoded.get("name") or req.full_name or "Google User"
        except Exception:
            google_id = token
            email = req.email or "google_user@example.com"
            full_name = req.full_name or "Google User"

    user = db.query(User).filter((User.google_id == google_id) | (User.email == email)).first()
    if user:
        if not user.google_id:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
    else:
        user = User(
            email=email,
            full_name=full_name,
            google_id=google_id,
            password_hash=None,
            role="user",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(days=7)
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/apple", response_model=TokenResponse)
def login_apple(req: OAuthLoginRequest, db: Session = Depends(get_db)):
    """Authenticate or register a user via Apple ID."""
    token = req.id_token
    
    if token.startswith("mock_apple_"):
        apple_id = token
        email = req.email or f"{token}@example.com"
        full_name = req.full_name or "Apple User"
    else:
        try:
            import jwt
            decoded = jwt.decode(token, options={"verify_signature": False})
            apple_id = decoded.get("sub") or token
            email = decoded.get("email") or req.email or "apple_user@example.com"
            full_name = decoded.get("name") or req.full_name or "Apple User"
        except Exception:
            apple_id = token
            email = req.email or "apple_user@example.com"
            full_name = req.full_name or "Apple User"

    user = db.query(User).filter((User.apple_id == apple_id) | (User.email == email)).first()
    if user:
        if not user.apple_id:
            user.apple_id = apple_id
            db.commit()
            db.refresh(user)
    else:
        user = User(
            email=email,
            full_name=full_name,
            apple_id=apple_id,
            password_hash=None,
            role="user",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(days=7)
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a password reset token for the given email address."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user registered with this email address"
        )
    
    reset_token = create_reset_token(user.email)
    
    # In production, this would send an email with the link.
    # For local/testing, we return the token in the message.
    print(f"PASSWORD RESET REQUEST: token={reset_token}")
    
    return {
        "message": f"Password reset instructions sent. (Demo token: {reset_token})"
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset the user password using a valid reset token."""
    import jwt
    from app.config import settings
    try:
        payload = jwt.decode(req.token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
        email = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.password_hash = hash_password(req.new_password)
    db.commit()
    return {"message": "Password reset successful"}


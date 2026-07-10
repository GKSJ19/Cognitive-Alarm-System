from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.user_model import User
from app.services.auth_service import AuthService
from app.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    VerifyEmailRequest,
    SocialLoginRequest,
    TokenResponse,
    MessageResponse,
    UserInfo,
    RefreshRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account and trigger verification email"""
    return await AuthService.register_user(db, req)

@router.post("/verify-email", response_model=TokenResponse)
async def verify_email(req: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    """Verify user's email address using token and return user session"""
    return await AuthService.verify_email(db, req.token)

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with traditional email and password"""
    return await AuthService.login_user(db, req)

@router.post("/social-login", response_model=TokenResponse)
async def social_login(req: SocialLoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate or register via Google or Apple OAuth token"""
    return await AuthService.social_login_user(db, req)

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Initiate a password reset workflow"""
    return await AuthService.forgot_password(db, req)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Issue a new access and refresh token pair using a valid refresh token"""
    return await AuthService.refresh_tokens(db, req.refresh_token)

@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """Invalidate/logout current user session"""
    # JWT is stateless, client deletes token. Return success message.
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserInfo)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve authenticated user's profile information"""
    return current_user

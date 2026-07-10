from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user_model import User
from app.schemas.auth_schemas import RegisterRequest, LoginRequest, ForgotPasswordRequest, SocialLoginRequest
from app.utils.password import hash_password, verify_password
from app.utils.email import send_verification_email, send_password_reset_email
from app.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    create_verification_token,
    decode_token
)

class AuthService:
    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def register_user(db: AsyncSession, req: RegisterRequest) -> dict:
        # Check if email is already taken
        existing_user = await AuthService.get_user_by_email(db, req.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered"
            )

        # Create user
        hashed = hash_password(req.password)
        new_user = User(
            email=req.email,
            full_name=req.full_name,
            hashed_password=hashed,
            role=req.role,
            is_verified=True, # Email verification disabled; verify immediately
            is_active=True
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        # Send verification email (Disabled)
        # v_token = create_verification_token(new_user.email)
        # send_verification_email(new_user.email, v_token, new_user.full_name)

        return {"message": "Registration successful. You can now log in."}

    @staticmethod
    async def verify_email(db: AsyncSession, token: str) -> dict:
        payload = decode_token(token)
        if not payload or payload.get("type") != "verification":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )

        email = payload.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token payload"
            )

        user = await AuthService.get_user_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if user.is_verified:
            return {
                "access_token": create_access_token(user.id, user.role),
                "refresh_token": create_refresh_token(user.id),
                "token_type": "bearer",
                "user": user
            }

        # Mark user as verified
        user.is_verified = True
        await db.commit()
        await db.refresh(user)

        return {
            "access_token": create_access_token(user.id, user.role),
            "refresh_token": create_refresh_token(user.id),
            "token_type": "bearer",
            "user": user
        }

    @staticmethod
    async def login_user(db: AsyncSession, req: LoginRequest) -> dict:
        user = await AuthService.get_user_by_email(db, req.email)
        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated"
            )

        # Check email verification
        if not user.is_verified:
            # Re-send verification email
            v_token = create_verification_token(user.email)
            send_verification_email(user.email, v_token, user.full_name)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email is not verified. A new verification link has been sent to your email."
            )

        return {
            "access_token": create_access_token(user.id, user.role),
            "refresh_token": create_refresh_token(user.id),
            "token_type": "bearer",
            "user": user
        }

    @staticmethod
    async def social_login_user(db: AsyncSession, req: SocialLoginRequest) -> dict:
        # In production, we would verify the google/apple identity token.
        # e.g., using google.oauth2.id_token.verify_oauth2_token(req.identity_token, ...)
        # For development and offline testing, we will mock verification.
        # If client passes email & name, we use that.
        email = req.email
        full_name = req.full_name or "Social User"
        
        # Simple local/mock validation fallback if token isn't production verified
        if not email:
            # Decode the JWT token if possible to find email, or default
            payload = decode_token(req.identity_token)
            if payload:
                email = payload.get("email")
                full_name = payload.get("name", "Social User")
            else:
                # If no email is provided or decoded, fail.
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Social login token must contain email or request must pass email directly."
                )

        user = await AuthService.get_user_by_email(db, email)

        if not user:
            # Create user dynamically (Social users are verified by default)
            user = User(
                email=email,
                full_name=full_name,
                hashed_password=None, # No password
                role="user",
                is_verified=True,
                is_active=True
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is deactivated"
                )
            
            # If user exists but is not verified, auto-verify since social login validates email ownership
            if not user.is_verified:
                user.is_verified = True
                await db.commit()
                await db.refresh(user)

        return {
            "access_token": create_access_token(user.id, user.role),
            "refresh_token": create_refresh_token(user.id),
            "token_type": "bearer",
            "user": user
        }

    @staticmethod
    async def forgot_password(db: AsyncSession, req: ForgotPasswordRequest) -> dict:
        user = await AuthService.get_user_by_email(db, req.email)
        if user:
            # Generate reset token (use verification token format but label type)
            # In standard setup we can reuse jwt_handler
            # Let's send reset email
            token = create_verification_token(user.email)
            send_password_reset_email(user.email, token, user.full_name)

        # Always return success to prevent email enumeration attacks
        return {"message": "If the email is registered, a password reset link has been sent."}

    @staticmethod
    async def refresh_tokens(db: AsyncSession, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        user = await AuthService.get_user_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or deactivated"
            )

        return {
            "access_token": create_access_token(user.id, user.role),
            "refresh_token": create_refresh_token(user.id),
            "token_type": "bearer",
            "user": user
        }

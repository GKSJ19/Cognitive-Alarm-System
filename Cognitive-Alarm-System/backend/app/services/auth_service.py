from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import create_access_token, create_refresh_token
from app.repositories.user_repository import UserRepository
from app.utils.hash import hash_password, verify_password
from app.schemas.auth import RegisterRequest, LoginRequest
from app.models.user import User


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)

    async def register(self, payload: RegisterRequest) -> User:
        existing_user = await self.user_repo.get_by_email(payload.email)
        if existing_user:
            raise ValueError("Email already registered")

        user = User(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(payload.password),
            auth_provider="email",
            role="user",
            goal_type=payload.goal_type or "study",
            preferred_wake_time=payload.preferred_wake_time,
            sleep_duration_mins=payload.sleep_duration_mins,
            timezone=payload.timezone or "Asia/Kolkata",
            difficulty_pref=payload.difficulty_pref or "medium",
        )
        return await self.user_repo.create(user)

    async def login(self, payload: LoginRequest) -> tuple[str, str]:
        user = await self.user_repo.get_by_email(payload.email)
        if not user or not user.password_hash:
            raise ValueError("Incorrect email or password")

        if not verify_password(payload.password, user.password_hash):
            raise ValueError("Incorrect email or password")

        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))
        return access_token, refresh_token

    async def refresh_tokens(self, refresh_token: str) -> tuple[str, str]:
        from app.auth.jwt import decode_token

        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")

        user_id = payload.get("sub")
        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise ValueError("Invalid refresh token")

        return create_access_token(user_id), create_refresh_token(user_id)

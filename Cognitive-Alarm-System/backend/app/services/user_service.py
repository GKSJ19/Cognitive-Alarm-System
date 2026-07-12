from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate
from app.models.user import User


class UserService:
    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    async def get_profile(self, user_id: str) -> User | None:
        return await self.user_repo.get_by_id(user_id)

    async def update_profile(self, user_id: str, payload: UserUpdate) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(user, field, value)

        return await self.user_repo.update(user)

    async def deactivate_account(self, user_id: str) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        user.is_active = False
        return await self.user_repo.update(user)

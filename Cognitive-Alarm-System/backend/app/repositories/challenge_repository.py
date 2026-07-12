from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.challenge import Challenge


class ChallengeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(self) -> list[Challenge]:
        result = await self.session.execute(select(Challenge))
        return result.scalars().all()

    async def list_by_type(self, challenge_type: str) -> list[Challenge]:
        result = await self.session.execute(select(Challenge).where(Challenge.type == challenge_type))
        return result.scalars().all()

    async def get_by_id(self, challenge_id: str) -> Challenge | None:
        result = await self.session.execute(select(Challenge).where(Challenge.id == challenge_id))
        return result.scalars().first()

    async def get_random(self) -> Challenge | None:
        result = await self.session.execute(select(Challenge).order_by(func.random()).limit(1))
        return result.scalars().first()

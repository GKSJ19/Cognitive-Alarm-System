from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alarm import Alarm


class AlarmRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, alarm: Alarm) -> Alarm:
        self.session.add(alarm)
        await self.session.commit()
        await self.session.refresh(alarm)
        return alarm

    async def get_by_id(self, alarm_id: str) -> Alarm | None:
        result = await self.session.execute(select(Alarm).where(Alarm.id == alarm_id))
        return result.scalars().first()

    async def list_by_user(self, user_id: str) -> list[Alarm]:
        result = await self.session.execute(select(Alarm).where(Alarm.user_id == user_id))
        return result.scalars().all()

    async def delete(self, alarm: Alarm) -> None:
        await self.session.delete(alarm)
        await self.session.commit()

    async def update(self, alarm: Alarm) -> Alarm:
        await self.session.commit()
        await self.session.refresh(alarm)
        return alarm

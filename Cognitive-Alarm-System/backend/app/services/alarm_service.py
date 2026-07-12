from sqlalchemy.ext.asyncio import AsyncSession
from datetime import time

from app.repositories.alarm_repository import AlarmRepository
from app.models.alarm import Alarm
from app.schemas.alarm import AlarmCreate, AlarmUpdate


class AlarmService:
    def __init__(self, session: AsyncSession):
        self.alarm_repo = AlarmRepository(session)

    async def create_alarm(self, user_id: str, payload: AlarmCreate) -> Alarm:
        alarm = Alarm(
            user_id=user_id,
            time=payload.time,
            alarm_type=payload.alarm_type,
            days_of_week=payload.days_of_week,
            label=payload.label,
        )
        return await self.alarm_repo.create(alarm)

    async def list_alarms(self, user_id: str) -> list[Alarm]:
        return await self.alarm_repo.list_by_user(user_id)

    async def get_alarm(self, alarm_id: str) -> Alarm | None:
        return await self.alarm_repo.get_by_id(alarm_id)

    async def update_alarm(self, alarm_id: str, payload: AlarmUpdate) -> Alarm:
        alarm = await self.alarm_repo.get_by_id(alarm_id)
        if not alarm:
            raise ValueError("Alarm not found")

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(alarm, field, value)

        return await self.alarm_repo.update(alarm)

    async def delete_alarm(self, alarm_id: str) -> None:
        alarm = await self.alarm_repo.get_by_id(alarm_id)
        if not alarm:
            raise ValueError("Alarm not found")
        await self.alarm_repo.delete(alarm)

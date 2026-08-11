from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alarm import Alarm


async def create_alarm(session: AsyncSession, alarm: Alarm) -> Alarm:
    session.add(alarm)
    await session.commit()
    await session.refresh(alarm)
    return alarm


async def get_all_alarms(session: AsyncSession):
    result = await session.execute(select(Alarm))
    return result.scalars().all()


async def get_user_alarms(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(Alarm).where(Alarm.user_id == user_id)
    )
    return result.scalars().all()
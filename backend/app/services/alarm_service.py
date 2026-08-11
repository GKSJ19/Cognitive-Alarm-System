from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alarm import Alarm
from app.repositories.alarm_repository import (
    create_alarm as repo_create_alarm,
    get_all_alarms as repo_get_all_alarms,
    get_user_alarms as repo_get_user_alarms,
)
from app.schemas.alarm import AlarmCreate


async def create_alarm_service(
    session: AsyncSession,
    alarm_data: AlarmCreate,
):
    alarm = Alarm(
        user_id=alarm_data.user_id,
        title=alarm_data.title,
        alarm_time=alarm_data.alarm_time,
        challenge_type=alarm_data.challenge_type,
        difficulty=alarm_data.difficulty,
    )
    return await repo_create_alarm(session, alarm)


async def get_all_alarms_service(session: AsyncSession):
    return await repo_get_all_alarms(session)


async def get_user_alarms_service(session: AsyncSession, user_id: int):
    return await repo_get_user_alarms(session, user_id)
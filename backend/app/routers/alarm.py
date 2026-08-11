from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.alarm import AlarmCreate
from app.services.alarm_service import (
    create_alarm_service,
    get_all_alarms_service,
    get_user_alarms_service,
)

router = APIRouter(tags=["alarms"])


@router.post("/create")
async def create_alarm(
    alarm: AlarmCreate,
    db: AsyncSession = Depends(get_db),
):
    created_alarm = await create_alarm_service(db, alarm)

    return {
        "message": "Alarm stored in database successfully",
        "alarm_id": created_alarm.id,
    }


@router.get("/all")
async def get_all_alarms(
    db: AsyncSession = Depends(get_db),
):
    alarms = await get_all_alarms_service(db)
    return alarms


@router.get("/user/{user_id}")
async def get_user_alarms(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    alarms = await get_user_alarms_service(db, user_id)
    return alarms
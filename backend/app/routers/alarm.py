from fastapi import APIRouter

from app.schemas.alarm import AlarmCreate

router = APIRouter(tags=["alarms"])


@router.post("/create")
async def create_alarm(alarm: AlarmCreate):
    return {
        "message": "Alarm created successfully",
        "alarm": alarm,
    }
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.schemas.alarm import AlarmCreate, AlarmUpdate, AlarmOut
from app.services.alarm_service import AlarmService

router = APIRouter()


@router.post("/", response_model=AlarmOut)
async def create_alarm(payload: AlarmCreate, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    service = AlarmService(session)
    return await service.create_alarm(str(current_user.id), payload)


@router.get("/", response_model=list[AlarmOut])
async def list_alarms(session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    service = AlarmService(session)
    return await service.list_alarms(str(current_user.id))


@router.get("/{alarm_id}", response_model=AlarmOut)
async def get_alarm(alarm_id: str, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    service = AlarmService(session)
    alarm = await service.get_alarm(alarm_id)
    if not alarm or str(alarm.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alarm not found")
    return alarm


@router.put("/{alarm_id}", response_model=AlarmOut)
async def update_alarm(alarm_id: str, payload: AlarmUpdate, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    service = AlarmService(session)
    alarm = await service.get_alarm(alarm_id)
    if not alarm or str(alarm.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alarm not found")
    return await service.update_alarm(alarm_id, payload)


@router.delete("/{alarm_id}")
async def delete_alarm(alarm_id: str, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    service = AlarmService(session)
    alarm = await service.get_alarm(alarm_id)
    if not alarm or str(alarm.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alarm not found")
    await service.delete_alarm(alarm_id)
    return {"detail": "Alarm deleted"}

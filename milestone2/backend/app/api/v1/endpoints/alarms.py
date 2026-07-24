from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db
from app.models.alarm import AlarmModel, AlarmCreate, AlarmUpdate
from app.models.user import UserModel
from app.api.deps import get_current_active_user

router = APIRouter()

@router.post("/", response_model=AlarmModel)
async def create_alarm(
    alarm_in: AlarmCreate,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Create a new alarm."""
    alarm_dict = alarm_in.dict()
    alarm_dict["user_id"] = str(current_user.id)
    alarm_dict["created_at"] = datetime.utcnow()
    alarm_dict["updated_at"] = datetime.utcnow()

    result = await db["alarms"].insert_one(alarm_dict)
    alarm_dict["_id"] = result.inserted_id
    return AlarmModel(**alarm_dict)

@router.get("/", response_model=List[AlarmModel])
async def get_alarms(
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Get all alarms for current user."""
    alarms_cursor = db["alarms"].find({"user_id": str(current_user.id)})
    alarms = await alarms_cursor.to_list(length=200)
    return [AlarmModel(**alarm) for alarm in alarms]

@router.put("/{alarm_id}", response_model=AlarmModel)
async def update_alarm(
    alarm_id: str,
    alarm_in: AlarmUpdate,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Update an alarm."""
    if not ObjectId.is_valid(alarm_id):
        raise HTTPException(status_code=400, detail="Invalid alarm ID")

    alarm = await db["alarms"].find_one({"_id": ObjectId(alarm_id), "user_id": str(current_user.id)})
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")

    update_data = alarm_in.dict(exclude_none=True)
    update_data["updated_at"] = datetime.utcnow()
    await db["alarms"].update_one({"_id": ObjectId(alarm_id)}, {"$set": update_data})

    updated_alarm = await db["alarms"].find_one({"_id": ObjectId(alarm_id)})
    return AlarmModel(**updated_alarm)

@router.delete("/{alarm_id}")
async def delete_alarm(
    alarm_id: str,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Delete an alarm."""
    if not ObjectId.is_valid(alarm_id):
        raise HTTPException(status_code=400, detail="Invalid alarm ID")

    result = await db["alarms"].delete_one({"_id": ObjectId(alarm_id), "user_id": str(current_user.id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alarm not found")

    return {"message": "Alarm deleted successfully"}

@router.patch("/{alarm_id}/toggle", response_model=AlarmModel)
async def toggle_alarm(
    alarm_id: str,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Toggle alarm enabled/disabled."""
    if not ObjectId.is_valid(alarm_id):
        raise HTTPException(status_code=400, detail="Invalid alarm ID")

    alarm = await db["alarms"].find_one({"_id": ObjectId(alarm_id), "user_id": str(current_user.id)})
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")

    new_state = not alarm["is_active"]
    await db["alarms"].update_one(
        {"_id": ObjectId(alarm_id)},
        {"$set": {"is_active": new_state, "updated_at": datetime.utcnow()}}
    )

    updated_alarm = await db["alarms"].find_one({"_id": ObjectId(alarm_id)})
    return AlarmModel(**updated_alarm)

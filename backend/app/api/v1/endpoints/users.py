from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Any
from bson import ObjectId
import base64

from app.core.database import get_db
from app.models.user import UserModel, UserProfileModel, UserProfileUpdate
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/profile", response_model=UserProfileModel)
async def get_user_profile(current_user: UserModel = Depends(get_current_user), db = Depends(get_db)) -> Any:
    """Get current user profile."""
    profile = await db["user_profiles"].find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserProfileModel(**profile)

@router.put("/profile", response_model=UserProfileModel)
async def update_user_profile(
    profile_in: UserProfileUpdate,
    current_user: UserModel = Depends(get_current_user),
    db = Depends(get_db)
) -> Any:
    """Update current user profile."""
    profile_data = profile_in.dict(exclude_none=True)
    await db["user_profiles"].update_one(
        {"user_id": current_user.id},
        {"$set": profile_data},
        upsert=True
    )
    updated_profile = await db["user_profiles"].find_one({"user_id": current_user.id})
    return UserProfileModel(**updated_profile)

@router.post("/profile/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db = Depends(get_db)
) -> Any:
    """Upload profile picture (stored as base64 in MongoDB)."""
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")
    
    encoded = base64.b64encode(contents).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{encoded}"
    
    await db["user_profiles"].update_one(
        {"user_id": current_user.id},
        {"$set": {"profile_image": data_url}},
        upsert=True
    )
    return {"message": "Profile picture uploaded successfully", "profile_image": data_url}

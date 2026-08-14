from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.user_model import User
from app.schemas.profile_schemas import ProfileResponse, ProfileUpdate
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the current user's profile details."""
    return await ProfileService.get_profile_by_user_id(db, current_user.id)

@router.put("", response_model=ProfileResponse)
async def update_profile(
    req: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update profile details for the authenticated user."""
    return await ProfileService.update_profile(db, current_user.id, req)

@router.post("/photo", response_model=ProfileResponse)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a new profile picture."""
    return await ProfileService.save_profile_photo(db, current_user.id, file)

@router.delete("/photo", response_model=ProfileResponse)
async def delete_profile_photo(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove user's profile picture."""
    return await ProfileService.delete_profile_photo(db, current_user.id)

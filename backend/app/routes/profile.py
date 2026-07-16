import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, UserProfile
from app.schemas import UserProfileResponse, UserProfileUpdate

router = APIRouter(prefix="/profile", tags=["Profile"])

AVATARS_DIR = os.path.join("static", "avatars")

@router.get("", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch current user's profile. Creates a default profile if not found."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            timezone="UTC"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=UserProfileResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile details."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/photo", response_model=UserProfileResponse)
def upload_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a profile picture and link it to user profile."""
    # Ensure avatars directory exists
    os.makedirs(AVATARS_DIR, exist_ok=True)
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Clean old file if it exists
    if profile.profile_photo:
        old_path = profile.profile_photo.lstrip("/")
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception:
                pass

    # Save new file
    file_extension = os.path.splitext(file.filename)[1]
    safe_filename = f"{current_user.id}_{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(AVATARS_DIR, safe_filename)
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # Set profile photo URI (relative path)
    profile.profile_photo = f"/static/avatars/{safe_filename}"
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/photo", response_model=UserProfileResponse)
def delete_photo(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete the profile photo path and delete file locally."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile or not profile.profile_photo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No profile photo to delete"
        )
    
    # Delete physical file
    old_path = profile.profile_photo.lstrip("/")
    if os.path.exists(old_path):
        try:
            os.remove(old_path)
        except Exception:
            pass

    profile.profile_photo = None
    db.commit()
    db.refresh(profile)
    return profile

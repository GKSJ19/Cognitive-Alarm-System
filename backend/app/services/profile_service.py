import os
import shutil
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import UploadFile
from app.models.profile_model import UserProfile
from app.schemas.profile_schemas import ProfileUpdate

class ProfileService:
    @staticmethod
    async def get_profile_by_user_id(db: AsyncSession, user_id: str) -> UserProfile:
        """Fetch user profile by user_id. Auto-creates profile if not exists."""
        result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = result.scalars().first()
        if not profile:
            # Create a default profile
            profile = UserProfile(user_id=user_id)
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
        return profile

    @staticmethod
    async def update_profile(db: AsyncSession, user_id: str, data: ProfileUpdate) -> UserProfile:
        """Update profile fields"""
        profile = await ProfileService.get_profile_by_user_id(db, user_id)
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)
            
        await db.commit()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def save_profile_photo(db: AsyncSession, user_id: str, file: UploadFile) -> UserProfile:
        """Save profile photo to local disk and update database"""
        # Ensure upload directory exists
        upload_dir = os.path.join("static", "uploads", "profiles")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Determine file extension and build name
        _, ext = os.path.splitext(file.filename or "")
        filename = f"{user_id}{ext}"
        filepath = os.path.join(upload_dir, filename)
        
        # Save file
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Update profile
        profile = await ProfileService.get_profile_by_user_id(db, user_id)
        
        # Set photo URL paths relative to root or static route
        photo_url = f"/static/uploads/profiles/{filename}"
        profile.profile_photo = photo_url
        
        await db.commit()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def delete_profile_photo(db: AsyncSession, user_id: str) -> UserProfile:
        """Remove profile photo references and files if they exist"""
        profile = await ProfileService.get_profile_by_user_id(db, user_id)
        if profile.profile_photo:
            # Check file on disk and delete
            filepath = profile.profile_photo.lstrip("/")
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except Exception as e:
                    print(f"Error removing file {filepath}: {e}")
            profile.profile_photo = None
            await db.commit()
            await db.refresh(profile)
        return profile

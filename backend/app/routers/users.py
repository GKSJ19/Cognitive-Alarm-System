import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db_session
from app.dependencies.auth import get_current_user, RoleChecker
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.user import UserUpdate, UserResponse
from app.schemas.profile import UserProfileUpdate, UserProfileResponse
from app.core.security import get_password_hash

router = APIRouter()

# Admin-only dependency
admin_required = RoleChecker(allowed_roles=["admin"])

@router.get("/", response_model=list[UserResponse])
async def list_users(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(admin_required),
) -> Any:
    result = await session.execute(
        select(User).options(selectinload(User.role), selectinload(User.profile))
    )
    return result.scalars().all()

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Allow if Admin or accessing self
    is_admin = current_user.is_superuser or (current_user.role and current_user.role.name == "admin")
    if not is_admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user")
    
    result = await session.execute(
        select(User)
        .options(selectinload(User.role), selectinload(User.profile))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    user_in: UserUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Allow if Admin or updating self
    is_admin = current_user.is_superuser or (current_user.role and current_user.role.name == "admin")
    if not is_admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    result = await session.execute(
        select(User)
        .options(selectinload(User.role), selectinload(User.profile))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        user.hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        
    if "role_id" in update_data:
        if not is_admin:
            raise HTTPException(status_code=403, detail="Only admins can change user roles")
        # Ensure the role exists
        if update_data["role_id"] is not None:
            from app.models.role import Role
            role_result = await session.execute(select(Role).where(Role.id == update_data["role_id"]))
            if not role_result.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Invalid role_id")
                
    for field, value in update_data.items():
        setattr(user, field, value)
        
    await session.commit()
    await session.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(admin_required),
) -> Any:
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await session.delete(user)
    await session.commit()
    return None

# Profile sub-endpoints
@router.get("/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    is_admin = current_user.is_superuser or (current_user.role and current_user.role.name == "admin")
    if not is_admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this profile")
    
    result = await session.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=user_id)
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
    return profile

@router.put("/{user_id}/profile", response_model=UserProfileResponse)
async def update_user_profile(
    user_id: uuid.UUID,
    profile_in: UserProfileUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    is_admin = current_user.is_superuser or (current_user.role and current_user.role.name == "admin")
    if not is_admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    result = await session.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=user_id)
        session.add(profile)
        
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
        
    await session.commit()
    await session.refresh(profile)
    return profile

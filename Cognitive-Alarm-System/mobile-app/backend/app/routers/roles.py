import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db_session
from app.dependencies.auth import get_current_user, RoleChecker
from app.models.user import User
from app.models.role import Role
from app.schemas.role import RoleCreate, RoleResponse
from app.schemas.user import UserResponse

router = APIRouter()

# Admin-only dependency
admin_required = RoleChecker(allowed_roles=["admin"])

@router.get("/", response_model=list[RoleResponse])
async def list_roles(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(admin_required),
) -> Any:
    result = await session.execute(select(Role))
    return result.scalars().all()

@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_in: RoleCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(admin_required),
) -> Any:
    result = await session.execute(select(Role).where(Role.name == role_in.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Role already exists")
    
    role = Role(
        name=role_in.name,
        description=role_in.description,
    )
    session.add(role)
    await session.commit()
    await session.refresh(role)
    return role

@router.put("/users/{user_id}", response_model=UserResponse)
async def assign_role(
    user_id: uuid.UUID,
    role_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(admin_required),
) -> Any:
    user_result = await session.execute(
        select(User)
        .options(selectinload(User.role), selectinload(User.profile))
        .where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    role_result = await session.execute(select(Role).where(Role.id == role_id))
    role = role_result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    user.role_id = role_id
    await session.commit()
    await session.refresh(user)
    return user

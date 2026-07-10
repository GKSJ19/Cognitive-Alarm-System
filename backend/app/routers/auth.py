from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.database.session import get_db_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    session: AsyncSession = Depends(get_db_session),
) -> Any:
    from app.models.role import Role
    from app.models.profile import UserProfile
    from sqlalchemy.orm import selectinload

    # Check if user exists
    result = await session.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Assign default 'user' role if exists
    role_result = await session.execute(select(Role).where(Role.name == "user"))
    default_role = role_result.scalar_one_or_none()
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role_id=default_role.id if default_role else None,
    )
    session.add(user)
    await session.flush()  # Populate user.id

    # Create associated profile
    profile = UserProfile(user_id=user.id)
    session.add(profile)
    
    await session.commit()
    
    # Eagerly load relations for the response schema
    result = await session.execute(
        select(User)
        .options(selectinload(User.role), selectinload(User.profile))
        .where(User.id == user.id)
    )
    user = result.scalar_one()
    return user

@router.post("/login", response_model=Token)
async def login(
    session: AsyncSession = Depends(get_db_session),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    result = await session.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    return current_user

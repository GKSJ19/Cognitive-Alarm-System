from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from datetime import timedelta, datetime
from bson import ObjectId

from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.database import get_db
from app.models.user import UserModel, UserCreate
from app.api.deps import get_current_user

router = APIRouter()

REFRESH_TOKEN_EXPIRE_DAYS = 30

@router.post("/register", response_model=UserModel)
async def register(user_in: UserCreate, db = Depends(get_db)) -> Any:
    """Register a new user."""
    user_exists = await db["users"].find_one({"email": user_in.email})
    if user_exists:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists",
        )

    user_dict = {
        "email": user_in.email,
        "full_name": user_in.full_name,
        "hashed_password": get_password_hash(user_in.password),
        "is_active": True,
        "role": "user",
        "created_at": datetime.utcnow()
    }

    result = await db["users"].insert_one(user_dict)
    user_dict["_id"] = result.inserted_id

    # Initialize profile
    profile_dict = {
        "user_id": result.inserted_id,
        "full_name": user_in.full_name,
        "phone": None,
        "profile_image": None,
        "age": None,
        "gender": None,
        "time_zone": "UTC",
        "preferred_wakeup_time": "07:00",
        "sleep_duration_goal": 8.0,
        "productivity_goals": [],
        "difficulty_preference": "Medium",
        "habit_preferences": [],
    }
    await db["user_profiles"].insert_one(profile_dict)

    return UserModel(**user_dict)


@router.post("/login")
async def login(db = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """OAuth2 compatible token login."""
    user = await db["users"].find_one({"email": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user["is_active"]:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(str(user["_id"]), expires_delta=access_token_expires)

    # Create refresh token
    refresh_token = create_refresh_token()
    refresh_expires = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    await db["refresh_tokens"].insert_one({
        "user_id": str(user["_id"]),
        "token": refresh_token,
        "expires_at": refresh_expires,
        "is_revoked": False,
        "created_at": datetime.utcnow()
    })

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh-token")
async def refresh_token(token: str = Body(..., embed=True), db = Depends(get_db)) -> Any:
    """Get new access token using refresh token."""
    stored = await db["refresh_tokens"].find_one({"token": token, "is_revoked": False})
    if not stored:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    if stored["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expired")

    # Rotate refresh token
    await db["refresh_tokens"].update_one({"_id": stored["_id"]}, {"$set": {"is_revoked": True}})

    new_refresh_token = create_refresh_token()
    refresh_expires = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    await db["refresh_tokens"].insert_one({
        "user_id": stored["user_id"],
        "token": new_refresh_token,
        "expires_at": refresh_expires,
        "is_revoked": False,
        "created_at": datetime.utcnow()
    })

    access_token = create_access_token(stored["user_id"])
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


@router.post("/logout")
async def logout(token: str = Body(..., embed=True), db = Depends(get_db)) -> Any:
    """Revoke refresh token (logout)."""
    await db["refresh_tokens"].update_many({"token": token}, {"$set": {"is_revoked": True}})
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserModel)
async def read_users_me(current_user: UserModel = Depends(get_current_user)):
    """Get current user."""
    return current_user

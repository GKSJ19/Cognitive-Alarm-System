from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.schemas.user_profile import (
    UserProfileCreate,
    UserProfileUpdate,
    UserProfileResponse
)

from app.services.user_profile_service import (
    create_profile,
    get_all_profiles,
    get_profile_by_id,
    update_profile,
    delete_profile
)

router = APIRouter(
    prefix="/profile",
    tags=["User Profile"]
)


@router.post(
    "/",
    response_model=UserProfileResponse,
    status_code=201
)
def create(
    profile: UserProfileCreate,
    db: Session = Depends(get_db)
):

    return create_profile(db, profile)


@router.get(
    "/",
    response_model=list[UserProfileResponse]
)
def get_all(
    db: Session = Depends(get_db)
):

    return get_all_profiles(db)


@router.get(
    "/{profile_id}",
    response_model=UserProfileResponse
)
def get_one(
    profile_id: int,
    db: Session = Depends(get_db)
):

    return get_profile_by_id(db, profile_id)


@router.put(
    "/{profile_id}",
    response_model=UserProfileResponse
)
def update(
    profile_id: int,
    profile: UserProfileUpdate,
    db: Session = Depends(get_db)
):

    return update_profile(
        db,
        profile_id,
        profile
    )


@router.delete("/{profile_id}")
def delete(
    profile_id: int,
    db: Session = Depends(get_db)
):

    return delete_profile(
        db,
        profile_id
    )
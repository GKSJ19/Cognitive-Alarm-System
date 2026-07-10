from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user_profile import UserProfile
from app.schemas.user_profile import UserProfileCreate, UserProfileUpdate


def create_profile(db: Session, profile: UserProfileCreate):

    existing = db.query(UserProfile).filter(
        UserProfile.email == profile.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )

    new_profile = UserProfile(**profile.model_dump())

    try:
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)

        return new_profile

    except Exception:
        db.rollback()
        raise


def get_all_profiles(db: Session):

    return db.query(UserProfile).all()


def get_profile_by_id(db: Session, profile_id: int):

    profile = db.query(UserProfile).filter(
        UserProfile.id == profile_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return profile


def update_profile(
    db: Session,
    profile_id: int,
    profile: UserProfileUpdate
):

    existing = db.query(UserProfile).filter(
        UserProfile.id == profile_id
    ).first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    update_data = profile.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(existing, key, value)

    db.commit()
    db.refresh(existing)

    return existing


def delete_profile(
    db: Session,
    profile_id: int
):

    profile = db.query(UserProfile).filter(
        UserProfile.id == profile_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    db.delete(profile)
    db.commit()

    return {
        "message": "Profile deleted successfully"
    }
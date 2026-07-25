from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.verification import VerificationCreate, VerificationResponse
from app.services.verification_service import (
    create_verification,
    get_all_verifications,
    get_verification_by_id,
    delete_verification
)

router = APIRouter(
    prefix="/verification",
    tags=["Wake-Up Verification"]
)


@router.post("/", response_model=VerificationResponse)
def create(verification: VerificationCreate, db: Session = Depends(get_db)):
    return create_verification(db, verification)


@router.get("/", response_model=list[VerificationResponse])
def get_all(db: Session = Depends(get_db)):
    return get_all_verifications(db)


@router.get("/{verification_id}", response_model=VerificationResponse)
def get_one(verification_id: int, db: Session = Depends(get_db)):
    verification = get_verification_by_id(db, verification_id)

    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")

    return verification


@router.delete("/{verification_id}")
def delete(verification_id: int, db: Session = Depends(get_db)):
    verification = delete_verification(db, verification_id)

    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")

    return {"message": "Verification deleted successfully"}
from sqlalchemy.orm import Session
from app.models.verification import Verification
from app.schemas.verification import VerificationCreate


def create_verification(db: Session, verification: VerificationCreate):
    is_correct = verification.user_answer.strip().lower() == verification.correct_answer.strip().lower()

    db_verification = Verification(
        user_id=verification.user_id,
        challenge_id=verification.challenge_id,
        user_answer=verification.user_answer,
        correct_answer=verification.correct_answer,
        is_correct=is_correct
    )

    db.add(db_verification)
    db.commit()
    db.refresh(db_verification)

    return db_verification


def get_all_verifications(db: Session):
    return db.query(Verification).all()


def get_verification_by_id(db: Session, verification_id: int):
    return db.query(Verification).filter(
        Verification.id == verification_id
    ).first()


def delete_verification(db: Session, verification_id: int):
    verification = db.query(Verification).filter(
        Verification.id == verification_id
    ).first()

    if verification:
        db.delete(verification)
        db.commit()

    return verification
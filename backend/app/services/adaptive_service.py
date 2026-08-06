from sqlalchemy.orm import Session
from app.models.adaptive_difficulty import AdaptiveDifficulty

def create_adaptive(db: Session, data):

    if data.success_rate >= 80:
        level = "Hard"
    elif data.success_rate >= 50:
        level = "Medium"
    else:
        level = "Easy"

    adaptive = AdaptiveDifficulty(
        user_id=data.user_id,
        success_rate=data.success_rate,
        current_level=data.current_level,
        next_level=level
    )

    db.add(adaptive)
    db.commit()
    db.refresh(adaptive)

    return adaptive


def get_all(db: Session):
    return db.query(AdaptiveDifficulty).all()


def get_by_id(db: Session, adaptive_id: int):
    return db.query(AdaptiveDifficulty).filter(
        AdaptiveDifficulty.id == adaptive_id
    ).first()


def delete(db: Session, adaptive_id: int):

    adaptive = db.query(AdaptiveDifficulty).filter(
        AdaptiveDifficulty.id == adaptive_id
    ).first()

    if adaptive:
        db.delete(adaptive)
        db.commit()

    return adaptive
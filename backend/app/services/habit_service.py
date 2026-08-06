from sqlalchemy.orm import Session
from app.models.habit_score import HabitScore

def create_habit(db: Session, data):

    overall = (
        data.wakeup_score * 0.35 +
        data.challenge_score * 0.25 +
        data.snooze_score * 0.20 +
        data.sleep_score * 0.20
    )

    if overall >= 80:
        grade = "Excellent"
    elif overall >= 60:
        grade = "Good"
    elif overall >= 40:
        grade = "Average"
    else:
        grade = "Poor"

    habit = HabitScore(
        user_id=data.user_id,
        wakeup_score=data.wakeup_score,
        challenge_score=data.challenge_score,
        snooze_score=data.snooze_score,
        sleep_score=data.sleep_score,
        overall_score=overall,
        grade=grade
    )

    db.add(habit)
    db.commit()
    db.refresh(habit)

    return habit


def get_all(db: Session):
    return db.query(HabitScore).all()


def get_by_id(db: Session, habit_id: int):
    return db.query(HabitScore).filter(
        HabitScore.id == habit_id
    ).first()


def delete(db: Session, habit_id: int):

    habit = db.query(HabitScore).filter(
        HabitScore.id == habit_id
    ).first()

    if habit:
        db.delete(habit)
        db.commit()

    return habit
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.habit_score import HabitScoreCreate
from app.services import habit_service

router = APIRouter(
    prefix="/habit",
    tags=["Habit Score"]
)


@router.post("/")
def create(data: HabitScoreCreate,
           db: Session = Depends(get_db)):
    return habit_service.create_habit(db, data)


@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return habit_service.get_all(db)


@router.get("/{habit_id}")
def get_by_id(habit_id: int,
              db: Session = Depends(get_db)):
    return habit_service.get_by_id(db, habit_id)


@router.delete("/{habit_id}")
def delete(habit_id: int,
           db: Session = Depends(get_db)):
    return habit_service.delete(db, habit_id)
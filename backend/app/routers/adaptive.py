from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.adaptive_difficulty import AdaptiveDifficultyCreate
from app.services import adaptive_service

router = APIRouter(
    prefix="/adaptive",
    tags=["Adaptive Difficulty"]
)


@router.post("/")
def create(data: AdaptiveDifficultyCreate,
           db: Session = Depends(get_db)):
    return adaptive_service.create_adaptive(db, data)


@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return adaptive_service.get_all(db)


@router.get("/{adaptive_id}")
def get_by_id(adaptive_id: int,
              db: Session = Depends(get_db)):
    return adaptive_service.get_by_id(db, adaptive_id)


@router.delete("/{adaptive_id}")
def delete(adaptive_id: int,
           db: Session = Depends(get_db)):
    return adaptive_service.delete(db, adaptive_id)
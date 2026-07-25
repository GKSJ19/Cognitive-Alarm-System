from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.schemas.evaluation import EvaluationCreate, EvaluationResponse
from app.services import evaluation_service

router = APIRouter(
    prefix="/evaluation",
    tags=["Challenge Evaluation"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=EvaluationResponse)
def create_evaluation(
    evaluation: EvaluationCreate,
    db: Session = Depends(get_db)
):
    return evaluation_service.create_evaluation(db, evaluation)


@router.get("/", response_model=list[EvaluationResponse])
def get_all(db: Session = Depends(get_db)):
    return evaluation_service.get_all_evaluations(db)


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
def get_one(
    evaluation_id: int,
    db: Session = Depends(get_db)
):
    evaluation = evaluation_service.get_evaluation(db, evaluation_id)

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    return evaluation


@router.delete("/{evaluation_id}")
def delete(
    evaluation_id: int,
    db: Session = Depends(get_db)
):
    evaluation = evaluation_service.delete_evaluation(db, evaluation_id)

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    return {"message": "Evaluation deleted successfully"}
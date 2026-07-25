from sqlalchemy.orm import Session
from app.models.evaluation import ChallengeEvaluation
from app.schemas.evaluation import EvaluationCreate


def create_evaluation(db: Session, evaluation: EvaluationCreate):

    new_eval = ChallengeEvaluation(
        user_id=evaluation.user_id,
        challenge_id=evaluation.challenge_id,
        score=evaluation.score,
        attempts=evaluation.attempts,
        time_taken=evaluation.time_taken,
        status=evaluation.status
    )

    db.add(new_eval)
    db.commit()
    db.refresh(new_eval)

    return new_eval


def get_all_evaluations(db: Session):
    return db.query(ChallengeEvaluation).all()


def get_evaluation(db: Session, evaluation_id: int):
    return db.query(ChallengeEvaluation).filter(
        ChallengeEvaluation.id == evaluation_id
    ).first()


def delete_evaluation(db: Session, evaluation_id: int):
    evaluation = db.query(ChallengeEvaluation).filter(
        ChallengeEvaluation.id == evaluation_id
    ).first()

    if evaluation:
        db.delete(evaluation)
        db.commit()

    return evaluation
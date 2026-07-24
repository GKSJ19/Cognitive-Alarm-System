from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.alarm_trigger import AlarmTrigger, VerificationStatus
from app.models.challenge import Challenge, ChallengeType, Difficulty
from app.models.challenge_attempt import ChallengeAttempt
from app.models.user import User
from app.schema.verification import (
    TriggerAlarmRequest, TriggerAlarmResponse,
    VerifyAttemptRequest, VerifyAttemptResponse,
)
from app.services.challenge_service.engine import generate_challenge
from app.services.difficulty_service import calculate_difficulty

router = APIRouter()

@router.post("/trigger", response_model=TriggerAlarmResponse)
def trigger_alarm(
    payload: TriggerAlarmRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trigger = AlarmTrigger(
        alarm_id=payload.alarm_id,
        user_id=current_user,
        verification_status=VerificationStatus.pending,
    )
    db.add(trigger)
    db.commit()
    db.refresh(trigger)

    user = db.query(User).filter(User.id == current_user).first()
    difficulty_str, _, _ = calculate_difficulty(current_user, db)
    category, question, answer = generate_challenge(
        goal_type=user.goal_type if user else None,
        difficulty=difficulty_str,
    )
    challenge = Challenge(
        type=ChallengeType(category),
        difficulty=Difficulty(difficulty_str),
        question=question,
        correct_answer=answer,
        source="question_bank",
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    return {
        "trigger_id": trigger.id,
        "challenge_id": challenge.id,
        "category": category,
        "question": question,
    }

@router.post("/attempt", response_model=VerifyAttemptResponse)
def verify_attempt(
    payload: VerifyAttemptRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trigger = db.query(AlarmTrigger).filter(AlarmTrigger.id == payload.trigger_id).first()
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger not found")

    challenge = db.query(Challenge).filter(Challenge.id == payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    is_correct = payload.submitted_answer.strip().lower() == challenge.correct_answer.strip().lower()

    trigger.total_attempts += 1
    attempt = ChallengeAttempt(
        alarm_trigger_id=trigger.id,
        challenge_id=challenge.id,
        attempt_number=trigger.total_attempts,
        is_correct=is_correct,
    )
    db.add(attempt)

    if is_correct:
        trigger.verification_status = VerificationStatus.passed
    else:
        trigger.verification_status = VerificationStatus.failed

    db.commit()
    db.refresh(trigger)

    return {
        "is_correct": is_correct,
        "verification_status": trigger.verification_status.value,
        "total_attempts": trigger.total_attempts,
    }
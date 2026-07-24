from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.challenge import Challenge, ChallengeType, Difficulty
from app.models.challenge_attempt import ChallengeAttempt
from app.models.alarm_trigger import AlarmTrigger, VerificationStatus
from app.schema.challenge import (
    ChallengeGenerateResponse, ChallengeVerifyRequest, ChallengeVerifyResponse,
    ChallengeStatsResponse,
)
from app.services.challenge_service.engine import generate_challenge
from app.services.difficulty_service import calculate_difficulty

router = APIRouter()

@router.get("/generate", response_model=ChallengeGenerateResponse)
def generate(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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
    return {"challenge_id": challenge.id, "category": category, "question": question}

@router.post("/verify", response_model=ChallengeVerifyResponse)
def verify(
    payload: ChallengeVerifyRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    challenge = db.query(Challenge).filter(Challenge.id == payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    trigger = None
    if payload.alarm_trigger_id is not None:
        trigger = db.query(AlarmTrigger).filter(AlarmTrigger.id == payload.alarm_trigger_id).first()
        if not trigger or str(trigger.user_id) != str(current_user):
            raise HTTPException(status_code=404, detail="Alarm trigger not found")

    is_correct = payload.submitted_answer.strip().lower() == challenge.correct_answer.strip().lower()

    previous_attempts = (
        db.query(ChallengeAttempt)
        .filter(ChallengeAttempt.challenge_id == challenge.id)
        .count()
    )

    attempt = ChallengeAttempt(
        alarm_trigger_id=payload.alarm_trigger_id,
        challenge_id=challenge.id,
        attempt_number=previous_attempts + 1,
        is_correct=is_correct,
        time_taken_seconds=payload.time_taken_seconds,
    )
    db.add(attempt)

    if trigger is not None:
        trigger.total_attempts = (trigger.total_attempts or 0) + 1
        if is_correct:
            trigger.verification_status = VerificationStatus.passed

    db.commit()

    return {"is_correct": is_correct}

@router.get("/stats", response_model=ChallengeStatsResponse)
def challenge_stats(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempts = (
        db.query(ChallengeAttempt)
        .join(AlarmTrigger, ChallengeAttempt.alarm_trigger_id == AlarmTrigger.id)
        .filter(AlarmTrigger.user_id == current_user)
        .all()
    )

    total = len(attempts)
    correct = sum(1 for a in attempts if a.is_correct)
    accuracy = round((correct / total) * 100, 1) if total > 0 else 0.0

    by_category = {}
    for attempt in attempts:
        challenge = db.query(Challenge).filter(Challenge.id == attempt.challenge_id).first()
        if not challenge:
            continue
        cat = challenge.type.value
        if cat not in by_category:
            by_category[cat] = {"total": 0, "correct": 0}
        by_category[cat]["total"] += 1
        if attempt.is_correct:
            by_category[cat]["correct"] += 1

    for cat, stats in by_category.items():
        stats["accuracy_percent"] = round((stats["correct"] / stats["total"]) * 100, 1) if stats["total"] > 0 else 0.0

    return {
        "total_attempts": total,
        "correct_attempts": correct,
        "accuracy_percent": accuracy,
        "by_category": by_category,
    }
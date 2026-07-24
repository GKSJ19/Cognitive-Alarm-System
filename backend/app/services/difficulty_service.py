from sqlalchemy.orm import Session
from app.models.challenge_attempt import ChallengeAttempt
from app.models.alarm_trigger import AlarmTrigger

def calculate_difficulty(user_id: str, db: Session) -> tuple[str, float, int]:
    recent_attempts = (
        db.query(ChallengeAttempt)
        .join(AlarmTrigger, ChallengeAttempt.alarm_trigger_id == AlarmTrigger.id)
        .filter(AlarmTrigger.user_id == user_id)
        .order_by(ChallengeAttempt.answered_at.desc())
        .limit(10)
        .all()
    )

    if not recent_attempts:
        return "medium", 0.0, 0

    total = len(recent_attempts)
    correct = sum(1 for a in recent_attempts if a.is_correct)
    accuracy = round((correct / total) * 100, 1)

    if accuracy >= 95:
        difficulty = "expert"
    elif accuracy >= 80:
        difficulty = "hard"
    elif accuracy >= 60:
        difficulty = "medium"
    elif accuracy >= 40:
        difficulty = "easy"
    else:
        difficulty = "beginner"

    return difficulty, accuracy, total
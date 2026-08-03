from sqlalchemy.orm import Session
from uuid import UUID
from app.models import Alarm, ChallengeResult, DifficultyHistory

def evaluate_and_adjust_difficulty(user_id: UUID, alarm_id: UUID, db: Session):
    """Analyzes the user's recent performance on cognitive dismissal challenges
    and dynamically adjusts the alarm challenge difficulty.
    """
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id).first()
    if not alarm or not alarm.is_smart_adaptive:
        return

    # Fetch last 3 challenge results for this user and alarm
    results = db.query(ChallengeResult).filter(
        ChallengeResult.user_id == user_id,
        ChallengeResult.alarm_id == alarm_id
    ).order_by(ChallengeResult.solved_at.desc()).limit(3).all()

    # Need at least 3 historical results to adapt difficulty
    if len(results) < 3:
        return

    avg_solve_time = sum(r.completion_time for r in results) / 3.0
    avg_attempts = sum(r.total_attempts for r in results) / 3.0

    current_difficulty = alarm.difficulty.lower() if alarm.difficulty else "medium"
    if current_difficulty not in ["easy", "medium", "hard"]:
        current_difficulty = "medium"

    new_difficulty = None
    reason = ""

    # Rule 1: Increase difficulty if solve times are very fast and accuracy is high
    if avg_solve_time < 12.0 and avg_attempts == 1.0:
        if current_difficulty == "easy":
            new_difficulty = "medium"
            reason = f"Excellent speed (avg {avg_solve_time:.1f}s) and 100% accuracy on Easy."
        elif current_difficulty == "medium":
            new_difficulty = "hard"
            reason = f"Excellent speed (avg {avg_solve_time:.1f}s) and 100% accuracy on Medium."

    # Rule 2: Decrease difficulty if solve times are slow or require many attempts
    elif avg_solve_time > 45.0 or avg_attempts >= 3.0:
        if current_difficulty == "hard":
            new_difficulty = "medium"
            reason = f"Struggling with speed (avg {avg_solve_time:.1f}s) or attempts (avg {avg_attempts:.1f}) on Hard."
        elif current_difficulty == "medium":
            new_difficulty = "easy"
            reason = f"Struggling with speed (avg {avg_solve_time:.1f}s) or attempts (avg {avg_attempts:.1f}) on Medium."

    if new_difficulty:
        # Create difficulty history log
        history_entry = DifficultyHistory(
            user_id=user_id,
            alarm_id=alarm_id,
            previous_difficulty=current_difficulty,
            new_difficulty=new_difficulty,
            reason=reason
        )
        db.add(history_entry)

        # Apply update to the alarm
        alarm.difficulty = new_difficulty
        db.commit()

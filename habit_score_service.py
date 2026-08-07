from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.alarm_trigger import AlarmTrigger, VerificationStatus
from app.models.challenge_attempt import ChallengeAttempt
from app.models.sleep_log import SleepLog
from app.models.user import User

WINDOW_DAYS = 7

# Fixed by the brief — do not change these
WEIGHTS = {
    "wake_consistency_score": 0.35,
    "challenge_success_score": 0.25,
    "snooze_reduction_score": 0.20,
    "sleep_adherence_score": 0.20,
}


def _wake_consistency_score(user_id, db, since):
    triggers = db.query(AlarmTrigger).filter(
        AlarmTrigger.user_id == user_id,
        AlarmTrigger.triggered_at >= since,
    ).all()
    if not triggers:
        return None
    passed = sum(1 for t in triggers if t.verification_status == VerificationStatus.passed)
    return round((passed / len(triggers)) * 100, 1)


def _challenge_success_score(user_id, db, since):
    attempts = (
        db.query(ChallengeAttempt)
        .join(AlarmTrigger, ChallengeAttempt.alarm_trigger_id == AlarmTrigger.id)
        .filter(AlarmTrigger.user_id == user_id, ChallengeAttempt.answered_at >= since)
        .all()
    )
    if not attempts:
        return None
    correct = sum(1 for a in attempts if a.is_correct)
    return round((correct / len(attempts)) * 100, 1)


def _snooze_reduction_score(user_id, db, since):
    triggers = db.query(AlarmTrigger).filter(
        AlarmTrigger.user_id == user_id,
        AlarmTrigger.triggered_at >= since,
    ).all()
    if not triggers:
        return None
    avg_snoozes = sum(t.snooze_count for t in triggers) / len(triggers)
    return round(max(0.0, 100 - (avg_snoozes * 20)), 1)


def _sleep_adherence_score(user_id, db, since, target_mins):
    if not target_mins:
        return None
    logs = db.query(SleepLog).filter(
        SleepLog.user_id == user_id,
        SleepLog.date >= since.date(),
    ).all()
    if not logs:
        return None
    counted, on_target = 0, 0
    for log in logs:
        if log.duration_mins is None:
            continue
        counted += 1
        if abs(log.duration_mins - target_mins) <= 30:
            on_target += 1
    if counted == 0:
        return None
    return round((on_target / counted) * 100, 1)


def calculate_habit_score(user_id: str, db: Session) -> dict:
    since = datetime.utcnow() - timedelta(days=WINDOW_DAYS)
    user = db.query(User).filter(User.id == user_id).first()
    target_mins = user.sleep_duration_mins if user else None

    raw = {
        "wake_consistency_score": _wake_consistency_score(user_id, db, since),
        "challenge_success_score": _challenge_success_score(user_id, db, since),
        "snooze_reduction_score": _snooze_reduction_score(user_id, db, since),
        "sleep_adherence_score": _sleep_adherence_score(user_id, db, since, target_mins),
    }

    available = {k: v for k, v in raw.items() if v is not None}

    if not available:
        total = None
        insufficient_data = True
    else:
        weight_sum = sum(WEIGHTS[k] for k in available)
        total = round(
            sum(v * (WEIGHTS[k] / weight_sum) for k, v in available.items()),
            1,
        )
        insufficient_data = False

    return {
        "wake_consistency_score": raw["wake_consistency_score"],
        "challenge_success_score": raw["challenge_success_score"],
        "snooze_reduction_score": raw["snooze_reduction_score"],
        "sleep_adherence_score": raw["sleep_adherence_score"],
        "total_score": total,
        "insufficient_data": insufficient_data,
        "components_used": list(available.keys()),
    }
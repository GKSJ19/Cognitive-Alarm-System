from datetime import datetime, timedelta
from collections import defaultdict
from sqlalchemy.orm import Session

from app.models.alarm_trigger import AlarmTrigger, VerificationStatus
from app.models.challenge_attempt import ChallengeAttempt
from app.models.sleep_log import SleepLog

WINDOW_DAYS = 30

def snooze_trend(user_id: str, db: Session, since: datetime):
    triggers = (
        db.query(AlarmTrigger)
        .filter(AlarmTrigger.user_id == user_id, AlarmTrigger.triggered_at >= since)
        .order_by(AlarmTrigger.triggered_at.asc())
        .all()
    )
    by_week = defaultdict(list)
    for t in triggers:
        week_key = t.triggered_at.date().isocalendar()[1]
        by_week[week_key].append(t.snooze_count)

    weekly_avg = {
        f"week_{w}": round(sum(v) / len(v), 2) for w, v in by_week.items()
    }
    overall_avg = round(sum(t.snooze_count for t in triggers) / len(triggers), 2) if triggers else 0.0
    return {"weekly_average_snoozes": weekly_avg, "overall_average_snoozes": overall_avg}

def wake_time_consistency(user_id: str, db: Session, since: datetime):
    triggers = (
        db.query(AlarmTrigger)
        .filter(
            AlarmTrigger.user_id == user_id,
            AlarmTrigger.triggered_at >= since,
            AlarmTrigger.verification_status == VerificationStatus.passed,
            AlarmTrigger.dismissed_at.isnot(None),
        )
        .all()
    )
    if not triggers:
        return {"average_wake_minute_of_day": None, "std_dev_minutes": None, "sample_size": 0}

    minutes = [t.dismissed_at.hour * 60 + t.dismissed_at.minute for t in triggers]
    avg = sum(minutes) / len(minutes)
    variance = sum((m - avg) ** 2 for m in minutes) / len(minutes)
    std_dev = round(variance ** 0.5, 1)

    return {
        "average_wake_minute_of_day": round(avg, 1),
        "std_dev_minutes": std_dev,
        "sample_size": len(triggers),
    }

def sleep_vs_accuracy_correlation(user_id: str, db: Session, since: datetime):
    logs = db.query(SleepLog).filter(
        SleepLog.user_id == user_id, SleepLog.date >= since.date()
    ).all()
    date_to_duration = {log.date: log.duration_mins for log in logs if log.duration_mins}

    attempts = (
        db.query(ChallengeAttempt)
        .join(AlarmTrigger, ChallengeAttempt.alarm_trigger_id == AlarmTrigger.id)
        .filter(AlarmTrigger.user_id == user_id, ChallengeAttempt.answered_at >= since)
        .all()
    )
    by_date = defaultdict(list)
    for a in attempts:
        by_date[a.answered_at.date()].append(a.is_correct)

    paired = []
    for d, results in by_date.items():
        if d in date_to_duration:
            accuracy = sum(results) / len(results) * 100
            paired.append((date_to_duration[d], accuracy))

    if len(paired) < 2:
        return {"correlation": None, "sample_size": len(paired), "note": "Not enough overlapping days yet"}

    durations = [p[0] for p in paired]
    accuracies = [p[1] for p in paired]
    mean_d = sum(durations) / len(durations)
    mean_a = sum(accuracies) / len(accuracies)
    cov = sum((d - mean_d) * (a - mean_a) for d, a in zip(durations, accuracies))
    std_d = sum((d - mean_d) ** 2 for d in durations) ** 0.5
    std_a = sum((a - mean_a) ** 2 for a in accuracies) ** 0.5

    if std_d == 0 or std_a == 0:
        correlation = 0.0
    else:
        correlation = round(cov / (std_d * std_a), 2)

    return {"correlation": correlation, "sample_size": len(paired)}

def get_behavior_patterns(user_id: str, db: Session) -> dict:
    since = datetime.utcnow() - timedelta(days=WINDOW_DAYS)
    return {
        "window_days": WINDOW_DAYS,
        "snooze_trend": snooze_trend(user_id, db, since),
        "wake_time_consistency": wake_time_consistency(user_id, db, since),
        "sleep_duration_vs_accuracy": sleep_vs_accuracy_correlation(user_id, db, since),
    }
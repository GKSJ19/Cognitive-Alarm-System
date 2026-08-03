from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app.models import UserBehaviorAnalytic, Alarm, UserProfile
from app.utils import get_sleep_duration_hours, parse_time_to_minutes

def track_behavior(
    user_id: UUID,
    alarm_id: UUID,
    wake_time: str,
    solved: bool,
    solve_time: int,
    attempt_count: int,
    snooze_count: int,
    db: Session
) -> UserBehaviorAnalytic:
    """Logs morning behavior analytics for the user.
    Updates scores and difficulty after logging.
    """
    date_str = datetime.now().strftime("%Y-%m-%d")

    # Retrieve alarm details
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id).first()
    target_time_str = "07:00:00"
    if alarm:
        target_time_str = alarm.alarm_time.strftime("%H:%M:%S")

    # Format wake_time to have seconds if it doesn't
    if len(wake_time.split(":")) == 2:
        wake_time_formatted = f"{wake_time}:00"
    else:
        wake_time_formatted = wake_time

    # Calculate wake_up_delay in seconds (actual minutes - target minutes) * 60
    target_mins = parse_time_to_minutes(target_time_str)
    actual_mins = parse_time_to_minutes(wake_time_formatted)
    
    # Handle crossing midnight (just in case)
    delay_mins = actual_mins - target_mins
    if delay_mins < -720:  # e.g., woke up at 00:05 for a 23:55 alarm
        delay_mins += 1440
    elif delay_mins > 720:  # woke up at 23:55 for a 00:05 alarm
        delay_mins -= 1440
    
    wake_up_delay = delay_mins * 60

    # Calculate sleep duration estimate
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    sleep_duration = 8.0  # default fallback
    if profile and profile.preferred_sleep_time:
        sleep_duration = get_sleep_duration_hours(profile.preferred_sleep_time, wake_time_formatted)
    elif profile and profile.preferred_wakeup_time:
        # If no sleep time, check difference between preferred wakeup and preferred sleep
        # Let's say sleep is 8 hours prior to preferred wakeup
        sleep_duration = 8.0

    # Check for existing analytic for today
    analytic = db.query(UserBehaviorAnalytic).filter(
        UserBehaviorAnalytic.user_id == user_id,
        UserBehaviorAnalytic.date == date_str
    ).first()

    if analytic:
        analytic.wake_up_time = wake_time_formatted
        analytic.target_wake_up_time = target_time_str
        analytic.wake_up_delay = wake_up_delay
        analytic.snooze_count = snooze_count
        analytic.challenge_solved = solved
        analytic.challenge_solve_time = solve_time
        analytic.challenge_attempts = attempt_count
        analytic.sleep_duration = sleep_duration
    else:
        analytic = UserBehaviorAnalytic(
            user_id=user_id,
            date=date_str,
            wake_up_time=wake_time_formatted,
            target_wake_up_time=target_time_str,
            wake_up_delay=wake_up_delay,
            snooze_count=snooze_count,
            challenge_solved=solved,
            challenge_solve_time=solve_time,
            challenge_attempts=attempt_count,
            sleep_duration=sleep_duration
        )
        db.add(analytic)

    db.commit()
    db.refresh(analytic)

    # Post-log triggers:
    # 1. Update Habit Scores for today
    from app.habit_scoring.service import calculate_habit_scores
    calculate_habit_scores(user_id, db)

    # 2. Adaptive difficulty adjustment if smart adaptive is enabled
    if alarm and alarm.is_smart_adaptive and solved:
        from app.adaptive_engine.service import evaluate_and_adjust_difficulty
        evaluate_and_adjust_difficulty(user_id, alarm_id, db)

    return analytic

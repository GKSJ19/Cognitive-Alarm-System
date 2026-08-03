from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app.models import HabitScore, UserBehaviorAnalytic, UserProfile
from app.utils import parse_time_to_minutes, get_standard_deviation

def calculate_habit_scores(user_id: UUID, db: Session) -> HabitScore:
    """Calculates morning habit performance scores based on user behavior analytics
    over the last 7 entries, saving or updating the HabitScore record for today.
    """
    date_str = datetime.now().strftime("%Y-%m-%d")

    # Fetch the last 7 daily behavior logs for the user
    logs = db.query(UserBehaviorAnalytic).filter(
        UserBehaviorAnalytic.user_id == user_id
    ).order_by(UserBehaviorAnalytic.date.desc()).limit(7).all()

    if not logs:
        # Default scores if no tracking data yet
        scores = HabitScore(
            user_id=user_id,
            date=date_str,
            wake_up_consistency=100.0,
            challenge_completion=100.0,
            snooze_reduction=100.0,
            sleep_adherence=100.0,
            overall_score=100.0
        )
        db.add(scores)
        db.commit()
        db.refresh(scores)
        return scores

    # 1. Wake-Up Consistency Score
    consistency_values = []
    for log in logs:
        delay = log.wake_up_delay  # in seconds
        if delay <= 180:  # <= 3 mins
            c_score = 100.0
        elif delay <= 600:  # <= 10 mins
            c_score = 85.0
        elif delay <= 1800:  # <= 30 mins
            c_score = 70.0
        elif delay <= 3600:  # <= 60 mins
            c_score = 40.0
        else:
            c_score = 10.0
        consistency_values.append(c_score)
    wake_up_consistency = sum(consistency_values) / len(consistency_values)

    # 2. Challenge Completion Score
    solved_count = sum(1 for log in logs if log.challenge_solved)
    challenge_completion = (solved_count / len(logs)) * 100.0

    # 3. Snooze Reduction Score
    snooze_values = []
    for log in logs:
        sc = log.snooze_count
        if sc == 0:
            s_score = 100.0
        elif sc == 1:
            s_score = 85.0
        elif sc == 2:
            s_score = 70.0
        elif sc == 3:
            s_score = 50.0
        elif sc == 4:
            s_score = 30.0
        else:
            s_score = 10.0
        snooze_values.append(s_score)
    snooze_reduction = sum(snooze_values) / len(snooze_values)

    # 4. Sleep Schedule Adherence
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    adherence_values = []
    
    if profile and profile.preferred_wakeup_time:
        pref_mins = parse_time_to_minutes(profile.preferred_wakeup_time)
        for log in logs:
            if log.wake_up_time:
                wake_mins = parse_time_to_minutes(log.wake_up_time)
                diff = abs(wake_mins - pref_mins)
                # Deduct 2 points for every minute off preference
                ad_score = max(0.0, 100.0 - (diff * 2.0))
                adherence_values.append(ad_score)
        sleep_adherence = sum(adherence_values) / len(adherence_values) if adherence_values else 80.0
    else:
        # Fallback to standard deviation of wake up times
        wake_mins_list = []
        for log in logs:
            if log.wake_up_time:
                wake_mins_list.append(float(parse_time_to_minutes(log.wake_up_time)))
        
        if len(wake_mins_list) >= 2:
            sd = get_standard_deviation(wake_mins_list)
            if sd < 15.0:
                sleep_adherence = 100.0
            elif sd < 30.0:
                sleep_adherence = 85.0
            elif sd < 60.0:
                sleep_adherence = 70.0
            else:
                sleep_adherence = 50.0
        else:
            sleep_adherence = 100.0

    # 5. Overall Habit Score (Weighted average)
    overall_score = (
        0.30 * wake_up_consistency +
        0.30 * challenge_completion +
        0.20 * snooze_reduction +
        0.20 * sleep_adherence
    )

    # Check if a score record already exists for today
    scores = db.query(HabitScore).filter(
        HabitScore.user_id == user_id,
        HabitScore.date == date_str
    ).first()

    if scores:
        scores.wake_up_consistency = round(wake_up_consistency, 2)
        scores.challenge_completion = round(challenge_completion, 2)
        scores.snooze_reduction = round(snooze_reduction, 2)
        scores.sleep_adherence = round(sleep_adherence, 2)
        scores.overall_score = round(overall_score, 2)
    else:
        scores = HabitScore(
            user_id=user_id,
            date=date_str,
            wake_up_consistency=round(wake_up_consistency, 2),
            challenge_completion=round(challenge_completion, 2),
            snooze_reduction=round(snooze_reduction, 2),
            sleep_adherence=round(sleep_adherence, 2),
            overall_score=round(overall_score, 2)
        )
        db.add(scores)

    db.commit()
    db.refresh(scores)
    return scores

from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app.models import Recommendation, UserBehaviorAnalytic, ChallengeResult, UserProfile
from app.utils import parse_time_to_minutes, get_standard_deviation

def generate_recommendations(user_id: UUID, db: Session):
    """Analyzes the user's historical wake-up patterns, scores, and challenge success
    to generate personalized, actionable sleep and productivity recommendations.
    """
    # Fetch recent behavior logs (up to 14 days)
    logs = db.query(UserBehaviorAnalytic).filter(
        UserBehaviorAnalytic.user_id == user_id
    ).order_by(UserBehaviorAnalytic.date.desc()).limit(14).all()

    # Fetch recent challenge results (up to 10)
    results = db.query(ChallengeResult).filter(
        ChallengeResult.user_id == user_id
    ).order_by(ChallengeResult.solved_at.desc()).limit(10).all()

    generated = []

    # 1. Sleep Duration & Snooze suggestions
    if logs:
        avg_snoozes = sum(log.snooze_count for log in logs) / len(logs)
        if avg_snoozes > 1.2:
            generated.append({
                "category": "sleep",
                "title": "Reduce Morning Snoozing",
                "content": f"You are snoozing an average of {avg_snoozes:.1f} times. Excessive snoozing fragments sleep, causing grogginess. Try moving your alarm out of arm's reach to force yourself to get up."
            })

        avg_sleep = sum(log.sleep_duration for log in logs if log.sleep_duration is not None) / len(logs)
        if avg_sleep < 6.5:
            generated.append({
                "category": "sleep",
                "title": "Prioritize Sleep Duration",
                "content": f"Your sleep duration averages {avg_sleep:.1f} hours, which is below the target 7-9 hours. Waking up will feel much easier if you shift bedtime 30 minutes earlier."
            })

    # 2. Challenge Difficulty suggestions
    if results:
        avg_solve_time = sum(r.completion_time for r in results) / len(results)
        avg_accuracy = sum(r.accuracy for r in results) / len(results)
        
        if avg_solve_time < 10.0 and avg_accuracy > 0.90:
            generated.append({
                "category": "challenge",
                "title": "Boost Your Morning Challenge",
                "content": f"You solve cognitive dismissal tasks rapidly (avg {avg_solve_time:.1f}s) with high accuracy ({avg_accuracy*100:.0f}%). Increase challenge difficulty settings to stimulate your mind and clear sleep inertia."
            })
        elif avg_solve_time > 45.0:
            generated.append({
                "category": "challenge",
                "title": "Simplify Your Dismissal Challenge",
                "content": f"Dismissal tasks are taking an average of {avg_solve_time:.1f}s. If waking up is frustrating, lower your difficulty settings to Easy or Medium for a faster, less stressful routine."
            })

    # 3. Wake-Up Consistency suggestions
    if len(logs) >= 3:
        wake_mins_list = [parse_time_to_minutes(log.wake_up_time) for log in logs if log.wake_up_time]
        if len(wake_mins_list) >= 3:
            sd = get_standard_deviation(wake_mins_list)
            if sd > 40.0:
                generated.append({
                    "category": "wakeup",
                    "title": "Establish Consistency",
                    "content": f"Your wake times vary by {sd:.1f} minutes. Keeping a consistent wakeup time, even on weekends, aligns your biological clock and reduces morning fatigue."
                })

    # 4. Productivity recommendations
    if logs:
        wake_mins_list = [parse_time_to_minutes(log.wake_up_time) for log in logs if log.wake_up_time]
        if wake_mins_list:
            avg_wake_min = sum(wake_mins_list) / len(wake_mins_list)
            if avg_wake_min < 450:  # before 07:30 AM
                generated.append({
                    "category": "productivity",
                    "title": "Capture Your Morning Peak",
                    "content": "Since you rise early, your cognitive alertness is optimized between 9:00 AM and 12:00 PM. Schedule your most demanding deep work tasks in this high-focus window."
                })
            else:
                generated.append({
                    "category": "productivity",
                    "title": "Afternoon Productivity Peak",
                    "content": "As a late riser, your energy peaks later in the day. Waking up slowly with a gentle routine is recommended; schedule analytical work between 1:00 PM and 4:00 PM."
                })

    # Save generated recommendations (prevent duplicates)
    for rec_data in generated:
        existing = db.query(Recommendation).filter(
            Recommendation.user_id == user_id,
            Recommendation.title == rec_data["title"]
        ).first()

        if existing:
            # Update created_at and mark as unread to re-prompt
            existing.created_at = datetime.now()
            existing.is_read = False
        else:
            db_rec = Recommendation(
                user_id=user_id,
                category=rec_data["category"],
                title=rec_data["title"],
                content=rec_data["content"]
            )
            db.add(db_rec)
    
    db.commit()

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.dependencies import get_db, get_current_user
from app.models import (
    User,
    HabitScore,
    UserBehaviorAnalytic,
    ChallengeResult,
    AlarmHistory,
    Recommendation
)
from app.schemas import DashboardSummaryResponse, HabitScoreResponse, RecommendationResponse
from app.recommendation_engine.service import generate_recommendations

router = APIRouter(prefix="/dashboard", tags=["Dashboard Backend"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compiles all metrics for the unified habit tracking dashboard."""
    # 1. Fetch current scores (today's score)
    date_str = datetime.now().strftime("%Y-%m-%d")
    current_scores = db.query(HabitScore).filter(
        HabitScore.user_id == current_user.id,
        HabitScore.date == date_str
    ).first()

    # If no scores for today, fetch the absolute latest one
    if not current_scores:
        current_scores = db.query(HabitScore).filter(
            HabitScore.user_id == current_user.id
        ).order_by(HabitScore.date.desc()).first()

    # 2. Fetch score trends (last 30 days)
    score_trends = db.query(HabitScore).filter(
        HabitScore.user_id == current_user.id
    ).order_by(HabitScore.date.asc()).limit(30).all()

    # 3. Calculate challenge stats
    results = db.query(ChallengeResult).filter(
        ChallengeResult.user_id == current_user.id
    ).all()

    total_solved = len(results)
    avg_solve_time = sum(r.completion_time for r in results) / total_solved if total_solved > 0 else 0.0
    avg_accuracy = sum(r.accuracy for r in results) / total_solved if total_solved > 0 else 0.0

    category_breakdown = {}
    for r in results:
        if r.challenge and r.challenge.category:
            cat_name = r.challenge.category.name
            category_breakdown[cat_name] = category_breakdown.get(cat_name, 0) + 1

    challenge_stats = {
        "total_solved": total_solved,
        "avg_solve_time_seconds": round(avg_solve_time, 1),
        "avg_accuracy_percentage": round(avg_accuracy * 100, 1),
        "category_breakdown": category_breakdown
    }

    # 4. Fetch sleep trends (last 7 logs)
    behavior_logs = db.query(UserBehaviorAnalytic).filter(
        UserBehaviorAnalytic.user_id == current_user.id
    ).order_by(UserBehaviorAnalytic.date.desc()).limit(7).all()

    sleep_trends = []
    for log in reversed(behavior_logs):
        sleep_trends.append({
            "date": log.date,
            "duration_hours": log.sleep_duration if log.sleep_duration is not None else 8.0
        })

    # 5. Fetch wake-up history (last 7 logs)
    histories = db.query(AlarmHistory).filter(
        AlarmHistory.user_id == current_user.id
    ).order_by(AlarmHistory.dismissed_at.desc()).limit(7).all()

    wake_up_history = []
    for h in histories:
        alarm_time_str = "07:00"
        if h.alarm:
            alarm_time_str = h.alarm.alarm_time.strftime("%H:%M")

        wake_up_history.append({
            "history_id": str(h.id),
            "date": h.dismissed_at.strftime("%Y-%m-%d"),
            "alarm_time": alarm_time_str,
            "wake_time": h.wake_time,
            "solved": h.solved,
            "solve_time": h.solve_time,
            "snooze_count": h.snooze_count,
            "dismissed_at": h.dismissed_at.isoformat()
        })

    # 6. Calculate progress reports
    all_scores = db.query(HabitScore).filter(
        HabitScore.user_id == current_user.id
    ).order_by(HabitScore.date.desc()).all()

    this_week_avg = 0.0
    last_week_avg = 0.0
    pct_change = 0.0
    message = "Start logging alarms to track your progress and see routine tips!"

    if len(all_scores) > 0:
        this_week_scores = all_scores[:7]
        this_week_avg = sum(s.overall_score for s in this_week_scores) / len(this_week_scores)
        
        last_week_scores = all_scores[7:14]
        if last_week_scores:
            last_week_avg = sum(s.overall_score for s in last_week_scores) / len(last_week_scores)
            if last_week_avg > 0:
                pct_change = ((this_week_avg - last_week_avg) / last_week_avg) * 100.0
                if pct_change > 5.0:
                    message = f"Incredible job! Your overall habit score is up {pct_change:.1f}% compared to last week. Waking up on time is paying off!"
                elif pct_change < -5.0:
                    message = f"Your overall habit score dropped by {abs(pct_change):.1f}% this week. Waking up immediately and avoiding snoozing can get you back on track!"
                else:
                    message = "You are maintaining a steady morning routine. Keep up the consistency to form a lifetime habit!"
            else:
                message = "Consistency is building! Waking up on time will raise your habit score."
        else:
            message = "Great start! Waking up on time consistently will build your score."

    progress_report = {
        "this_week_average_score": round(this_week_avg, 2),
        "last_week_average_score": round(last_week_avg, 2),
        "percentage_change": round(pct_change, 2),
        "encouragement_message": message
    }

    # 7. Fetch active recommendations (top 2)
    # Ensure they are fresh
    generate_recommendations(current_user.id, db)
    
    recs = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id,
        Recommendation.is_read == False
    ).order_by(Recommendation.created_at.desc()).limit(2).all()

    return DashboardSummaryResponse(
        current_scores=current_scores,
        score_trends=score_trends,
        challenge_stats=challenge_stats,
        sleep_trends=sleep_trends,
        wake_up_history=wake_up_history,
        progress_report=progress_report,
        recommendations=recs
    )

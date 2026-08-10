from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.dependencies import get_db, get_current_user, RoleChecker
from app.models import (
    User,
    UserProfile,
    Alarm,
    HabitScore,
    UserBehaviorAnalytic,
    ChallengeResult,
    AlarmHistory,
    Recommendation
)
from app.schemas import (
    DashboardSummaryResponse,
    HabitScoreResponse,
    RecommendationResponse,
    AdminDashboardResponse,
    CoachDashboardResponse,
    CoachUserDetailResponse,
    SystemStatsResponse,
    ClientSummaryResponse
)
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


@router.get("/admin", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"]))
):
    """Admin-only endpoint for system-wide metrics and KPIs."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_alarms = db.query(func.count(Alarm.id)).scalar() or 0
    
    # System averages
    avg_habit_score = db.query(func.avg(HabitScore.overall_score)).scalar() or 0.0
    avg_snooze_count = db.query(func.avg(UserBehaviorAnalytic.snooze_count)).scalar() or 0.0
    avg_wake_up_delay = db.query(func.avg(UserBehaviorAnalytic.wake_up_delay)).scalar() or 0.0
    avg_sleep_duration = db.query(func.avg(UserBehaviorAnalytic.sleep_duration)).scalar() or 0.0
    
    # Active users in the last 7 days
    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    active_users = db.query(func.count(func.distinct(UserBehaviorAnalytic.user_id))).filter(
        UserBehaviorAnalytic.date >= seven_days_ago
    ).scalar() or 0
    
    # Challenge category breakdown
    category_breakdown = {}
    results = db.query(ChallengeResult).all()
    for r in results:
        if r.challenge and r.challenge.category:
            cat_name = r.challenge.category.name
            category_breakdown[cat_name] = category_breakdown.get(cat_name, 0) + 1
            
    return AdminDashboardResponse(
        total_users=total_users,
        total_alarms=total_alarms,
        system_avg_habit_score=round(float(avg_habit_score), 2),
        system_avg_snooze_count=round(float(avg_snooze_count), 2),
        system_avg_wake_up_delay_seconds=round(float(avg_wake_up_delay), 2),
        system_avg_sleep_duration_hours=round(float(avg_sleep_duration), 2),
        challenge_category_breakdown=category_breakdown,
        active_users_count=active_users
    )


@router.get("/coach", response_model=CoachDashboardResponse)
def get_coach_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["wellness_coach", "admin"]))
):
    """Wellness Coach dashboard endpoint returning a list of all client metrics."""
    users = db.query(User).filter(User.role == "user").all()
    clients = []
    
    for u in users:
        # Fetch their latest overall score
        latest_score_rec = db.query(HabitScore).filter(
            HabitScore.user_id == u.id
        ).order_by(HabitScore.date.desc()).first()
        latest_score = latest_score_rec.overall_score if latest_score_rec else None
        
        # Calculate average overall score
        scores = db.query(HabitScore.overall_score).filter(HabitScore.user_id == u.id).all()
        avg_score = sum(s[0] for s in scores) / len(scores) if scores else None
        
        clients.append(ClientSummaryResponse(
            id=u.id,
            full_name=u.full_name,
            email=u.email,
            is_active=u.is_active,
            latest_score=latest_score,
            avg_score=round(avg_score, 2) if avg_score is not None else None,
            created_at=u.created_at
        ))
        
    return CoachDashboardResponse(
        total_clients=len(clients),
        clients=clients
    )


@router.get("/coach/user/{user_id}", response_model=CoachUserDetailResponse)
def get_coach_user_detail(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["wellness_coach", "admin"]))
):
    """Allows coaches to inspect a client's detailed dashboard history and metrics."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Client not found")
        
    # 1. Fetch current scores (today's score)
    date_str = datetime.now().strftime("%Y-%m-%d")
    current_scores = db.query(HabitScore).filter(
        HabitScore.user_id == user.id,
        HabitScore.date == date_str
    ).first()

    if not current_scores:
        current_scores = db.query(HabitScore).filter(
            HabitScore.user_id == user.id
        ).order_by(HabitScore.date.desc()).first()

    # 2. Fetch score trends (last 30 days)
    score_trends = db.query(HabitScore).filter(
        HabitScore.user_id == user.id
    ).order_by(HabitScore.date.asc()).limit(30).all()

    # 3. Calculate challenge stats
    results = db.query(ChallengeResult).filter(
        ChallengeResult.user_id == user.id
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
        UserBehaviorAnalytic.user_id == user.id
    ).order_by(UserBehaviorAnalytic.date.desc()).limit(7).all()

    sleep_trends = []
    for log in reversed(behavior_logs):
        sleep_trends.append({
            "date": log.date,
            "duration_hours": log.sleep_duration if log.sleep_duration is not None else 8.0
        })

    # 5. Fetch wake-up history (last 7 logs)
    histories = db.query(AlarmHistory).filter(
        AlarmHistory.user_id == user.id
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
        HabitScore.user_id == user.id
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

    generate_recommendations(user.id, db)
    
    recs = db.query(Recommendation).filter(
        Recommendation.user_id == user.id,
        Recommendation.is_read == False
    ).order_by(Recommendation.created_at.desc()).limit(2).all()

    summary = DashboardSummaryResponse(
        current_scores=current_scores,
        score_trends=score_trends,
        challenge_stats=challenge_stats,
        sleep_trends=sleep_trends,
        wake_up_history=wake_up_history,
        progress_report=progress_report,
        recommendations=recs
    )
    
    profile_dict = None
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if profile:
        profile_dict = {
            "profile_photo": profile.profile_photo,
            "phone_number": profile.phone_number,
            "gender": profile.gender,
            "date_of_birth": profile.date_of_birth,
            "occupation": profile.occupation,
            "timezone": profile.timezone,
            "preferred_wakeup_time": profile.preferred_wakeup_time,
            "preferred_sleep_time": profile.preferred_sleep_time,
            "bio": profile.bio
        }
        
    return CoachUserDetailResponse(
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        profile=profile_dict,
        summary=summary
    )


@router.get("/statistics", response_model=SystemStatsResponse)
def get_system_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates interesting analytics statistics across the userbase."""
    analytics_records = db.query(UserBehaviorAnalytic).all()
    snooze_by_day = {}
    day_counts = {}
    
    for record in analytics_records:
        try:
            dt = datetime.strptime(record.date, "%Y-%m-%d")
            day_name = dt.strftime("%A")
            snooze_by_day[day_name] = snooze_by_day.get(day_name, 0.0) + record.snooze_count
            day_counts[day_name] = day_counts.get(day_name, 0) + 1
        except Exception:
            continue
            
    avg_snooze_by_day = {}
    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
        if day in snooze_by_day and day_counts[day] > 0:
            avg_snooze_by_day[day] = round(snooze_by_day[day] / day_counts[day], 2)
        else:
            avg_snooze_by_day[day] = 0.0

    diff_accuracy = {}
    diff_counts = {}
    challenge_results = db.query(ChallengeResult).all()
    for r in challenge_results:
        diff = r.challenge.difficulty.capitalize() if (r.challenge and r.challenge.difficulty) else "Medium"
        diff_accuracy[diff] = diff_accuracy.get(diff, 0.0) + r.accuracy
        diff_counts[diff] = diff_counts.get(diff, 0) + 1
        
    avg_accuracy_by_diff = {}
    for diff in ["Easy", "Medium", "Hard"]:
        if diff in diff_accuracy and diff_counts[diff] > 0:
            avg_accuracy_by_diff[diff] = round((diff_accuracy[diff] / diff_counts[diff]) * 100, 1)
        else:
            avg_accuracy_by_diff[diff] = 0.0

    cat_time = {}
    cat_counts = {}
    for r in challenge_results:
        cat = r.challenge.category.name if (r.challenge and r.challenge.category) else "Unknown"
        cat_time[cat] = cat_time.get(cat, 0.0) + r.completion_time
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        
    avg_time_by_cat = {}
    for cat in cat_time:
        if cat_counts[cat] > 0:
            avg_time_by_cat[cat] = round(cat_time[cat] / cat_counts[cat], 1)

    adherence_dist = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    scores = db.query(HabitScore.overall_score).all()
    for s in scores:
        val = s[0]
        if val <= 20:
            adherence_dist["0-20"] += 1
        elif val <= 40:
            adherence_dist["21-40"] += 1
        elif val <= 60:
            adherence_dist["41-60"] += 1
        elif val <= 80:
            adherence_dist["61-80"] += 1
        else:
            adherence_dist["81-100"] += 1

    return SystemStatsResponse(
        snooze_by_day_of_week=avg_snooze_by_day,
        challenge_accuracy_by_difficulty=avg_accuracy_by_diff,
        average_solve_time_by_category=avg_time_by_cat,
        adherence_distribution=adherence_dist
    )

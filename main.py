from fastapi import FastAPI
from api_client import get_user_profile
from progress import get_progress
from challenge_score import calculate_challenge_score
from verification import verify_user
from challenge_analytics import challenge_report
from cognitive_challenge import get_cognitive_challenge
from active_users import get_active_users
from alarm_statistics import get_alarm_statistics
from daily_trends import daily_trends
from weekly_trends import weekly_trends
from monthly_trends import monthly_trends
from coach_dashboard import get_coach_dashboard
from coach_users import get_coach_users
from user_analytics import get_user_analytics

app = FastAPI(
    title="Intelligent Cognitive Alarm - AI & Analytics API",
    description="AI & Analytics Service",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "AI & Analytics Service"
    }

@app.get("/habit-score")
def habit_score():
    profile = get_user_profile()
    snooze_limit = profile.get(
        "habit_preferences", {}
    ).get("snooze_limit", 0)
    on_time = 90
    challenge = 80
    snooze_score = max(
        0,
        100 - snooze_limit * 10
    )
    score = (
        on_time * 0.5 +
        challenge * 0.3 +
        snooze_score * 0.2
    )
    return {
        "username": profile.get("username"),
        "habit_score": round(score, 2),
        "snooze_limit": snooze_limit
    }

@app.get("/difficulty")
def difficulty():
    profile = get_user_profile()
    return {
        "username": profile.get("username"),
        "difficulty": profile.get("difficulty_preference")
    }

@app.get("/recommendation")
def recommendation_api():
    profile = get_user_profile()
    goal = profile.get(
        "productivity_goals",
        "Stay productive"
    )
    recommendations = {
        "Wake up early": [
            "Sleep before 10 PM",
            "Avoid phone before bed",
            "Keep alarm away from bed"
        ],
        "Study": [
            "Wake at 6 AM",
            "Review notes after waking",
            "Take short breaks"
        ]
    }
    return {
        "username": profile.get("username"),
        "goal": goal,
        "recommendation": recommendations.get(
            goal,
            ["Maintain a healthy sleep schedule"]
        )
    }

@app.get("/progress")
def progress():
    profile = get_user_profile()
    return {
        "username": profile.get("username"),
        "sleep_duration": profile.get("sleep_duration_minutes"),
        "difficulty": profile.get("difficulty_preference"),
        "goal": profile.get("productivity_goals"),
        "habit_preferences": profile.get("habit_preferences")
    }
    
@app.get("/challenge-score")
def challenge_score(correct: int, total: int):
    score = calculate_challenge_score(correct, total)
    return {
        "Challenge Score": score
    }

@app.get("/verification")
def verification(correct: int, total: int):
    score = calculate_challenge_score(correct, total)
    status = verify_user(score)
    return {
        "Verification Status": status
    }

@app.get("/challenge-analytics")
def challenge_analytics(
    attempted: int,
    completed: int,
    total_score: int
):
    return challenge_report(
        attempted,
        completed,
        total_score
    )

@app.get("/cognitive-challenge")
def cognitive_challenge():
    return get_cognitive_challenge()
    
@app.get("/sleep-score")
def sleep_score():
    profile = get_user_profile()
    sleep = profile.get(
        "sleep_duration_minutes",
        0
    )
    if sleep >= 480:
        score = 100
    elif sleep >= 420:
        score = 85
    elif sleep >= 360:
        score = 70
    else:
        score = 50
    return {
        "username": profile.get("username"),
        "sleep_duration": sleep,
        "sleep_score": score
    }

@app.get("/active-users")
def active_users(active_users: int):
    return get_active_users(active_users)

@app.get("/alarm-statistics")
def alarm_statistics(
    created: int,
    completed: int,
    missed: int,
    snoozed: int
):
    return get_alarm_statistics(
        created,
        completed,
        missed,
        snoozed
    )

@app.get("/daily-trends")
def daily(
    habit_score: int,
    challenge_score: int,
    sleep_score: int
):
    return daily_trends(
        habit_score,
        challenge_score,
        sleep_score
    )
    
@app.get("/weekly-trends")
def weekly(
    avg_habit: int,
    avg_challenge: int,
    avg_sleep: int
):
    return weekly_trends(
        avg_habit,
        avg_challenge,
        avg_sleep
    )

@app.get("/monthly-trends")
def monthly(
    habit: int,
    challenge: int,
    sleep: int
):
    return monthly_trends(
        habit,
        challenge,
        sleep
    )

@app.get("/coach/dashboard")
def coach_dashboard(
    active_users: int,
    average_habit_score: int,
    average_sleep_score: int,
    average_challenge_score: int,
    completed_alarms: int,
    missed_alarms: int
):
    return get_coach_dashboard(
        active_users,
        average_habit_score,
        average_sleep_score,
        average_challenge_score,
        completed_alarms,
        missed_alarms
    )

@app.get("/coach/users")
def coach_users(
    user_id: int,
    user_name: str,
    habit_score: int,
    sleep_score: int,
    progress: int
):
    return get_coach_users(
        user_id,
        user_name,
        habit_score,
        sleep_score,
        progress
    )

@app.get("/user-analytics")
def user_analytics(
    user_id: int,
    habit_score: int,
    sleep_score: int,
    challenge_score: int,
    recommendation: str,
    progress: int
):
    return get_user_analytics(
        user_id,
        habit_score,
        sleep_score,
        challenge_score,
        recommendation,
        progress
    )

@app.get("/backend-profile")
def backend_profile():
    return get_user_profile()

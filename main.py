from fastapi import FastAPI

from api_client import get_user_profile
from analytics import calculate_habit_score
from difficulty import difficulty_level
from recommendation import recommendation
from progress import get_progress

from challenge_score import calculate_challenge_score
from verification import verify_user
from challenge_analytics import challenge_report
from cognitive_challenge import get_cognitive_challenge

from sleep_score import calculate_sleep_score
from active_users import get_active_users
from alarm_statistics import get_alarm_statistics
from daily_trends import daily_trends
from weekly_trends import weekly_trends
from monthly_trends import monthly_trends

from coach_dashboard import get_coach_dashboard
from coach_users import get_coach_users
from user_analytics import get_user_analytics
app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "AI & Analytics Service"
    }

# -----------------------------
# Milestone 1 APIs
# -----------------------------

# Habit Score API
@app.get("/habit-score")
def habit_score():
    profile = get_user_profile()

    on_time = 90
    challenge = 80

    snooze_limit = profile.get("habit_preferences", {}).get("snooze_limit", 0)
    snooze_score = max(0, 100 - snooze_limit * 10)

    score = calculate_habit_score(
        on_time,
        challenge,
        snooze_score
    )

    return {
        "username": profile["username"],
        "Habit Score": score,
        "sleep_duration": profile["sleep_duration_minutes"],
        "snooze_limit": snooze_limit
    }

# Difficulty Prediction API
@app.get("/difficulty")
def difficulty():
    profile = get_user_profile()

    level = profile.get("difficulty_preference", "medium")

    return {
        "username": profile["username"],
        "difficulty": level
    }

# Recommendation API
@app.get("/recommendation")
def recommendation():
    profile = get_user_profile()

    goal = profile.get("productivity_goals", "Stay productive")

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
        "username": profile["username"],
        "goal": goal,
        "recommendation": recommendations.get(goal, ["Maintain a healthy sleep schedule"])
    }

@app.get("/progress")
def progress():
    profile = get_user_profile()

    return {
        "username": profile["username"],
        "sleep_duration": profile.get("sleep_duration_minutes"),
        "difficulty": profile.get("difficulty_preference"),
        "goal": profile.get("productivity_goals"),
        "habit_preferences": profile.get("habit_preferences")
    }

# -----------------------------
# Milestone 2 APIs
# -----------------------------

# Challenge Score API
@app.get("/challenge-score")
def challenge_score(correct: int, total: int):

    score = calculate_challenge_score(correct, total)

    return {
        "Challenge Score": score
    }

# Wake-up Verification API
@app.get("/verification")
def verification(correct: int, total: int):
    score = calculate_challenge_score(correct, total)
    status = verify_user(score)
    return {
        "Verification Status": status
    }

# Challenge Analytics API
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

# Cognitive Challenge API
@app.get("/cognitive-challenge")
def cognitive_challenge():
    return get_cognitive_challenge()

#------------------------------
# Milestone 3 APIs
# -----------------------------

#Sleep Score
@app.get("/sleep-score")
def sleep_score():
    profile = get_user_profile()

    sleep = profile.get("sleep_duration_minutes", 0)

    if sleep >= 480:
        score = 100
    elif sleep >= 420:
        score = 85
    elif sleep >= 360:
        score = 70
    else:
        score = 50

    return {
        "username": profile["username"],
        "sleep_duration": sleep,
        "sleep_score": score
    }

#Active Users
@app.get("/active-users")
def active_users(active_users: int):
    return get_active_users(active_users)

#Alarm Statistics
@app.get("/alarm-statistics")
def alarm_statistics(
    created: int,
    completed: int,
    missed: int,
    snoozed: int
):
    return get_alarm_statistics(created, completed, missed, snoozed)

#daily trends
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

#Weekly Trends
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

#Monthly Trends
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

@app.get("/coach/users/{user_id}/analytics")
def coach_user_analytics(
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


from api_client import get_user_profile

@app.get("/backend-profile")
def backend_profile():
    return get_user_profile()
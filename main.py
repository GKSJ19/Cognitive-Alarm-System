from fastapi import FastAPI

from analytics import calculate_habit_score
from difficulty import difficulty_level
from recommendation import recommendation
from progress import get_progress

from challenge_score import calculate_challenge_score
from verification import verify_user
from challenge_analytics import challenge_report

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "AI & Analytics Service"
    }

@app.get("/habit-score")
def habit_score():
    on_time = 90
    challenge = 80
    snooze = 70

    score = calculate_habit_score(on_time, challenge, snooze)

    return {
        "Habit Score": score
    }

@app.get("/difficulty")
def difficulty():
    habit_score = 83
    level = difficulty_level(habit_score)

    return {
        "Difficulty": level
    }

@app.get("/recommendation")
def recommend():
    habit_score = 83
    advice = recommendation(habit_score)

    return {
        "Recommendation": advice
    }

@app.get("/progress")
def progress():
    return get_progress()

@app.get("/challenge-score")
def challenge_score():
    correct = 8
    total = 10

    score = calculate_challenge_score(correct, total)

    return {
        "Challenge Score": score
    }

@app.get("/verification")
def verification():
    score = calculate_challenge_score(8, 10)
    status = verify_user(score)

    return {
        "Verification Status": status
    }

@app.get("/challenge-analytics")
def challenge_analytics():
    attempted = 10
    completed = 8
    total_score = 656

    return challenge_report(attempted, completed, total_score)

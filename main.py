from fastapi import FastAPI
from analytics import calculate_habit_score
from difficulty import difficulty_level
from recommendation import recommendation
from progress import get_progress

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
    score = calculate_habit_score(
        on_time,
        challenge,
        snooze
    )
    return {
        "Habit Score": score
    }
@app.get("/difficulty")
def difficulty():
    score = calculate_habit_score(
        90,
        80,
        70
    )
    level = difficulty_level(score)
    return {
        "Difficulty": level
    }
@app.get("/recommendation")
def recommend():
    score = calculate_habit_score(
        90,
        80,
        70
    )
    advice = recommendation(score)
    return {
        "Recommendation": advice
    }
@app.get("/progress")
def progress():
    return get_progress()
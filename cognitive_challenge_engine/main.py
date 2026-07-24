"""
main.py

FastAPI backend for the Cognitive Challenge Engine.

Endpoints
---------
GET  /api/categories
    List the 7 challenge categories from the mind map.

GET  /api/challenge/{category}?difficulty=easy|medium|hard
    Generate one fresh challenge in that category via Claude. Returns the
    challenge WITHOUT the answer (answer is cached server-side by id) so a
    client can't just read it out of the network tab... in a real deployment
    you'd back this cache with Redis/DB; here it's an in-memory dict, which
    is fine for a demo but resets on restart / doesn't scale across workers.

GET  /api/challenge/random?difficulty=easy|medium|hard
    Same as above but picks a random category.

POST /api/challenge/{challenge_id}/answer
    Submit a user's answer for a previously generated challenge id. Returns
    whether it was correct, the correct answer, and the explanation.

Run locally:
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY=sk-ant-...
    uvicorn main:app --reload

Then open http://127.0.0.1:8000/ for the demo UI.
"""

import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from challenge_generator import (
    generate_challenge,
    random_category,
    VALID_CATEGORIES,
)

app = FastAPI(title="Cognitive Challenge Engine")

# In-memory store: challenge_id -> full challenge dict (including answer).
# Swap for Redis/a DB table keyed by id with a TTL in production.
_CHALLENGE_STORE: dict[str, dict] = {}

CATEGORY_LABELS = {
    "math_problems": "Mathematical Problems",
    "logic_puzzles": "Logic Puzzles",
    "memory_challenges": "Memory Challenges",
    "word_games": "Word Games",
    "pattern_recognition": "Pattern Recognition",
    "riddles": "Riddles",
    "quick_quizzes": "Quick Quizzes",
}


class AnswerSubmission(BaseModel):
    answer: str


@app.get("/api/categories")
def list_categories():
    return [
        {"id": cat, "label": CATEGORY_LABELS[cat]} for cat in VALID_CATEGORIES
    ]


def _issue_challenge(category: str, difficulty: str) -> dict:
    try:
        challenge = generate_challenge(category, difficulty)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"Challenge generation failed: {e}"
        )

    challenge_id = str(uuid.uuid4())
    _CHALLENGE_STORE[challenge_id] = challenge

    # Don't leak the answer/explanation to the client until they answer.
    return {
        "id": challenge_id,
        "category": challenge.get("category", category),
        "label": CATEGORY_LABELS.get(category, category),
        "difficulty": challenge.get("difficulty", difficulty),
        "question": challenge["question"],
        "choices": challenge.get("choices"),
    }


@app.get("/api/challenge/random")
def get_random_challenge(difficulty: str = "medium"):
    return _issue_challenge(random_category(), difficulty)


@app.get("/api/challenge/{category}")
def get_challenge(category: str, difficulty: str = "medium"):
    return _issue_challenge(category, difficulty)


@app.post("/api/challenge/{challenge_id}/answer")
def submit_answer(challenge_id: str, submission: AnswerSubmission):
    challenge = _CHALLENGE_STORE.get(challenge_id)
    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Unknown or expired challenge id. Request a new challenge.",
        )

    correct_answer = str(challenge["answer"]).strip().lower()
    user_answer = submission.answer.strip().lower()
    is_correct = user_answer == correct_answer

    # Clean up so the id can't be answered twice / reused.
    del _CHALLENGE_STORE[challenge_id]

    return {
        "correct": is_correct,
        "correct_answer": challenge["answer"],
        "explanation": challenge.get("explanation", ""),
    }


# Serve the demo UI at "/"
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def serve_index():
    return FileResponse("static/index.html")

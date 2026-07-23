import json
import random
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, Challenge, ChallengeCategory, ChallengeAttempt, ChallengeResult, Alarm, AlarmHistory
from app.schemas import (
    ChallengeCategoryResponse,
    ChallengeResponse,
    ChallengeSubmitRequest,
    ChallengeSubmitResponse
)

router = APIRouter(prefix="/challenges", tags=["Challenges"])

# Procedural Generator Helpers
def generate_math_problem(difficulty: str):
    subtype = random.choice(["addition", "subtraction", "multiplication", "division", "random"])
    if subtype == "addition":
        if difficulty == "easy":
            a = random.randint(1, 20)
            b = random.randint(1, 20)
        elif difficulty == "medium":
            a = random.randint(10, 100)
            b = random.randint(10, 100)
        else:
            a = random.randint(100, 999)
            b = random.randint(100, 999)
        expr = f"{a} + {b}"
        ans = a + b
    elif subtype == "subtraction":
        if difficulty == "easy":
            a = random.randint(10, 30)
            b = random.randint(1, 10)
        elif difficulty == "medium":
            a = random.randint(50, 150)
            b = random.randint(10, 50)
        else:
            a = random.randint(100, 999)
            b = random.randint(50, 500)
        a, b = max(a, b), min(a, b)
        expr = f"{a} - {b}"
        ans = a - b
    elif subtype == "multiplication":
        if difficulty == "easy":
            a = random.randint(2, 10)
            b = random.randint(2, 10)
        elif difficulty == "medium":
            a = random.randint(2, 12)
            b = random.randint(11, 30)
        else:
            a = random.randint(12, 30)
            b = random.randint(12, 50)
        expr = f"{a} * {b}"
        ans = a * b
    elif subtype == "division":
        if difficulty == "easy":
            b = random.randint(2, 10)
            ans = random.randint(2, 10)
        elif difficulty == "medium":
            b = random.randint(5, 20)
            ans = random.randint(5, 30)
        else:
            b = random.randint(12, 50)
            ans = random.randint(12, 50)
        a = b * ans
        expr = f"{a} / {b}"
    else: # random equations
        if difficulty == "easy":
            a = random.randint(5, 20)
            b = random.randint(5, 20)
            c = random.randint(1, 10)
            op = random.choice(["+", "-"])
            if op == "+":
                expr = f"{a} + {b} - {c}"
                ans = a + b - c
            else:
                a, b = max(a, b), min(a, b)
                expr = f"{a} - {b} + {c}"
                ans = a - b + c
        elif difficulty == "medium":
            a = random.randint(2, 10)
            b = random.randint(2, 12)
            c = random.randint(5, 30)
            op = random.choice(["+", "-"])
            expr = f"({a} * {b}) {op} {c}"
            ans = a * b + c if op == "+" else a * b - c
        else:
            a = random.randint(3, 12)
            b = random.randint(3, 15)
            d = random.randint(2, 10)
            c_ans = random.randint(2, 10)
            c = d * c_ans
            op = random.choice(["+", "-"])
            expr = f"({a} * {b}) {op} ({c} / {d})"
            ans = a * b + c_ans if op == "+" else a * b - c_ans
    return expr, str(ans)

def generate_memory_challenge(difficulty: str):
    subtype = random.choice(["numbers", "colors", "patterns", "sequence"])
    if difficulty == "easy":
        length = 4
        c_len = 3
    elif difficulty == "medium":
        length = 6
        c_len = 4
    else:
        length = 8
        c_len = 5

    if subtype == "numbers":
        digits = [str(random.randint(0, 9)) for _ in range(length)]
        seq_str = " ".join(digits)
        correct_answer = "".join(digits)
    elif subtype == "colors":
        colors_pool = ["Red", "Blue", "Green", "Yellow", "Orange", "Purple", "White", "Black"]
        selected = [random.choice(colors_pool) for _ in range(c_len)]
        seq_str = ", ".join(selected)
        correct_answer = " ".join(selected)
    elif subtype == "patterns":
        patterns_pool = ["Up", "Down", "Left", "Right"]
        selected = [random.choice(patterns_pool) for _ in range(c_len)]
        seq_str = " -> ".join(selected)
        correct_answer = " ".join(selected)
    else: # sequence recall (letters)
        letters = [random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ") for _ in range(length)]
        seq_str = " ".join(letters)
        correct_answer = "".join(letters)
    return seq_str, correct_answer

def generate_pattern_challenge(difficulty: str):
    subtype = random.choice(["next_pattern", "shape_sequence", "number_pattern", "color_pattern"])
    
    if subtype == "next_pattern":
        if difficulty == "easy":
            start = random.choice(["A", "B", "C", "D"])
            step = 1
        elif difficulty == "medium":
            start = random.choice(["A", "B", "C", "D"])
            step = 2
        else:
            start = random.choice(["A", "B", "C", "D"])
            step = 3
        seq = [chr(ord(start) + i * step) for i in range(5)]
        expr = ", ".join(seq[:4]) + ", ?"
        ans = seq[4]
        return f"Find the next pattern: {expr}", ans.upper()

    elif subtype == "shape_sequence":
        if random.choice([True, False]):
            seq_pool = ["Circle", "Square", "Triangle"]
            seq = [seq_pool[i % 3] for i in range(5)]
            expr = ", ".join(seq[:4]) + ", ?"
            ans = seq[4]
        else:
            shapes = ["Triangle", "Square", "Pentagon", "Hexagon", "Heptagon", "Octagon"]
            start_idx = 0 if difficulty == "easy" else (1 if difficulty == "medium" else 2)
            seq = shapes[start_idx:start_idx+5]
            expr = ", ".join(seq[:4]) + ", ?"
            ans = seq[4]
        return f"Complete the shape sequence: {expr}", ans

    elif subtype == "color_pattern":
        color_pools = [
            ["Red", "Blue"],
            ["Green", "Yellow"],
            ["Black", "White"],
            ["Red", "Blue", "Green"]
        ]
        pool = random.choice(color_pools)
        seq = [pool[i % len(pool)] for i in range(5)]
        expr = ", ".join(seq[:4]) + ", ?"
        ans = seq[4]
        return f"Complete the color pattern: {expr}", ans

    else: # number_pattern (arithmetic, geometric, fibonacci, squares, primes)
        p_type = random.choice(["arithmetic", "geometric", "fibonacci", "squares", "primes"])
        if p_type == "arithmetic":
            start = random.randint(1, 20)
            step = random.randint(2, 10)
            seq = [start + i * step for i in range(5)]
            expr = ", ".join(map(str, seq[:4])) + ", ?"
            ans = seq[4]
        elif p_type == "geometric":
            start = random.choice([2, 3, 5])
            ratio = random.choice([2, 3])
            seq = [start * (ratio ** i) for i in range(5)]
            expr = ", ".join(map(str, seq[:4])) + ", ?"
            ans = seq[4]
        elif p_type == "fibonacci":
            seq = [1, 1, 2, 3, 5, 8, 13, 21, 34]
            start_idx = random.randint(0, 3)
            expr = ", ".join(map(str, seq[start_idx:start_idx+4])) + ", ?"
            ans = seq[start_idx+4]
        elif p_type == "squares":
            start = random.randint(1, 5)
            seq = [(start + i) ** 2 for i in range(5)]
            expr = ", ".join(map(str, seq[:4])) + ", ?"
            ans = seq[4]
        else: # primes
            seq = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41]
            start_idx = random.randint(0, len(seq)-5)
            expr = ", ".join(map(str, seq[start_idx:start_idx+4])) + ", ?"
            ans = seq[start_idx+4]
        return f"Complete the number sequence: {expr}", str(ans)

@router.get("/categories", response_model=List[ChallengeCategoryResponse])
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve all challenge categories."""
    return db.query(ChallengeCategory).all()

@router.get("/generate", response_model=ChallengeResponse)
def generate_challenge(
    category_id: Optional[UUID] = None,
    challenge_type: Optional[str] = None,
    difficulty: str = "medium",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a challenge based on category and difficulty, avoiding recent questions."""
    difficulty = difficulty.lower()
    if difficulty not in ["easy", "medium", "hard"]:
        difficulty = "medium"

    # 1. Resolve Category
    category = None
    if category_id:
        category = db.query(ChallengeCategory).filter(ChallengeCategory.id == category_id).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    elif challenge_type:
        challenge_type_lower = challenge_type.lower()
        for cat in db.query(ChallengeCategory).all():
            if challenge_type_lower in cat.name.lower() or cat.name.lower().startswith(challenge_type_lower):
                category = cat
                break
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Category matching '{challenge_type}' not found")
    else:
        categories = db.query(ChallengeCategory).all()
        if not categories:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No categories seeded")
        category = random.choice(categories)


    question_text = ""
    correct_answer = ""
    additional_data = None

    # 2. Check category type and generate or fetch
    if category.name == "Math Problems":
        question_text, correct_answer = generate_math_problem(difficulty)
    elif category.name == "Memory Challenges":
        question_text, correct_answer = generate_memory_challenge(difficulty)
        additional_data = json.dumps({"sequence": question_text})
        question_text = f"Memorize the following sequence: {question_text}"
    elif category.name == "Pattern Recognition":
        question_text, correct_answer = generate_pattern_challenge(difficulty)
    else:
        # Static DB seeded categories (Logic Puzzles, Word Games, Riddles, Quick Quiz)
        # Avoid repeating the last 10 challenges attempted by this user
        recent_attempts = db.query(ChallengeAttempt.challenge_id)\
            .filter(ChallengeAttempt.user_id == current_user.id)\
            .order_by(ChallengeAttempt.attempt_time.desc())\
            .limit(10).all()
        recent_ids = {r[0] for r in recent_attempts}

        challenges_query = db.query(Challenge).filter(
            Challenge.category_id == category.id,
            Challenge.difficulty == difficulty
        )
        
        # Try filtering out recent ones
        available_challenges = [c for c in challenges_query.all() if c.id not in recent_ids]
        if not available_challenges:
            available_challenges = challenges_query.all()
            
        if not available_challenges:
            # Fallback if no questions for this difficulty
            available_challenges = db.query(Challenge).filter(Challenge.category_id == category.id).all()

        if not available_challenges:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No seeded questions found for category")

        selected_challenge = random.choice(available_challenges)
        
        # Create response directly from selected seeded challenge
        return ChallengeResponse(
            id=selected_challenge.id,
            category_id=selected_challenge.category_id,
            category_name=category.name,
            question_text=selected_challenge.question_text,
            difficulty=selected_challenge.difficulty,
            additional_data=selected_challenge.additional_data
        )

    # 3. For procedural challenges, insert them into the DB so they have an ID
    db_challenge = Challenge(
        category_id=category.id,
        question_text=question_text,
        difficulty=difficulty,
        correct_answer=correct_answer,
        additional_data=additional_data
    )
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)

    return ChallengeResponse(
        id=db_challenge.id,
        category_id=db_challenge.category_id,
        category_name=category.name,
        question_text=db_challenge.question_text,
        difficulty=db_challenge.difficulty,
        additional_data=db_challenge.additional_data
    )

@router.post("/submit", response_model=ChallengeSubmitResponse)
def submit_challenge(
    req: ChallengeSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit an answer to a challenge, evaluate score/accuracy, and log attempt/results."""
    # 1. Fetch Challenge
    challenge = db.query(Challenge).filter(Challenge.id == req.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    # 2. Check Answer (case-insensitive, strip whitespace)
    is_correct = False
    cleaned_submitted = req.answer.strip().lower()
    cleaned_correct = challenge.correct_answer.strip().lower()

    if challenge.category.name == "Memory Challenges":
        def clean_mem(val: str) -> str:
            return val.replace(",", "").replace("->", "").replace(" ", "").strip().lower()
        cleaned_submitted = clean_mem(req.answer)
        cleaned_correct = clean_mem(challenge.correct_answer)

    # For Quick Quiz and similar multiple choice, exact match is expected
    if cleaned_submitted == cleaned_correct:
        is_correct = True
    else:
        # Check in additional data if multiple options exist (e.g. Word Games anagram matches)
        if challenge.additional_data:
            try:
                data = json.loads(challenge.additional_data)
                possible_answers = data.get("possible_answers", [])
                if any(cleaned_submitted == ans.strip().lower() for ans in possible_answers):
                    is_correct = True
            except json.JSONDecodeError:
                pass

    # 3. Log Attempt
    attempt = ChallengeAttempt(
        challenge_id=challenge.id,
        user_id=current_user.id,
        answer_submitted=req.answer,
        is_correct=is_correct
    )
    db.add(attempt)
    db.commit()

    if not is_correct:
        return ChallengeSubmitResponse(is_correct=False)

    # 4. If correct, evaluate performance metrics
    base_scores = {"easy": 100, "medium": 200, "hard": 300}
    base = base_scores.get(challenge.difficulty, 100)

    # Score calculation formula: base - time_penalty - attempt_penalty
    time_penalty = int(req.solve_time * 0.5)
    attempt_penalty = (req.attempt_count - 1) * 10
    score = max(20, base - time_penalty - attempt_penalty)

    accuracy = 1.0 / max(1, req.attempt_count)

    # Save ChallengeResult
    result = ChallengeResult(
        alarm_id=req.alarm_id,
        user_id=current_user.id,
        challenge_id=challenge.id,
        score=score,
        accuracy=accuracy,
        completion_time=req.solve_time,
        total_attempts=req.attempt_count
    )
    db.add(result)

    # Log to AlarmHistory if alarm_id is provided
    if req.alarm_id:
        alarm = db.query(Alarm).filter(Alarm.id == req.alarm_id).first()
        if alarm:
            wake_time_str = datetime.now().strftime("%H:%M")
            history_entry = AlarmHistory(
                alarm_id=alarm.id,
                user_id=current_user.id,
                wake_time=wake_time_str,
                solved=True,
                solve_time=req.solve_time
            )
            db.add(history_entry)

    db.commit()

    return ChallengeSubmitResponse(
        is_correct=True,
        correct_answer=challenge.correct_answer,
        score=score,
        accuracy=accuracy
    )


@router.get("/history")
def get_cognitive_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve the current user's challenge performance history."""
    results = db.query(ChallengeResult).filter(ChallengeResult.user_id == current_user.id).order_by(ChallengeResult.solved_at.desc()).all()
    
    total_solved = len(results)
    avg_solve_time = sum(r.completion_time for r in results) / total_solved if total_solved > 0 else 0
    avg_accuracy = sum(r.accuracy for r in results) / total_solved if total_solved > 0 else 0.0
    total_score = sum(r.score for r in results)
    
    attempts = db.query(ChallengeAttempt).filter(ChallengeAttempt.user_id == current_user.id).order_by(ChallengeAttempt.attempt_time.desc()).limit(20).all()
    
    return {
        "summary": {
            "total_solved": total_solved,
            "avg_solve_time": round(avg_solve_time, 1),
            "avg_accuracy": round(avg_accuracy * 100, 1),
            "total_score": total_score
        },
        "results": [
            {
                "id": str(r.id),
                "score": r.score,
                "accuracy": r.accuracy,
                "completion_time": r.completion_time,
                "total_attempts": r.total_attempts,
                "solved_at": r.solved_at
            } for r in results
        ],
        "attempts": [
            {
                "id": str(a.id),
                "challenge_id": str(a.challenge_id),
                "answer_submitted": a.answer_submitted,
                "is_correct": a.is_correct,
                "attempt_time": a.attempt_time
            } for a in attempts
        ]
    }


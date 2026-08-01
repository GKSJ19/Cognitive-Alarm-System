from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from bson import ObjectId

from app.core.database import get_db
from app.models.challenge import CognitiveChallengeModel, ChallengeAttemptModel
from app.models.user import UserModel
from app.api.deps import get_current_active_user
import random

router = APIRouter()

@router.get("/generate", response_model=CognitiveChallengeModel)
async def generate_challenge(
    difficulty: str = "Medium",
    type: str = "Math",
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """
    Generate a cognitive challenge.
    """
    # Simple mockup for now. Later replaced by AI Engine.
    num1, num2 = 0, 0
    if difficulty == "Easy":
        num1, num2 = random.randint(1, 10), random.randint(1, 10)
    elif difficulty == "Medium":
        num1, num2 = random.randint(10, 50), random.randint(10, 50)
    elif difficulty == "Hard":
        num1, num2 = random.randint(50, 200), random.randint(50, 200)
    else:
        num1, num2 = random.randint(1, 5), random.randint(1, 5)
        
    correct = str(num1 + num2)
    options = [correct, str(num1 + num2 + 2), str(num1 + num2 - 1), str(num1 + num2 + 10)]
    random.shuffle(options)
    
    challenge_dict = {
        "type": type,
        "difficulty": difficulty,
        "content": {
            "question": f"What is {num1} + {num2}?",
            "options": options
        },
        "correct_answer": correct
    }
    
    result = await db["cognitive_challenges"].insert_one(challenge_dict)
    challenge_dict["_id"] = result.inserted_id
    
    return CognitiveChallengeModel(**challenge_dict)

@router.post("/submit", response_model=ChallengeAttemptModel)
async def submit_challenge(
    attempt_in: ChallengeAttemptModel,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """
    Submit a challenge answer.
    """
    if not ObjectId.is_valid(attempt_in.challenge_id):
        raise HTTPException(status_code=400, detail="Invalid challenge ID")
        
    challenge = await db["cognitive_challenges"].find_one({"_id": ObjectId(attempt_in.challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
        
    attempt_dict = attempt_in.dict(exclude={"id", "user_id"}, exclude_unset=True)
    attempt_dict["user_id"] = str(current_user.id)
    attempt_dict["is_correct"] = (attempt_in.user_answer == challenge["correct_answer"])
    
    result = await db["challenge_attempts"].insert_one(attempt_dict)
    attempt_dict["_id"] = result.inserted_id
    
    # Update alarm log verification status if correct
    if attempt_dict["is_correct"] and ObjectId.is_valid(attempt_in.alarm_log_id):
        await db["alarm_logs"].update_one(
            {"_id": ObjectId(attempt_in.alarm_log_id)},
            {"$set": {"verification_passed": True, "challenge_id": attempt_in.challenge_id}}
        )
    
    return ChallengeAttemptModel(**attempt_dict)

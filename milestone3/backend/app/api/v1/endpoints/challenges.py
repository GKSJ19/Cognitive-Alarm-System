from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.models.challenge import CognitiveChallengeModel, ChallengeAttemptModel
from app.models.user import UserModel
from app.api.deps import get_current_active_user
from app.services.challenge_engine import ChallengeEngine

router = APIRouter()

@router.get("/", response_model=List[CognitiveChallengeModel])
async def get_challenges(
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Get recent challenges for current user."""
    # Getting from attempts actually makes more sense, but here we can just return recent ones
    cursor = db["cognitive_challenges"].find().sort("generated_at", -1).limit(50)
    challenges = await cursor.to_list(length=50)
    return [CognitiveChallengeModel(**c) for c in challenges]

@router.post("/generate", response_model=CognitiveChallengeModel)
async def generate_challenge(
    difficulty: str = "Medium",
    previous_type: str = None,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Generate a cognitive challenge using the AI Engine."""
    challenge_dict = ChallengeEngine.generate_challenge(difficulty, str(current_user.id), previous_type)
    
    result = await db["cognitive_challenges"].insert_one(challenge_dict)
    challenge_dict["_id"] = result.inserted_id
    
    return CognitiveChallengeModel(**challenge_dict)

@router.get("/history", response_model=List[ChallengeAttemptModel])
async def get_challenge_history(
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    cursor = db["challenge_attempts"].find({"user_id": str(current_user.id)}).sort("attempted_at", -1).limit(100)
    history = await cursor.to_list(length=100)
    return [ChallengeAttemptModel(**h) for h in history]

@router.get("/{challenge_id}", response_model=CognitiveChallengeModel)
async def get_challenge(
    challenge_id: str,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    challenge = await db["cognitive_challenges"].find_one({"_id": ObjectId(challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Not found")
    return CognitiveChallengeModel(**challenge)

@router.post("/submit", response_model=ChallengeAttemptModel)
async def submit_challenge(
    attempt_in: ChallengeAttemptModel,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Submit a challenge answer."""
    if not ObjectId.is_valid(attempt_in.challenge_id):
        raise HTTPException(status_code=400, detail="Invalid challenge ID")
        
    challenge = await db["cognitive_challenges"].find_one({"_id": ObjectId(attempt_in.challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
        
    attempt_dict = attempt_in.dict(exclude={"id", "user_id"}, exclude_unset=True)
    attempt_dict["user_id"] = str(current_user.id)
    attempt_dict["is_correct"] = (attempt_in.user_answer.strip().lower() == challenge["correct_answer"].strip().lower())
    
    # Calculate score based on time
    if attempt_dict["is_correct"]:
        time_ratio = max(0, challenge.get("time_limit_seconds", 60) - attempt_dict["time_taken_seconds"]) / challenge.get("time_limit_seconds", 60)
        attempt_dict["score"] = challenge.get("points", 10) * time_ratio
    else:
        attempt_dict["score"] = 0.0

    result = await db["challenge_attempts"].insert_one(attempt_dict)
    attempt_dict["_id"] = result.inserted_id
    
    return ChallengeAttemptModel(**attempt_dict)

from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from datetime import datetime
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
    Pass difficulty and type per the alarm's configured values.
    """
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
    On correct answer:
      - Marks alarm_log.verification_passed = True
      - Computes and emits challenge_accuracy and alarm_dismissed_on_time
        analytics events for Member 3's Adaptive Difficulty Engine.
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

    # Update alarm log and emit analytics events on correct answer
    if attempt_dict["is_correct"] and ObjectId.is_valid(attempt_in.alarm_log_id):
        alarm_log = await db["alarm_logs"].find_one({"_id": ObjectId(attempt_in.alarm_log_id)})

        # 5.2: Compute challenge_accuracy — correct attempts / total attempts for this log
        total_attempts = await db["challenge_attempts"].count_documents(
            {"alarm_log_id": attempt_in.alarm_log_id, "user_id": str(current_user.id)}
        )
        correct_attempts = await db["challenge_attempts"].count_documents(
            {"alarm_log_id": attempt_in.alarm_log_id, "user_id": str(current_user.id), "is_correct": True}
        )
        challenge_accuracy = round(correct_attempts / total_attempts, 2) if total_attempts > 0 else 1.0

        # 5.2: Compute alarm_dismissed_on_time
        # True if dismissed within (snooze_duration * 2) minutes of ring_time
        dismissed_on_time = None
        if alarm_log and alarm_log.get("ring_time"):
            elapsed_seconds = (datetime.utcnow() - alarm_log["ring_time"]).total_seconds()
            # Fetch alarm to get snooze_duration threshold
            alarm = await db["alarms"].find_one({"_id": ObjectId(alarm_log["alarm_id"])}) if alarm_log.get("alarm_id") else None
            threshold_seconds = (alarm.get("snooze_duration", 5) * 2 * 60) if alarm else 600
            dismissed_on_time = elapsed_seconds <= threshold_seconds

        # Persist analytics fields on the alarm_log
        await db["alarm_logs"].update_one(
            {"_id": ObjectId(attempt_in.alarm_log_id)},
            {"$set": {
                "verification_passed": True,
                "challenge_id": attempt_in.challenge_id,
                "dismiss_time": datetime.utcnow(),
                "challenge_accuracy": challenge_accuracy,       # → Member 3 analytics
                "dismissed_on_time": dismissed_on_time,         # → Member 3 analytics
            }}
        )

        # 5.2: Emit analytics event document for Member 3's pipeline
        await db["analytics_events"].insert_one({
            "event_type": "alarm_dismissed",
            "user_id": str(current_user.id),
            "alarm_log_id": attempt_in.alarm_log_id,
            "alarm_dismissed_on_time": dismissed_on_time,
            "challenge_accuracy": challenge_accuracy,
            "snooze_count": alarm_log.get("snooze_count", 0) if alarm_log else 0,
            "timestamp": datetime.utcnow(),
        })

    return ChallengeAttemptModel(**attempt_dict)

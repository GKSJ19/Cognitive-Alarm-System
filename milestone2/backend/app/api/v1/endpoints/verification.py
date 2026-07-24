from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.models.verification import WakeUpVerificationModel, VerificationStartRequest, VerificationValidateRequest
from app.models.user import UserModel
from app.api.deps import get_current_active_user

router = APIRouter()

@router.post("/start", response_model=WakeUpVerificationModel)
async def start_verification(
    request: VerificationStartRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Start a new wake-up verification process."""
    ver_dict = request.dict()
    ver_dict["user_id"] = str(current_user.id)
    ver_dict["status"] = "pending"
    ver_dict["current_correct_answers"] = 0
    ver_dict["challenges_attempted"] = []
    ver_dict["started_at"] = datetime.utcnow()
    
    diff = ver_dict.get("difficulty", "Medium")
    if diff == "Easy":
        ver_dict["required_correct_answers"] = 1
    elif diff == "Hard":
        ver_dict["required_correct_answers"] = 3
    else:
        ver_dict["required_correct_answers"] = 2
        
    ver_dict["method"] = "Difficulty Based"
    
    result = await db["wakeup_verifications"].insert_one(ver_dict)
    ver_dict["_id"] = result.inserted_id
    
    return WakeUpVerificationModel(**ver_dict)

@router.post("/validate", response_model=WakeUpVerificationModel)
async def validate_verification(
    request: VerificationValidateRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Validate a step in the verification process."""
    if not ObjectId.is_valid(request.verification_id):
        raise HTTPException(status_code=400, detail="Invalid verification ID")
        
    ver = await db["wakeup_verifications"].find_one({"_id": ObjectId(request.verification_id)})
    if not ver:
        raise HTTPException(status_code=404, detail="Verification not found")
        
    updates = {}
    
    if request.is_correct:
        new_count = ver.get("current_correct_answers", 0) + 1
        updates["current_correct_answers"] = new_count
        if new_count >= ver.get("required_correct_answers", 1):
            updates["status"] = "passed"
            updates["completed_at"] = datetime.utcnow()
            
            if ObjectId.is_valid(ver.get("alarm_log_id")):
                await db["alarm_logs"].update_one(
                    {"_id": ObjectId(ver.get("alarm_log_id"))},
                    {"$set": {"verification_passed": True}}
                )
    else:
        # Reset count to 0 to enforce "in a row" consecutive correct answers
        updates["current_correct_answers"] = 0

    # Add attempt to array
    await db["wakeup_verifications"].update_one(
        {"_id": ObjectId(request.verification_id)},
        {"$push": {"challenges_attempted": request.challenge_attempt_id}}
    )
    
    if updates:
        await db["wakeup_verifications"].update_one(
            {"_id": ObjectId(request.verification_id)},
            {"$set": updates}
        )
        
    updated_ver = await db["wakeup_verifications"].find_one({"_id": ObjectId(request.verification_id)})
    return WakeUpVerificationModel(**updated_ver)

@router.get("/status", response_model=WakeUpVerificationModel)
async def get_verification_status(
    verification_id: str,
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Get the current status of a verification."""
    if not ObjectId.is_valid(verification_id):
        raise HTTPException(status_code=400, detail="Invalid verification ID")
        
    ver = await db["wakeup_verifications"].find_one({"_id": ObjectId(verification_id)})
    if not ver:
        raise HTTPException(status_code=404, detail="Verification not found")
        
    return WakeUpVerificationModel(**ver)

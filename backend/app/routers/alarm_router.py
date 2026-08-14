from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.user_model import User
from app.schemas.alarm_schemas import (
    AlarmResponse,
    AlarmCreate,
    AlarmUpdate,
    AlarmHistoryResponse,
    AlarmHistoryCreate,
    CognitiveChallengeResponse,
    AvailableChallengeOption,
    ChallengeVerifyRequest,
    ChallengeVerifyResponse
)
from app.services.alarm_service import AlarmService
from app.services.challenge_service import ChallengeService

router = APIRouter(prefix="/alarms", tags=["Alarm Management"])

@router.get("", response_model=list[AlarmResponse])
async def get_alarms(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all alarms for the authenticated user."""
    return await AlarmService.get_alarms_by_user(db, current_user.id)

@router.post("", response_model=AlarmResponse, status_code=status.HTTP_201_CREATED)
async def create_alarm(
    req: AlarmCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new cognitive alarm."""
    return await AlarmService.create_alarm(db, current_user.id, req)

@router.put("/{alarm_id}", response_model=AlarmResponse)
async def update_alarm(
    alarm_id: str,
    req: AlarmUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a specific alarm configurations."""
    alarm = await AlarmService.update_alarm(db, current_user.id, alarm_id, req)
    if not alarm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alarm not found")
    return alarm

@router.delete("/{alarm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alarm(
    alarm_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a specific alarm."""
    deleted = await AlarmService.delete_alarm(db, current_user.id, alarm_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alarm not found")
    return None

@router.get("/history", response_model=list[AlarmHistoryResponse])
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get history logs for the user's alarms."""
    return await AlarmService.get_alarm_history(db, current_user.id)

@router.post("/dismiss", response_model=AlarmHistoryResponse)
async def dismiss_alarm(
    req: AlarmHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Log an alarm dismissal event after solving a cognitive challenge."""
    history = await AlarmService.log_alarm_dismissal(db, current_user.id, req)
    if not history:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alarm not found")
    return history

# --- Cognitive Challenge Engine Integration Endpoints ---

@router.get("/{alarm_id}/available-challenges", response_model=list[AvailableChallengeOption])
async def get_available_challenges(
    alarm_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve list of available dynamic AI Cognitive Challenges for user selection."""
    return await ChallengeService.get_available_challenges_for_alarm(db, current_user.id, alarm_id)

@router.get("/{alarm_id}/challenge", response_model=CognitiveChallengeResponse)
async def get_alarm_challenge(
    alarm_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate dynamic AI Cognitive Challenge for ringing alarm."""
    return await ChallengeService.get_challenge_for_alarm(db, current_user.id, alarm_id)

@router.post("/{alarm_id}/challenge/verify", response_model=ChallengeVerifyResponse)
async def verify_alarm_challenge(
    alarm_id: str,
    req: ChallengeVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify challenge solution, calculate Honor Score, log dismissal history, and stop alarm."""
    return await ChallengeService.verify_challenge_solution(db, current_user.id, alarm_id, req)



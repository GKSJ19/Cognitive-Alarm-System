from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.schemas.challenge import ChallengeOut, ChallengeFilter, ChallengeSubmission, ChallengeResult
from app.services.challenge_service import ChallengeService

router = APIRouter()


@router.get("/random", response_model=ChallengeOut)
async def get_random_challenge(challenge_type: str | None = None, difficulty: str | None = None, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    service = ChallengeService(session)
    challenge = await service.get_random_challenge(ChallengeFilter(challenge_type=challenge_type, difficulty=difficulty))
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No challenges found")
    return challenge


@router.post("/submit", response_model=ChallengeResult)
async def submit_challenge(payload: ChallengeSubmission, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    service = ChallengeService(session)
    try:
        result = await service.submit_answer(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return result

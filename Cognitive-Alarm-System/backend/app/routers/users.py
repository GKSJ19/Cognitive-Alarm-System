from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.schemas.user import UserOut, UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
async def update_me(payload: UserUpdate, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    service = UserService(session)
    try:
        updated = await service.update_profile(str(current_user.id), payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return updated


@router.delete("/me")
async def deactivate_me(session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    service = UserService(session)
    await service.deactivate_account(str(current_user.id))
    return {"detail": "Account deactivated"}

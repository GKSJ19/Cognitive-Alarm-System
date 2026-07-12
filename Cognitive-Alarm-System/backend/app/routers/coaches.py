from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session

router = APIRouter()


@router.get("/assigned-users")
async def assigned_users(session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    return {"detail": "Coach assignments endpoint"}

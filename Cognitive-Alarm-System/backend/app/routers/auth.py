from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_session
from app.schemas.auth import LoginRequest, RefreshTokenRequest, RegisterRequest, Token
from app.services.auth_service import AuthService
from app.utils.hash import verify_password

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(payload: RegisterRequest, session: AsyncSession = Depends(get_session)):
    service = AuthService(session)
    try:
        user = await service.register(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    access_token, refresh_token = create_access_refresh_tokens(str(user.id))
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)):
    service = AuthService(session)
    payload = LoginRequest(email=form_data.username, password=form_data.password)

    try:
        access_token, refresh_token = await service.login(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
async def refresh(payload: RefreshTokenRequest, session: AsyncSession = Depends(get_session)):
    service = AuthService(session)
    try:
        access_token, refresh_token = await service.refresh_tokens(payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


def create_access_refresh_tokens(subject: str) -> tuple[str, str]:
    from app.auth.jwt import create_access_token, create_refresh_token
    return create_access_token(subject), create_refresh_token(subject)

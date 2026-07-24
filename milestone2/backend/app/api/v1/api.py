from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, alarms, challenges, analytics, verification

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(alarms.router, prefix="/alarms", tags=["alarms"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["challenges"])
api_router.include_router(verification.router, prefix="/verification", tags=["verification"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

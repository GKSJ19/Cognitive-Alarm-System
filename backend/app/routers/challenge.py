from fastapi import APIRouter
from app.services.challenge_service import get_math_challenge

router = APIRouter(
    tags=["Challenge Engine"]
)

@router.get("/math")
def math_challenge():
    return get_math_challenge()
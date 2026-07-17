from fastapi import APIRouter

from app.services.challenge_service import (
    get_math_challenge,
    get_logic_challenge,
    get_memory_challenge,
)

router = APIRouter(
    tags=["Challenge Engine"]
)

@router.get("/math")
def math_challenge():
    return get_math_challenge()

@router.get("/logic")
def logic_challenge():
    return get_logic_challenge()

@router.get("/memory")
def memory_challenge():
    return get_memory_challenge()
from fastapi import APIRouter, Query

from app.schemas.challenge import ChallengeAnswer
from app.schemas.response import UserResponse
from app.services.challenge_service import (
    get_math_challenge,
    get_logic_challenge,
    get_memory_challenge,
    get_attention_challenge,
    check_answer,
    store_response,
)

router = APIRouter(
    tags=["Challenge Engine"]
)

@router.get("/math")
def math_challenge(
    difficulty: str = Query("easy")
):
    return get_math_challenge(difficulty)

@router.get("/logic")
def logic_challenge(
    difficulty: str = Query("easy")
):
    return get_logic_challenge(difficulty)

@router.get("/memory")
def memory_challenge(
    difficulty: str = Query("easy")
):
    return get_memory_challenge(difficulty)

@router.get("/attention")
def attention_challenge(
    difficulty: str = Query("easy")
):
    return get_attention_challenge(difficulty)

@router.post("/check")
def check_challenge_answer(answer: ChallengeAnswer):
    return check_answer(
        answer.correct_answer,
        answer.user_answer
    )

@router.post("/response")
def save_response(response: UserResponse):
    return store_response(response)
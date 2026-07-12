from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.challenge_repository import ChallengeRepository
from app.schemas.challenge import ChallengeFilter, ChallengeSubmission
from app.models.challenge import Challenge


class ChallengeService:
    def __init__(self, session: AsyncSession):
        self.challenge_repo = ChallengeRepository(session)

    async def get_random_challenge(self, filters: ChallengeFilter | None = None) -> Challenge | None:
        if filters and filters.challenge_type:
            challenges = await self.challenge_repo.list_by_type(filters.challenge_type)
            if filters.difficulty:
                challenges = [c for c in challenges if c.difficulty == filters.difficulty]
            return challenges[0] if challenges else None
        return await self.challenge_repo.get_random()

    async def submit_answer(self, payload: ChallengeSubmission) -> dict:
        challenge = await self.challenge_repo.get_by_id(payload.challenge_id)
        if not challenge:
            raise ValueError("Challenge not found")

        correct = challenge.correct_answer.strip().lower() == payload.answer.strip().lower()
        return {
            "correct": correct,
            "expected_answer": challenge.correct_answer,
            "challenge_id": payload.challenge_id,
            "message": "Correct answer" if correct else "Incorrect answer",
        }

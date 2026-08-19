from pydantic import BaseModel


class HabitReport(BaseModel):
    overall_score: float | None
    grade: str | None


class ChallengeReport(BaseModel):
    passed: int
    failed: int
    average_score: float


class DifficultyReport(BaseModel):
    easy: int
    medium: int
    hard: int


class ReportResponse(BaseModel):
    user_id: int
    habit: HabitReport
    challenge_performance: ChallengeReport
    difficulty_distribution: DifficultyReport
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.habit_score import HabitScore
from app.models.evaluation import ChallengeEvaluation
from app.models.adaptive_difficulty import AdaptiveDifficulty


def get_user_report(user_id: int, db: Session):

    # -----------------------------
    # Habit score
    # -----------------------------

    habit = (
        db.query(HabitScore)
        .filter(HabitScore.user_id == user_id)
        .order_by(HabitScore.id.desc())
        .first()
    )

    overall_score = habit.overall_score if habit else None
    grade = habit.grade if habit else None

    # -----------------------------
    # Challenge performance
    # -----------------------------

    passed = (
        db.query(ChallengeEvaluation)
        .filter(
            ChallengeEvaluation.user_id == user_id,
            ChallengeEvaluation.status == "Passed"
        )
        .count()
    )

    failed = (
        db.query(ChallengeEvaluation)
        .filter(
            ChallengeEvaluation.user_id == user_id,
            ChallengeEvaluation.status == "Failed"
        )
        .count()
    )

    average_score = (
        db.query(func.avg(ChallengeEvaluation.score))
        .filter(ChallengeEvaluation.user_id == user_id)
        .scalar()
    )

    average_score = float(average_score or 0)

    # -----------------------------
    # Difficulty distribution
    # -----------------------------

    easy = (
        db.query(AdaptiveDifficulty)
        .filter(
            AdaptiveDifficulty.user_id == user_id,
            AdaptiveDifficulty.current_level == "Easy"
        )
        .count()
    )

    medium = (
        db.query(AdaptiveDifficulty)
        .filter(
            AdaptiveDifficulty.user_id == user_id,
            AdaptiveDifficulty.current_level == "Medium"
        )
        .count()
    )

    hard = (
        db.query(AdaptiveDifficulty)
        .filter(
            AdaptiveDifficulty.user_id == user_id,
            AdaptiveDifficulty.current_level == "Hard"
        )
        .count()
    )

    return {
        "user_id": user_id,

        "habit": {
            "overall_score": overall_score,
            "grade": grade
        },

        "challenge_performance": {
            "passed": passed,
            "failed": failed,
            "average_score": round(average_score, 2)
        },

        "difficulty_distribution": {
            "easy": easy,
            "medium": medium,
            "hard": hard
        }
    }
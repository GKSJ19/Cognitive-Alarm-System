from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.verification import Verification
from app.models.evaluation import ChallengeEvaluation
from app.models.adaptive_difficulty import AdaptiveDifficulty
from app.models.habit_score import HabitScore


def get_user_analytics(user_id: int, db: Session):

    # -----------------------------
    # Verification statistics
    # -----------------------------

    total_challenges = (
        db.query(Verification)
        .filter(Verification.user_id == user_id)
        .count()
    )

    successful_challenges = (
        db.query(Verification)
        .filter(
            Verification.user_id == user_id,
            Verification.is_correct == True
        )
        .count()
    )

    if total_challenges > 0:
        success_rate = (
            successful_challenges / total_challenges
        ) * 100
    else:
        success_rate = 0.0

    # -----------------------------
    # Evaluation statistics
    # -----------------------------

    evaluation_stats = (
        db.query(
            func.avg(ChallengeEvaluation.score),
            func.avg(ChallengeEvaluation.time_taken)
        )
        .filter(ChallengeEvaluation.user_id == user_id)
        .first()
    )

    average_score = float(evaluation_stats[0] or 0)
    average_time_taken = float(evaluation_stats[1] or 0)

    passed_challenges = (
        db.query(ChallengeEvaluation)
        .filter(
            ChallengeEvaluation.user_id == user_id,
            ChallengeEvaluation.status == "Passed"
        )
        .count()
    )

    failed_challenges = (
        db.query(ChallengeEvaluation)
        .filter(
            ChallengeEvaluation.user_id == user_id,
            ChallengeEvaluation.status == "Failed"
        )
        .count()
    )

    # -----------------------------
    # Adaptive difficulty
    # -----------------------------

    difficulty = (
        db.query(AdaptiveDifficulty)
        .filter(AdaptiveDifficulty.user_id == user_id)
        .order_by(AdaptiveDifficulty.id.desc())
        .first()
    )

    current_difficulty = (
        difficulty.current_level
        if difficulty else None
    )

    next_difficulty = (
        difficulty.next_level
        if difficulty else None
    )

    # -----------------------------
    # Habit score
    # -----------------------------

    habit = (
        db.query(HabitScore)
        .filter(HabitScore.user_id == user_id)
        .order_by(HabitScore.id.desc())
        .first()
    )

    habit_score = (
        habit.overall_score
        if habit else None
    )

    habit_grade = (
        habit.grade
        if habit else None
    )

    # -----------------------------
    # Final analytics response
    # -----------------------------

    return {
        "user_id": user_id,
        "total_challenges": total_challenges,
        "successful_challenges": successful_challenges,
        "success_rate": round(success_rate, 2),

        "average_score": round(average_score, 2),
        "average_time_taken": round(average_time_taken, 2),

        "passed_challenges": passed_challenges,
        "failed_challenges": failed_challenges,

        "current_difficulty": current_difficulty,
        "next_difficulty": next_difficulty,

        "habit_score": habit_score,
        "habit_grade": habit_grade
    }
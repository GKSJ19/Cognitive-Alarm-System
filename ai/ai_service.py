"""
AI Service

Provides a single interface for the backend
to communicate with the AI module.
"""

from challenge_engine import (
    CognitiveChallengeEngine,
    Category,
    Difficulty
)

from wake_up_verification import WakeUpVerification
from habit_score import HabitScore
from behavior_analysis import BehaviorAnalysis
from recommendation_engine import RecommendationEngine


class AIService:

    def __init__(self):

        self.engine = CognitiveChallengeEngine()
        self.verification = WakeUpVerification(required_correct=2)

        self.habit = HabitScore()
        self.analysis = BehaviorAnalysis()
        self.recommendation = RecommendationEngine()

    # ----------------------------------------
    # Generate Challenge
    # ----------------------------------------

    def generate_challenge(
        self,
        category,
        difficulty
    ):

        category_map = {
            "math": Category.MATH,
            "logic": Category.LOGIC,
            "memory": Category.MEMORY,
            "word_games": Category.WORD_GAMES,
            "pattern_recognition": Category.PATTERN_RECOGNITION,
            "riddles": Category.RIDDLES,
            "quick_quiz": Category.QUICK_QUIZ
        }

        difficulty_map = {
            "easy": Difficulty.EASY,
            "medium": Difficulty.MEDIUM,
            "hard": Difficulty.HARD
        }

        return self.engine.generate(
            category=category_map[category],
            difficulty=difficulty_map[difficulty]
        )

    # ----------------------------------------
    # Validate Answer
    # ----------------------------------------

    def validate_answer(
        self,
        challenge,
        answer
    ):

        return self.engine.validate(
            challenge,
            answer
        )

    # ----------------------------------------
    # Wake-up Verification
    # ----------------------------------------

    def verify(self, is_correct):

        self.verification.update(is_correct)

        return self.verification.is_verified()

    # ----------------------------------------
    # Behavior Analysis
    # ----------------------------------------

    def record_behavior(
        self,
        is_correct,
        response_time,
        xp
    ):

        self.analysis.record_attempt(
            is_correct=is_correct,
            response_time=response_time,
            xp=xp
        )

    # ----------------------------------------
    # Habit Score
    # ----------------------------------------

    def calculate_habit_score(
        self,
        is_correct,
        response_time
    ):

        return self.habit.calculate_score(
            is_correct=is_correct,
            wakeup_verified=self.verification.is_verified(),
            response_time=response_time,
            streak=self.verification.correct_streak
        )

    # ----------------------------------------
    # Recommendation
    # ----------------------------------------

    def get_recommendations(
        self,
        habit_score
    ):

        report = self.analysis.analyze_user()

        return self.recommendation.generate_recommendation(
            habit_score,
            report["Success Rate (%)"],
            report["Average Response Time (sec)"]
        )

    # ----------------------------------------
    # Behavior Report
    # ----------------------------------------

    def behavior_report(self):

        return self.analysis.analyze_user()
"""
AI Module — Adaptive Intelligence engines for the Cognitive Alarm Platform.

Provides four modular engines:
  1. AdaptiveDifficultyEngine  — determines challenge difficulty tier
  2. HabitScoringEngine        — computes weighted habit scores
  3. RecommendationEngine      — generates rule-based recommendations
  4. BehavioralAnalyticsEngine — computes daily behavioural metrics
"""

from app.modules.ai.adaptive_difficulty import AdaptiveDifficultyEngine
from app.modules.ai.behavioral_analytics import BehavioralAnalyticsEngine
from app.modules.ai.habit_scoring import HabitScoringEngine
from app.modules.ai.recommendation_engine import RecommendationEngine

__all__ = [
    "AdaptiveDifficultyEngine",
    "BehavioralAnalyticsEngine",
    "HabitScoringEngine",
    "RecommendationEngine",
]

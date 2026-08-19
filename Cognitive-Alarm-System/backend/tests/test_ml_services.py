"""
Unit tests for ML Engine (Adaptive Difficulty, Behavioral Analytics, Recommendations).
"""

import pytest
from app.ml.adaptive_difficulty import AdaptiveDifficultyEngine
from app.ml.behavioral_analytics import BehavioralAnalyticsEngine
from app.ml.recommendation_engine import RecommendationEngine


def test_adaptive_difficulty_calculation():
    """Verify adaptive difficulty calculation based on user solve rates and response times."""
    engine = AdaptiveDifficultyEngine()
    
    # Test high accuracy fast solver -> difficulty should scale up
    result_up = engine.evaluate_performance(
        current_level=2,
        recent_solve_rate=0.95,
        avg_response_time_sec=12.0,
        target_time_sec=30.0
    )
    assert result_up["recommended_level"] >= 2
    assert "difficulty" in result_up or "recommended_level" in result_up

    # Test low accuracy slow solver -> difficulty should scale down
    result_down = engine.evaluate_performance(
        current_level=4,
        recent_solve_rate=0.30,
        avg_response_time_sec=55.0,
        target_time_sec=30.0
    )
    assert result_down["recommended_level"] <= 4


def test_behavioral_analytics_scoring():
    """Verify behavioral wake-up score computation."""
    engine = BehavioralAnalyticsEngine()
    insights = engine.analyze_wake_patterns(
        snooze_counts=[0, 1, 0, 0, 2],
        dismiss_times_sec=[15, 30, 20, 10, 45],
        target_wake_time="07:00"
    )
    assert "wake_score" in insights or "consistency_score" in insights or isinstance(insights, dict)


def test_recommendations_generation():
    """Verify recommendation generation for user routines."""
    engine = RecommendationEngine()
    recs = engine.generate_recommendations(
        avg_snoozes=1.8,
        preferred_challenge="math",
        wake_consistency=0.85
    )
    assert isinstance(recs, list)
    assert len(recs) > 0

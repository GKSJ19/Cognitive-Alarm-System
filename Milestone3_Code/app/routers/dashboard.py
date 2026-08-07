from fastapi import APIRouter, HTTPException

from app.database.db_simulation import get_user, update_user_difficulty
from app.models.schemas import (
    AdaptiveLevelResponse,
    HabitScoreResponse,
    RecommendationResponse,
)
from app.services.adaptive_engine import AdaptiveDifficultyEngine
from app.services.analytics_engine import BehavioralAnalyticsEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.scoring_engine import HabitScoringEngine

router = APIRouter()

def get_user_or_404(user_id: str) -> dict:
    user_data = get_user(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return user_data

@router.get("/dashboard", summary="Get complete dashboard data")
def get_dashboard(user_id: str):
    user_data = get_user_or_404(user_id)
    analytics = BehavioralAnalyticsEngine.analyze_behavior(user_data)
    score, classification = HabitScoringEngine.calculate_score(user_data)
    recommendations = RecommendationEngine.generate(user_data, analytics, score)
    new_level = AdaptiveDifficultyEngine.calculate_new_level(user_data['current_difficulty'], user_data['success_rate'])
    
    return {
        "user_id": user_id,
        "analytics": analytics,
        "habit_score": score,
        "classification": classification,
        "recommendations": recommendations,
        "adaptive_difficulty": {
            "current": user_data['current_difficulty'],
            "recommended": new_level
        }
    }

@router.get("/analytics", summary="Get behavioral analytics")
def get_analytics(user_id: str):
    user_data = get_user_or_404(user_id)
    analytics = BehavioralAnalyticsEngine.analyze_behavior(user_data)
    return {"user_id": user_id, "analytics": analytics}

@router.get("/habit-score", response_model=HabitScoreResponse, summary="Get user habit score")
def get_habit_score(user_id: str):
    user_data = get_user_or_404(user_id)
    score, classification = HabitScoringEngine.calculate_score(user_data)
    return HabitScoreResponse(
        user_id=user_id,
        habit_score=score,
        classification=classification
    )

@router.get("/recommendation", response_model=RecommendationResponse, summary="Get personalized recommendations")
def get_recommendation(user_id: str):
    user_data = get_user_or_404(user_id)
    analytics = BehavioralAnalyticsEngine.analyze_behavior(user_data)
    score, _ = HabitScoringEngine.calculate_score(user_data)
    recommendations = RecommendationEngine.generate(user_data, analytics, score)
    
    return RecommendationResponse(
        user_id=user_id,
        recommendations=recommendations
    )

@router.get("/adaptive-level", response_model=AdaptiveLevelResponse, summary="Get adaptive difficulty level")
def get_adaptive_level(user_id: str):
    user_data = get_user_or_404(user_id)
    current_level = user_data["current_difficulty"]
    success_rate = user_data["success_rate"]
    
    new_level = AdaptiveDifficultyEngine.calculate_new_level(current_level, success_rate)
    
    reason = "Maintained level due to average performance."
    if new_level != current_level:
        if success_rate >= 85.0:
            reason = "Increased difficulty due to high success rate."
        else:
            reason = "Reduced difficulty due to high failure rate."
            
    # Update DB simulation
    update_user_difficulty(user_id, new_level)
            
    return AdaptiveLevelResponse(
        user_id=user_id,
        current_level=current_level,
        new_level=new_level,
        reason=reason
    )

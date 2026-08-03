from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.dependencies import get_db, get_current_user
from app.models import User, Recommendation
from app.schemas import RecommendationResponse
from app.recommendation_engine.service import generate_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendation Engine"])

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve unread personalized recommendations for the current user."""
    # Automatically generate fresh recommendations based on user history first
    generate_recommendations(current_user.id, db)

    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id,
        Recommendation.is_read == False
    ).order_by(Recommendation.created_at.desc()).all()
    return recommendations

@router.patch("/{recommendation_id}/read", response_model=RecommendationResponse)
def mark_recommendation_read(
    recommendation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a recommendation as read."""
    recommendation = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id,
        Recommendation.user_id == current_user.id
    ).first()

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )

    recommendation.is_read = True
    db.commit()
    db.refresh(recommendation)
    return recommendation

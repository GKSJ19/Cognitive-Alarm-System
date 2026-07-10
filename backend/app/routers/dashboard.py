from typing import Any

from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/stats", summary="Get dashboard statistics")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Return dummy dashboard statistics for Milestone 1."""
    return {
        "success": True,
        "data": {
            "habit_score": 95,
            "habit_score_change": 5.0,
            "avg_wake_time": "06:30 AM",
            "puzzle_accuracy": 92.4,
            "puzzle_accuracy_change": 1.2,
            "weekly_scores": [
                {"name": "Mon", "score": 65},
                {"name": "Tue", "score": 72},
                {"name": "Wed", "score": 68},
                {"name": "Thu", "score": 85},
                {"name": "Fri", "score": 82},
                {"name": "Sat", "score": 90},
                {"name": "Sun", "score": 95},
            ],
            "upcoming_alarms": [
                {
                    "time": "06:00 AM",
                    "days": "Mon, Tue, Wed",
                    "type": "Math Hard",
                    "active": True,
                },
                {
                    "time": "07:30 AM",
                    "days": "Sat, Sun",
                    "type": "Memory Medium",
                    "active": True,
                },
                {
                    "time": "05:00 AM",
                    "days": "One-time",
                    "type": "Logic Expert",
                    "active": False,
                },
            ],
            "recent_activity": [
                {
                    "action": "Completed morning routine",
                    "time": "2 hours ago",
                    "type": "habit",
                },
                {
                    "action": "Solved Math puzzle (Hard)",
                    "time": "3 hours ago",
                    "type": "puzzle",
                },
                {
                    "action": "Alarm triggered at 06:00 AM",
                    "time": "5 hours ago",
                    "type": "alarm",
                },
                {
                    "action": "Updated profile settings",
                    "time": "1 day ago",
                    "type": "settings",
                },
            ],
        },
    }

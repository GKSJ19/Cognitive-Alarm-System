"""
Recommendation Engine

Covers the diagram's "Recommendation Model" requirement:
personalized suggestions for sleep/wake-up/habit/productivity improvement.

Logic: takes a user's habit score components (from habit_scoring.py),
finds the weakest-scoring component, and maps it to the matching
recommendation category from the content library (mongodb/content.json).

This connects: raw data -> features -> habit score -> recommendation,
completing the full chain for this user.
"""

import os
import sys

# ---------------------------------------------------------------------------
# SAMPLE DATA (stand-in for real DB call, matching real mongodb/content.json)
# ---------------------------------------------------------------------------

SAMPLE_CONTENT = [
    {
        "content_id": "CT001",
        "category": "Sleep Improvement",
        "title": "Maintain a Consistent Sleep Schedule",
        "description": "Go to bed and wake up at the same time every day.",
        "status": "Active",
    },
    {
        "content_id": "CT002",
        "category": "Wake-up Optimization",
        "title": "Place Alarm Away From Bed",
        "description": "Keep the alarm away from your bed so you need to get up to turn it off.",
        "status": "Active",
    },
    {
        "content_id": "CT003",
        "category": "Habit Improvement",
        "title": "Avoid Late Snoozing",
        "description": "Try to reduce repeated snoozing to improve wake-up consistency.",
        "status": "Active",
    },
    {
        "content_id": "CT004",
        "category": "Productivity",
        "title": "Start With a Morning Task",
        "description": "Begin the day with one simple planned task.",
        "status": "Active",
    },
    {
        "content_id": "CT005",
        "category": "Personalized Challenge",
        "title": "Use Your Preferred Challenge Type",
        "description": "Choose challenge types that match your preference and current difficulty level.",
        "status": "Active",
    },
]

# Maps each habit score component to the content category that addresses it
COMPONENT_TO_CATEGORY = {
    "wake_up_consistency": "Wake-up Optimization",
    "snooze_reduction": "Habit Improvement",
    "sleep_schedule_adherence": "Sleep Improvement",
    "challenge_completion": "Personalized Challenge",
}


def fetch_content_by_category(category: str) -> dict:
    """
    Returns the active content item matching a given category.
    (from MongoDB content collection).
    """
    for item in SAMPLE_CONTENT:
        if item["category"] == category and item["status"] == "Active":
            return item
    return None


def find_weakest_component(components: dict) -> str:
    """
    Given the four habit score components, returns the name of the
    lowest-scoring one. Ties are broken by dict order (first lowest found).
    """
    return min(components, key=components.get)


def recommend_for_components(components: dict) -> dict:
    """
    Core recommendation logic: takes the four component scores and
    returns the single most relevant recommendation, tied to whichever
    component is weakest.

    If every component is already a perfect 100, there's no genuine
    weak spot to target -- return a general encouragement instead of
    an arbitrary pick.
    """
    weakest = find_weakest_component(components)
    weakest_score = components[weakest]

    if weakest_score >= 100.0:
        return {
            "weakest_component": None,
            "weakest_score": 100.0,
            "recommended_category": "Productivity",
            "recommendation": fetch_content_by_category("Productivity"),
        }

    category = COMPONENT_TO_CATEGORY[weakest]
    content = fetch_content_by_category(category)

    return {
        "weakest_component": weakest,
        "weakest_score": weakest_score,
        "recommended_category": category,
        "recommendation": content,
    }


def get_recommendation_for_user(user_id: int) -> dict:
    """
    Full pipeline version: pulls a user's real habit score + components
    via habit_scoring.py, then returns their personalized recommendation.

    This is the main entry point other modules (e.g. main.py / FastAPI)
    should use.
    """
    # ai_ml/ sits one level up from ai_ml/pipelines/ (where this file lives)
    ai_ml_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if ai_ml_dir not in sys.path:
        sys.path.append(ai_ml_dir)

    from habit_scoring import calculate_habit_score_for_user

    result = calculate_habit_score_for_user(user_id)
    recommendation = recommend_for_components(result["components"])

    return {
        "user_id": user_id,
        "habit_score": result["habit_score"],
        **recommendation,
    }


if __name__ == "__main__":
    print("=== Recommendation Engine: Demo (Real Data) ===\n")

    for user_id in range(1, 6):
        result = get_recommendation_for_user(user_id)
        print(f"User {result['user_id']} (Habit Score: {result['habit_score']})")
        print(f"  Weakest area: {result['weakest_component']} ({result['weakest_score']})")
        rec = result["recommendation"]
        if rec:
            print(f"  Recommendation: \"{rec['title']}\" — {rec['description']}")
        else:
            print("  Recommendation: none found for this category")
        print()
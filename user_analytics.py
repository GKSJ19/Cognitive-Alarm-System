def get_user_analytics(
    user_id,
    habit_score,
    sleep_score,
    challenge_score,
    recommendation,
    progress
):
    return {
        "user_id": user_id,
        "habit_score": habit_score,
        "sleep_score": sleep_score,
        "challenge_score": challenge_score,
        "recommendation": recommendation,
        "progress": f"{progress}%"
    }
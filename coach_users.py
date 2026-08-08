def get_coach_users(
    user_id,
    user_name,
    habit_score,
    sleep_score,
    progress
):
    return {
        "user_id": user_id,
        "user_name": user_name,
        "habit_score": habit_score,
        "sleep_score": sleep_score,
        "progress": f"{progress}%"
    }
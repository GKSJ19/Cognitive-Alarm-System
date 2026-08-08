def get_coach_dashboard(
    active_users,
    average_habit_score,
    average_sleep_score,
    average_challenge_score,
    completed_alarms,
    missed_alarms
):
    return {
        "active_users": active_users,
        "average_habit_score": average_habit_score,
        "average_sleep_score": average_sleep_score,
        "average_challenge_score": average_challenge_score,
        "completed_alarms": completed_alarms,
        "missed_alarms": missed_alarms
    }
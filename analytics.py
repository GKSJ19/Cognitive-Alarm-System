def calculate_habit_score(on_time_rate,
                          challenge_success,
                          snooze_rate):
    score = (
        (on_time_rate) * 0.5 +
        (challenge_success) * 0.3 +
        (snooze_rate) * 0.2
    )

    return round(score, 2)
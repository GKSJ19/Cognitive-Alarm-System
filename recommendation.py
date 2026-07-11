def recommendation(score):
    if score >= 90:
        return "Excellent! Keep following your healthy routine."
    elif score >= 70:
        return "Good progress! Try reducing snooze time."
    else:
        return "Wake up on time and avoid using the snooze button frequently."
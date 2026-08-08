def calculate_sleep_score(hours, quality):
    score = (hours * 10) + (quality * 4)
    if score > 100:
        score = 100
    return {
        "Sleep Hours": hours,
        "Sleep Quality": quality,
        "Sleep Score": score
    }
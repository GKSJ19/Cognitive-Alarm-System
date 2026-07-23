def calculate_challenge_score(correct, total):
    if total == 0:
        return 0

    score = (correct / total) * 100
    return round(score, 2)
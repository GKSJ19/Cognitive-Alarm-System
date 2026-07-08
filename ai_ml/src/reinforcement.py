"""
Adaptive Difficulty Engine (Elo-based)

Adjusts each user's cognitive challenge difficulty based on their performance,
similar to how chess Elo ratings work: users gain rating for correct/fast
answers and lose rating for incorrect/slow ones. The rating then maps to a
difficulty level.

Input shape matches mongodb/challenge_data.json:
    difficulty_level, is_correct, completion_time_seconds

Output/state shape matches mongodb/user_preferences.json:
    current_difficulty
"""

# Difficulty levels ordered from easiest to hardest
DIFFICULTY_LEVELS = ["Beginner", "Easy", "Medium", "Hard", "Expert"]

# Each difficulty level has a baseline "challenge rating" it represents
DIFFICULTY_RATING = {
    "Beginner": 800,
    "Easy": 1000,
    "Medium": 1200,
    "Hard": 1400,
    "Expert": 1600,
}

DEFAULT_USER_RATING = 1000  # starting point, matches "Easy"
K_FACTOR = 32  # how aggressively ratings shift per attempt (standard Elo value)

# Time thresholds (seconds) used to detect a "fast" vs "slow" correct answer
FAST_ANSWER_SECONDS = 15
SLOW_ANSWER_SECONDS = 30


def expected_score(user_rating: float, challenge_rating: float) -> float:
    """
    Standard Elo expected-outcome formula.
    Returns a value between 0 and 1 representing the probability
    the user should succeed at this challenge, given both ratings.
    """
    return 1 / (1 + 10 ** ((challenge_rating - user_rating) / 400))


def actual_score(is_correct: bool, completion_time_seconds: float) -> float:
    """
    Converts a challenge attempt into an Elo-style outcome score (0 to 1),
    factoring in not just correctness but also speed.
    """
    if not is_correct:
        return 0.0

    if completion_time_seconds <= FAST_ANSWER_SECONDS:
        return 1.0  # correct and fast: full win
    elif completion_time_seconds <= SLOW_ANSWER_SECONDS:
        return 0.75  # correct but average speed: partial win
    else:
        return 0.5  # correct but slow: barely a win


def update_user_rating(
    user_rating: float,
    difficulty_level: str,
    is_correct: bool,
    completion_time_seconds: float,
) -> float:
    """
    Updates a user's skill rating after one challenge attempt.
    """
    challenge_rating = DIFFICULTY_RATING.get(difficulty_level, DEFAULT_USER_RATING)

    expected = expected_score(user_rating, challenge_rating)
    actual = actual_score(is_correct, completion_time_seconds)

    new_rating = user_rating + K_FACTOR * (actual - expected)
    return round(new_rating, 2)


def rating_to_difficulty(rating: float) -> str:
    """
    Maps a numeric skill rating to the nearest difficulty level.
    """
    closest_level = min(
        DIFFICULTY_LEVELS,
        key=lambda level: abs(DIFFICULTY_RATING[level] - rating),
    )
    return closest_level


def process_attempt(
    user_rating: float,
    difficulty_level: str,
    is_correct: bool,
    completion_time_seconds: float,
) -> dict:
    """
    Full pipeline for one challenge attempt:
    takes the user's current rating + this attempt's result,
    returns the new rating and the recommended next difficulty.
    """
    new_rating = update_user_rating(
        user_rating, difficulty_level, is_correct, completion_time_seconds
    )
    next_difficulty = rating_to_difficulty(new_rating)

    return {
        "previous_rating": user_rating,
        "new_rating": new_rating,
        "next_difficulty": next_difficulty,
    }


if __name__ == "__main__":
    # Simulated scenario using real field shapes from challenge_data.json
    print("=== Adaptive Difficulty Engine: Demo ===\n")

    user_rating = DEFAULT_USER_RATING  # starts at 1000 ("Easy")
    print(f"Starting rating: {user_rating} -> {rating_to_difficulty(user_rating)}\n")

    # Simulated attempts, similar shape to real challenge_data.json entries
    attempts = [
        {"difficulty_level": "Easy", "is_correct": True, "completion_time_seconds": 12},
        {"difficulty_level": "Easy", "is_correct": True, "completion_time_seconds": 10},
        {"difficulty_level": "Medium", "is_correct": True, "completion_time_seconds": 18},
        {"difficulty_level": "Medium", "is_correct": False, "completion_time_seconds": 35},
        {"difficulty_level": "Medium", "is_correct": True, "completion_time_seconds": 14},
    ]

    for i, attempt in enumerate(attempts, start=1):
        result = process_attempt(user_rating, **attempt)
        print(
            f"Attempt {i}: difficulty={attempt['difficulty_level']}, "
            f"correct={attempt['is_correct']}, "
            f"time={attempt['completion_time_seconds']}s"
        )
        print(
            f"  Rating: {result['previous_rating']} -> {result['new_rating']} "
            f"| Next difficulty: {result['next_difficulty']}\n"
        )
        user_rating = result["new_rating"]
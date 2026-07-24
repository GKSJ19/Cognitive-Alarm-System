import random
from app.services.challenge_service import (
    math_problems, logic_puzzles, memory_challenges,
    word_games, pattern_recognition, riddles, quick_quizzes,
)

CATEGORY_MODULES = {
    "math": math_problems,
    "logic": logic_puzzles,
    "memory": memory_challenges,
    "word_game": word_games,
    "pattern": pattern_recognition,
    "riddle": riddles,
    "quiz": quick_quizzes,
}

# Which categories best fit each goal type — weighted, not exclusive
GOAL_CATEGORY_WEIGHTS = {
    "study": {"math": 3, "logic": 3, "word_game": 2, "quiz": 2, "memory": 2, "pattern": 1, "riddle": 1},
    "work": {"logic": 3, "math": 2, "pattern": 2, "quiz": 2, "memory": 1, "word_game": 1, "riddle": 1},
    "fitness": {"riddle": 2, "quiz": 2, "word_game": 2, "pattern": 2, "memory": 2, "math": 1, "logic": 1},
}

def pick_category(goal_type: str = None):
    weights = GOAL_CATEGORY_WEIGHTS.get(goal_type)
    if not weights:
        return random.choice(list(CATEGORY_MODULES.keys()))
    categories = list(weights.keys())
    weight_values = list(weights.values())
    return random.choices(categories, weights=weight_values, k=1)[0]

def generate_challenge(goal_type: str = None, difficulty: str = "medium"):
    category = pick_category(goal_type)
    question, answer = CATEGORY_MODULES[category].generate(difficulty)
    return category, question, answer
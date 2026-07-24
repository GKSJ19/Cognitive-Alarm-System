import random

EASY_QUIZZES = [
    ("What is the capital of France?", "paris"),
    ("How many continents are there?", "7"),
    ("What planet is known as the Red Planet?", "mars"),
    ("What gas do plants absorb from the air?", "carbon dioxide"),
]

HARD_QUIZZES = [
    ("What is the chemical symbol for gold?", "au"),
    ("Which planet has the most moons in our solar system?", "saturn"),
    ("In what year did World War II end?", "1945"),
    ("What is the powerhouse of the cell called?", "mitochondria"),
]


def generate(difficulty: str = "medium"):
    pool = HARD_QUIZZES if difficulty in ("hard", "expert") else EASY_QUIZZES
    question, answer = random.choice(pool)
    return question, answer
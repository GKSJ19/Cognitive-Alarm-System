import random

EASY_RIDDLES = [
    ("What has to be broken before you can use it?", "egg"),
    ("The more you take, the more you leave behind. What am I?", "footsteps"),
    ("What gets wetter as it dries?", "towel"),
    ("What has hands but can't clap?", "clock"),
]

HARD_RIDDLES = [
    ("The more of me you take, the more you leave behind. What am I? (not footsteps)", "footsteps"),
    ("I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?", "echo"),
    ("What can travel around the world while staying in a corner?", "stamp"),
    ("The person who makes it sells it. The person who buys it never uses it. What is it?", "coffin"),
]


def generate(difficulty: str = "medium"):
    pool = HARD_RIDDLES if difficulty in ("hard", "expert") else EASY_RIDDLES
    question, answer = random.choice(pool)
    return question, answer
import random

EASY_WORDS = ["calm", "happy", "brave", "quiet", "sunny"]
HARD_WORDS = ["motivated", "determined", "ambitious", "vibrant", "tranquil"]

SYNONYM_PAIRS_EASY = [("calm", "peaceful"), ("driven", "motivated"), ("lively", "energetic")]
SYNONYM_PAIRS_HARD = [("cheerful", "joyful"), ("grateful", "thankful"), ("determined", "focused")]

ANTONYM_PAIRS_EASY = [("energetic", "tired"), ("joyful", "sad")]
ANTONYM_PAIRS_HARD = [("motivated", "lazy"), ("peaceful", "restless"), ("hopeful", "discouraged")]

VOCAB_ITEMS_EASY = [
    ("A word meaning 'full of energy' is ENER____", "energetic"),
    ("A word meaning 'calm and untroubled' is PEACE____", "peaceful"),
]
VOCAB_ITEMS_HARD = [
    ("A word meaning 'feeling thankful' is GRATE____", "grateful"),
    ("A word meaning 'filled with hope' is HOPE____", "hopeful"),
]


def generate(difficulty: str = "medium"):
    hard_tier = difficulty in ("hard", "expert")
    subtype = random.choice(["unscramble", "synonym", "antonym", "vocabulary"])

    if subtype == "unscramble":
        word = random.choice(HARD_WORDS if hard_tier else EASY_WORDS)
        letters = list(word)
        random.shuffle(letters)
        question = f"Unscramble this word to start your day right: {''.join(letters)}"
        answer = word
    elif subtype == "synonym":
        word, answer = random.choice(SYNONYM_PAIRS_HARD if hard_tier else SYNONYM_PAIRS_EASY)
        question = f"Give a synonym for: {word}"
    elif subtype == "antonym":
        word, answer = random.choice(ANTONYM_PAIRS_HARD if hard_tier else ANTONYM_PAIRS_EASY)
        question = f"Give the opposite (antonym) of: {word}"
    else:
        question, answer = random.choice(VOCAB_ITEMS_HARD if hard_tier else VOCAB_ITEMS_EASY)
    return question, answer
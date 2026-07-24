import random

EASY_REASONING = [
    ("If all cats are animals, and Tom is a cat, is Tom an animal? (yes/no)", "yes"),
    ("If it is raining, the ground is wet. The ground is not wet. Is it raining? (yes/no)", "no"),
]

HARD_REASONING = [
    ("All roses are flowers. Some flowers fade quickly. Can we conclude all roses fade quickly? (yes/no)", "no"),
    ("If no fish can fly, and a salmon is a fish, can a salmon fly? (yes/no)", "no"),
    ("Every A is a B. Every B is a C. Is every A a C? (yes/no)", "yes"),
]

EASY_MISSING = [("2, 4, 6, _, 10", "8"), ("1, 4, 9, 16, _", "25"), ("5, 10, 15, _, 25", "20")]
HARD_MISSING = [("1, 1, 2, 3, 5, _", "8"), ("2, 6, 12, 20, _", "30"), ("3, 8, 15, 24, _", "35")]


def generate(difficulty: str = "medium"):
    hard_tier = difficulty in ("hard", "expert")
    subtype = random.choice(["number_pattern", "logical_reasoning", "missing_element"])

    if subtype == "number_pattern":
        step = random.randint(4, 9) if hard_tier else random.randint(2, 5)
        start = random.randint(1, 10)
        sequence = [start + step * i for i in range(4)]
        answer = start + step * 4
        question = f"What comes next in the sequence: {', '.join(map(str, sequence))}, ?"
    elif subtype == "logical_reasoning":
        pool = HARD_REASONING if hard_tier else EASY_REASONING
        question, answer = random.choice(pool)
    else:
        pool = HARD_MISSING if hard_tier else EASY_MISSING
        q, answer = random.choice(pool)
        question = f"Find the missing number: {q}"
    return question, str(answer)
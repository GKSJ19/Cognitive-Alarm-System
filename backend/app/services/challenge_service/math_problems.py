import random

# Ranges get harder as difficulty increases
RANGES = {
    "beginner": (1, 10),
    "easy": (1, 20),
    "medium": (1, 50),
    "hard": (10, 100),
    "expert": (50, 500),
}


def generate(difficulty: str = "medium"):
    low, high = RANGES.get(difficulty, RANGES["medium"])
    ops = ["+", "-"] if difficulty in ("beginner", "easy") else ["+", "-", "*"]
    subtype_choices = ["arithmetic"] if difficulty == "beginner" else ["arithmetic", "percentage", "algebra"]
    subtype = random.choice(subtype_choices)

    if subtype == "arithmetic":
        a, b = random.randint(low, high), random.randint(low, high)
        op = random.choice(ops)
        answer = {"+": a + b, "-": a - b, "*": a * b}[op]
        question = f"What is {a} {op} {b}?"
    elif subtype == "percentage":
        base = random.randint(max(low, 20), high * 2 if difficulty in ("hard", "expert") else 400)
        pct_choices = [10, 25, 50] if difficulty == "easy" else [5, 10, 15, 20, 25, 33, 50, 75]
        pct = random.choice(pct_choices)
        answer = round(base * pct / 100)
        question = f"What is {pct}% of {base}?"
    else:
        x = random.randint(low, high)
        b = random.randint(low, high)
        result = x + b
        question = f"If x + {b} = {result}, what is x?"
        answer = x
    return question, str(answer)
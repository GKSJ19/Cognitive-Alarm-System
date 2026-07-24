import random


def generate(difficulty: str = "medium"):
    hard_tier = difficulty in ("hard", "expert")
    subtype = random.choice(["shape_sequence", "color_pattern", "number_progression"])

    if subtype == "shape_sequence":
        shapes = ["circle", "square", "triangle", "hexagon", "star"] if hard_tier else ["circle", "square", "triangle"]
        pattern = (shapes * 3)[:8 if hard_tier else 7]
        idx = random.randint(0, len(pattern) - 1)
        answer = pattern[idx]
        display = pattern.copy(); display[idx] = "_"
        question = f"Find the missing shape in the pattern: {' '.join(display)}"
    elif subtype == "color_pattern":
        colors = ["red", "blue", "green", "yellow", "purple"] if hard_tier else ["red", "blue", "green"]
        pattern = (colors * 3)[:8 if hard_tier else 7]
        idx = random.randint(0, len(pattern) - 1)
        answer = pattern[idx]
        display = pattern.copy(); display[idx] = "_"
        question = f"Find the missing color in the pattern: {' '.join(display)}"
    else:
        start = random.randint(1, 5)
        ratio = random.choice([3, 4]) if hard_tier else random.choice([2, 3])
        sequence = [start * (ratio ** i) for i in range(4)]
        answer = start * (ratio ** 4)
        question = f"What comes next: {', '.join(map(str, sequence))}, ?"
    return question, str(answer)
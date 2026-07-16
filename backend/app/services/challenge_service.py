import random

math_challenges = [
    {
        "category": "Math",
        "question": "15 + 10 = ?",
        "options": ["20", "25", "30", "35"],
        "answer": "25"
    },
    {
        "category": "Math",
        "question": "8 × 6 = ?",
        "options": ["42", "48", "54", "56"],
        "answer": "48"
    },
    {
        "category": "Math",
        "question": "50 - 18 = ?",
        "options": ["30", "32", "34", "36"],
        "answer": "32"
    }
]

def get_math_challenge():
    return random.choice(math_challenges)
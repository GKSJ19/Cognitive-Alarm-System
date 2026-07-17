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

logic_challenges = [
    {
        "category": "Logic",
        "question": "Which number comes next? 2, 4, 8, 16, ?",
        "options": ["18", "24", "32", "36"],
        "answer": "32"
    },
    {
        "category": "Logic",
        "question": "Find the missing number: 5, 10, 20, ?, 80",
        "options": ["30", "35", "40", "45"],
        "answer": "40"
    }
]

memory_challenges = [
    {
        "category": "Memory",
        "question": "Remember this sequence: 7, 3, 9, 1. Which number was second?",
        "options": ["1", "3", "7", "9"],
        "answer": "3"
    },
    {
        "category": "Memory",
        "question": "Remember these colors: Red, Blue, Green. Which color came last?",
        "options": ["Red", "Blue", "Green", "Yellow"],
        "answer": "Green"
    }
]

def get_math_challenge():
    return random.choice(math_challenges)

def get_logic_challenge():
    return random.choice(logic_challenges)

def get_memory_challenge():
    return random.choice(memory_challenges)
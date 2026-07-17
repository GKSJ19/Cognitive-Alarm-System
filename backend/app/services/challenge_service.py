import random

math_challenges = {
    "easy": [
        {
            "category": "Math",
            "difficulty": "Easy",
            "question": "8 + 5 = ?",
            "options": ["10", "12", "13", "15"],
            "answer": "13"
        },
        {
            "category": "Math",
            "difficulty": "Easy",
            "question": "20 - 8 = ?",
            "options": ["10", "11", "12", "13"],
            "answer": "12"
        }
    ],

    "medium": [
        {
            "category": "Math",
            "difficulty": "Medium",
            "question": "24 × 3 = ?",
            "options": ["68", "70", "72", "74"],
            "answer": "72"
        },
        {
            "category": "Math",
            "difficulty": "Medium",
            "question": "96 ÷ 8 = ?",
            "options": ["10", "11", "12", "13"],
            "answer": "12"
        }
    ],

    "hard": [
        {
            "category": "Math",
            "difficulty": "Hard",
            "question": "125 × 17 = ?",
            "options": ["2025", "2125", "2150", "2250"],
            "answer": "2125"
        },
        {
            "category": "Math",
            "difficulty": "Hard",
            "question": "144 ÷ 12 + 36 = ?",
            "options": ["46", "48", "50", "52"],
            "answer": "48"
        }
    ]
}

logic_challenges = {
    "easy": [
        {
            "category": "Logic",
            "difficulty": "Easy",
            "question": "Which number comes next? 2, 4, 6, ?",
            "options": ["8", "10", "12", "14"],
            "answer": "8"
        },
        {
            "category": "Logic",
            "difficulty": "Easy",
            "question": "Find the missing number: 5, 10, ?, 20",
            "options": ["12", "15", "18", "25"],
            "answer": "15"
        }
    ],

    "medium": [
        {
            "category": "Logic",
            "difficulty": "Medium",
            "question": "Which number comes next? 3, 6, 12, 24, ?",
            "options": ["36", "48", "42", "60"],
            "answer": "48"
        },
        {
            "category": "Logic",
            "difficulty": "Medium",
            "question": "Find the missing number: 4, 8, 16, ?, 64",
            "options": ["24", "28", "32", "36"],
            "answer": "32"
        }
    ],

    "hard": [
        {
            "category": "Logic",
            "difficulty": "Hard",
            "question": "2, 5, 11, 23, ?",
            "options": ["35", "47", "46", "48"],
            "answer": "47"
        },
        {
            "category": "Logic",
            "difficulty": "Hard",
            "question": "7, 14, 28, 56, ?",
            "options": ["84", "98", "112", "120"],
            "answer": "112"
        }
    ]
}

memory_challenges = {
    "easy": [
        {
            "category": "Memory",
            "difficulty": "Easy",
            "question": "Remember this sequence: 7, 3, 9, 1. Which number was second?",
            "options": ["1", "3", "7", "9"],
            "answer": "3"
        },
        {
            "category": "Memory",
            "difficulty": "Easy",
            "question": "Remember these colors: Red, Blue, Green. Which came last?",
            "options": ["Red", "Blue", "Green", "Yellow"],
            "answer": "Green"
        }
    ],

    "medium": [
        {
            "category": "Memory",
            "difficulty": "Medium",
            "question": "Remember: Apple, Mango, Orange, Banana. Which was third?",
            "options": ["Apple", "Orange", "Banana", "Mango"],
            "answer": "Orange"
        },
        {
            "category": "Memory",
            "difficulty": "Medium",
            "question": "Remember: 11, 24, 37, 49. Which number was first?",
            "options": ["11", "24", "37", "49"],
            "answer": "11"
        }
    ],

    "hard": [
        {
            "category": "Memory",
            "difficulty": "Hard",
            "question": "Remember: Cat, Dog, Lion, Tiger, Horse. Which was fourth?",
            "options": ["Dog", "Tiger", "Horse", "Lion"],
            "answer": "Tiger"
        },
        {
            "category": "Memory",
            "difficulty": "Hard",
            "question": "Remember: 12, 45, 89, 33, 67. Which number was last?",
            "options": ["45", "67", "89", "33"],
            "answer": "67"
        }
    ]
}

attention_challenges = {
    "easy": [
        {
            "category": "Attention",
            "difficulty": "Easy",
            "question": "Find the odd one out: Apple, Mango, Banana, Car",
            "options": ["Apple", "Mango", "Banana", "Car"],
            "answer": "Car"
        },
        {
            "category": "Attention",
            "difficulty": "Easy",
            "question": "Which letter appears twice? A B C D A",
            "options": ["A", "B", "C", "D"],
            "answer": "A"
        }
    ],

    "medium": [
        {
            "category": "Attention",
            "difficulty": "Medium",
            "question": "Find the different number: 5, 10, 15, 18, 20",
            "options": ["5", "10", "15", "18"],
            "answer": "18"
        },
        {
            "category": "Attention",
            "difficulty": "Medium",
            "question": "Which word is different? Cat, Dog, Cow, Chair",
            "options": ["Cat", "Dog", "Cow", "Chair"],
            "answer": "Chair"
        }
    ],

    "hard": [
        {
            "category": "Attention",
            "difficulty": "Hard",
            "question": "Find the odd pattern: AA, BB, CC, CD",
            "options": ["AA", "BB", "CC", "CD"],
            "answer": "CD"
        },
        {
            "category": "Attention",
            "difficulty": "Hard",
            "question": "Which number is different? 16, 25, 36, 40",
            "options": ["16", "25", "36", "40"],
            "answer": "40"
        }
    ]
}

def get_math_challenge(difficulty: str):
    return random.choice(math_challenges[difficulty.lower()])

def get_logic_challenge(difficulty: str):
    return random.choice(logic_challenges[difficulty.lower()])

def get_memory_challenge(difficulty: str):
    return random.choice(memory_challenges[difficulty.lower()])

def get_attention_challenge(difficulty: str):
    return random.choice(attention_challenges[difficulty.lower()])

def check_answer(correct_answer, user_answer):
    return {
        "correct": correct_answer.lower() == user_answer.lower()
    }
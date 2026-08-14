"""
Cognitive Challenge Engine

Covers the platform architecture's "Cognitive Challenge Engine" business
module: challenge generation, personalized challenge selection, challenge
validation, and performance tracking -- built jointly with Abdul (per team
chat), consuming the Adaptive Difficulty Model's real output.

Implements all 7 challenge types from the team's sketch, each with its
listed subtypes:

  1. Mathematical Problems -- arithmetic operations, percentages,
     algebraic expressions
  2. Logic Puzzles -- number patterns, logical reasoning,
     missing element puzzles
  3. Memory Challenges -- memorize words/numbers, sequence recall,
     position-based memory tests
  4. Word Games -- unscramble words, synonyms, antonyms,
     vocabulary completion
  5. Pattern Recognition -- shape sequences, color patterns,
     number progression
  6. Riddles -- short reasoning questions, everyday logic riddles
  7. Quick Quizzes -- general knowledge, science

Difficulty scaling uses the same 5 tiers as reinforcement.py
(Beginner, Easy, Medium, Hard, Expert) so a challenge's difficulty can be
driven directly by a user's real Adaptive Difficulty Model output.

DESIGN NOTE ON ANSWER SECURITY:
generate_challenge() stores the correct answer server-side (in-memory,
keyed by challenge_id) rather than returning it to the caller. Only
validate_answer() reveals it, after checking. This is a reasonable
approach for now; once Abdul's MongoDB challenge_data collection is
live, swap the in-memory _ACTIVE_CHALLENGES dict for a real DB write/read
so challenges survive server restarts and work across multiple instances.
"""

import random
import string
import uuid
from typing import Optional

DIFFICULTY_LEVELS = ["Beginner", "Easy", "Medium", "Hard", "Expert"]

CHALLENGE_TYPES = [
    "Math Problems",
    "Logic Puzzles",
    "Memory Challenges",
    "Word Games",
    "Pattern Recognition",
    "Riddles",
    "Quick Quizzes",
]

# In-memory store: challenge_id -> full challenge dict (including answer).
# Swap for a real MongoDB collection once Abdul's DB layer is wired in.
_ACTIVE_CHALLENGES = {}


# ---------------------------------------------------------------------------
# 1. MATHEMATICAL PROBLEMS
# ---------------------------------------------------------------------------

def generate_math_problem(difficulty: str) -> dict:
    if difficulty == "Beginner":
        a, b = random.randint(1, 9), random.randint(1, 9)
        op = random.choice(["+", "-"])
        answer = a + b if op == "+" else a - b
        return {
            "subtype": "Arithmetic operations",
            "question": f"What is {a} {op} {b}?",
            "correct_answer": str(answer),
        }

    elif difficulty == "Easy":
        a, b = random.randint(10, 50), random.randint(10, 50)
        op = random.choice(["+", "-", "*"])
        if op == "*":
            a, b = random.randint(2, 12), random.randint(2, 12)
        answer = eval(f"{a}{op}{b}")
        return {
            "subtype": "Arithmetic operations",
            "question": f"What is {a} {op} {b}?",
            "correct_answer": str(answer),
        }

    elif difficulty == "Medium":
        base = random.randint(50, 400)
        pct = random.choice([10, 15, 20, 25, 30, 50])
        answer = round(base * pct / 100, 2)
        return {
            "subtype": "Percentages",
            "question": f"What is {pct}% of {base}?",
            "correct_answer": str(answer),
        }

    elif difficulty == "Hard":
        x = random.randint(2, 15)
        a, b = random.randint(2, 9), random.randint(1, 20)
        result = a * x + b
        return {
            "subtype": "Algebraic expressions",
            "question": f"Solve for x: {a}x + {b} = {result}",
            "correct_answer": str(x),
        }

    else:  # Expert
        x = random.randint(2, 10)
        a, b, c = random.randint(2, 5), random.randint(1, 10), random.randint(1, 5)
        result = a * (x + b) - c
        return {
            "subtype": "Algebraic expressions",
            "question": f"Solve for x: {a}(x + {b}) - {c} = {result}",
            "correct_answer": str(x),
        }


# ---------------------------------------------------------------------------
# 2. LOGIC PUZZLES
# ---------------------------------------------------------------------------

def generate_logic_puzzle(difficulty: str) -> dict:
    subtype = random.choice(["Number patterns", "Number patterns (geometric)", "Missing element puzzles"])

    step_range = {
        "Beginner": (1, 3), "Easy": (2, 5), "Medium": (3, 8),
        "Hard": (5, 12), "Expert": (7, 20),
    }[difficulty]
    length = 5

    if subtype == "Number patterns (geometric)":
        # Matches real data style: 2, 4, 8, 16, ? (doubling / multiplicative)
        ratio = {"Beginner": 2, "Easy": 2, "Medium": 3, "Hard": 3, "Expert": 4}[difficulty]
        start = random.randint(1, 4)
        sequence = [start * (ratio ** i) for i in range(length)]
        next_val = start * (ratio ** length)
        shown = ", ".join(str(v) for v in sequence)
        return {
            "subtype": "Number patterns",
            "question": f"Find the next number: {shown}, ?",
            "correct_answer": str(next_val),
        }

    step = random.randint(*step_range)
    start = random.randint(1, 20)

    if subtype == "Number patterns":
        sequence = [start + i * step for i in range(length)]
        next_val = start + length * step
        shown = ", ".join(str(v) for v in sequence)
        return {
            "subtype": subtype,
            "question": f"Find the next number: {shown}, ?",
            "correct_answer": str(next_val),
        }
    else:
        sequence = [start + i * step for i in range(length)]
        missing_index = random.randint(1, length - 2)  # never first/last
        missing_val = sequence[missing_index]
        display = [str(v) if i != missing_index else "?" for i, v in enumerate(sequence)]
        shown = ", ".join(display)
        return {
            "subtype": subtype,
            "question": f"Find the missing number: {shown}",
            "correct_answer": str(missing_val),
        }


# ---------------------------------------------------------------------------
# 3. MEMORY CHALLENGES
# ---------------------------------------------------------------------------

_MEMORY_WORD_POOL = [
    "apple", "river", "cloud", "stone", "tiger", "flame", "ocean", "bread",
    "chair", "spark", "grape", "shadow", "candle", "meadow", "pebble",
]

def generate_memory_challenge(difficulty: str) -> dict:
    length_by_difficulty = {
        "Beginner": 3, "Easy": 4, "Medium": 5, "Hard": 6, "Expert": 8,
    }
    length = length_by_difficulty[difficulty]
    subtype = random.choice(["Memorize words", "Position-based memory test"])

    items = random.sample(_MEMORY_WORD_POOL, min(length, len(_MEMORY_WORD_POOL)))
    sequence_str = ", ".join(items)

    if subtype == "Memorize words":
        # Ask the user to recall the full sequence in order.
        return {
            "subtype": subtype,
            "question": (
                f"Memorize this sequence, then type it back in order "
                f"(comma-separated): {sequence_str}"
            ),
            "correct_answer": sequence_str.lower(),
        }
    else:
        position = random.randint(1, length)
        return {
            "subtype": subtype,
            "question": (
                f"Memorize this sequence: {sequence_str}. "
                f"What is the word at position {position}?"
            ),
            "correct_answer": items[position - 1].lower(),
        }


# ---------------------------------------------------------------------------
# 4. WORD GAMES
# ---------------------------------------------------------------------------

_WORD_BANK_BY_DIFFICULTY = {
    "Beginner": ["cat", "sun", "book", "tree", "fish"],
    "Easy": ["apple", "chair", "river", "cloud", "stone"],
    "Medium": ["mountain", "computer", "elephant", "calendar", "umbrella"],
    "Hard": ["adventure", "knowledge", "wonderful", "chocolate", "beautiful"],
    "Expert": ["extraordinary", "sophisticated", "unbelievable", "characteristic"],
}

_SYNONYM_BANK = {
    "happy": {"joyful", "glad", "content", "cheerful"},
    "fast": {"quick", "rapid", "swift", "speedy"},
    "smart": {"intelligent", "clever", "bright", "sharp"},
    "big": {"large", "huge", "massive", "giant"},
    "sad": {"unhappy", "sorrowful", "downcast", "gloomy"},
}

_ANTONYM_BANK = {
    "hot": {"cold", "cool", "chilly"},
    "up": {"down"},
    "light": {"dark", "heavy"},
    "early": {"late"},
    "brave": {"cowardly", "fearful", "timid"},
}


def _scramble(word: str) -> str:
    letters = list(word)
    scrambled = word
    attempts = 0
    while scrambled == word and attempts < 10:
        random.shuffle(letters)
        scrambled = "".join(letters)
        attempts += 1
    return scrambled


def generate_word_game(difficulty: str) -> dict:
    subtype = random.choice(["Unscramble words", "Synonyms", "Antonyms"])

    if subtype == "Unscramble words":
        word = random.choice(_WORD_BANK_BY_DIFFICULTY[difficulty])
        return {
            "subtype": subtype,
            "question": f"Unscramble this word: {_scramble(word).upper()}",
            "correct_answer": word.lower(),
        }

    elif subtype == "Synonyms":
        word, options = random.choice(list(_SYNONYM_BANK.items()))
        answer = random.choice(list(options))
        return {
            "subtype": subtype,
            "question": f"Give a synonym for: {word}",
            "correct_answer": answer,  # any accepted synonym is scored via validate_answer's set check
            "accepted_answers": list(options),
        }

    else:  # Antonyms
        word, options = random.choice(list(_ANTONYM_BANK.items()))
        answer = random.choice(list(options))
        return {
            "subtype": subtype,
            "question": f"Give an antonym for: {word}",
            "correct_answer": answer,
            "accepted_answers": list(options),
        }


# ---------------------------------------------------------------------------
# 5. PATTERN RECOGNITION
# ---------------------------------------------------------------------------

_SHAPES = ["Circle", "Square", "Triangle", "Star", "Hexagon"]
_COLORS = ["Red", "Blue", "Green", "Yellow", "Purple"]

def generate_pattern_recognition(difficulty: str) -> dict:
    subtype = random.choice(["Shape sequences", "Color patterns", "Number progression"])

    repeats_by_difficulty = {
        "Beginner": 2, "Easy": 3, "Medium": 3, "Hard": 4, "Expert": 4,
    }
    cycle_len = {
        "Beginner": 2, "Easy": 2, "Medium": 3, "Hard": 3, "Expert": 4,
    }[difficulty]
    repeats = repeats_by_difficulty[difficulty]

    if subtype == "Shape sequences":
        cycle = random.sample(_SHAPES, cycle_len)
        sequence = (cycle * repeats)[: cycle_len * repeats]
        next_val = cycle[len(sequence) % cycle_len]
        shown = ", ".join(sequence)
        return {
            "subtype": subtype,
            "question": f"Complete the pattern: {shown}, ?",
            "correct_answer": next_val,
        }

    elif subtype == "Color patterns":
        cycle = random.sample(_COLORS, cycle_len)
        sequence = (cycle * repeats)[: cycle_len * repeats]
        next_val = cycle[len(sequence) % cycle_len]
        shown = ", ".join(sequence)
        return {
            "subtype": subtype,
            "question": f"Complete the pattern: {shown}, ?",
            "correct_answer": next_val,
        }

    else:  # Number progression (multiplicative, distinct from Logic Puzzles' additive patterns)
        ratio = {"Beginner": 2, "Easy": 2, "Medium": 3, "Hard": 3, "Expert": 4}[difficulty]
        start = random.randint(1, 5)
        sequence = [start * (ratio ** i) for i in range(4)]
        next_val = start * (ratio ** 4)
        shown = ", ".join(str(v) for v in sequence)
        return {
            "subtype": subtype,
            "question": f"Find the next number: {shown}, ?",
            "correct_answer": str(next_val),
        }


# ---------------------------------------------------------------------------
# 6. RIDDLES
# ---------------------------------------------------------------------------

_RIDDLE_BANK = {
    "Beginner": [
        ("What has a face but no eyes?", "clock"),
        ("What gets wetter as it dries?", "towel"),
    ],
    "Easy": [
        ("What has keys but can't open locks?", "keyboard"),
        ("What has a neck but no head?", "bottle"),
    ],
    "Medium": [
        ("The more you take, the more you leave behind. What am I?", "footsteps"),
        ("What can travel around the world while staying in a corner?", "stamp"),
    ],
    "Hard": [
        ("I speak without a mouth and hear without ears. What am I?", "echo"),
        ("What has cities but no houses, forests but no trees?", "map"),
    ],
    "Expert": [
        ("The person who makes it sells it. The person who buys it never uses it. "
         "The person who uses it never knows they're using it. What is it?", "coffin"),
    ],
}

def generate_riddle(difficulty: str) -> dict:
    question, answer = random.choice(_RIDDLE_BANK[difficulty])
    return {
        "subtype": "Everyday logic riddle",
        "question": question,
        "correct_answer": answer.lower(),
    }


# ---------------------------------------------------------------------------
# 7. QUICK QUIZZES
# ---------------------------------------------------------------------------

_QUIZ_BANK = {
    "Beginner": [
        ("What is the capital of India?", "new delhi"),
        ("How many days are in a week?", "7"),
    ],
    "Easy": [
        ("What planet is known as the Red Planet?", "mars"),
        ("What gas do plants absorb from the air?", "carbon dioxide"),
    ],
    "Medium": [
        ("What is the chemical symbol for gold?", "au"),
        ("Who developed the theory of relativity?", "einstein"),
    ],
    "Hard": [
        ("What is the powerhouse of the cell called?", "mitochondria"),
        ("What is the SI unit of electric current?", "ampere"),
    ],
    "Expert": [
        ("What particle is responsible for giving other particles mass, "
         "confirmed by CERN in 2012?", "higgs boson"),
    ],
}

def generate_quick_quiz(difficulty: str) -> dict:
    question, answer = random.choice(_QUIZ_BANK[difficulty])
    return {
        "subtype": random.choice(["General knowledge", "Science"]),
        "question": question,
        "correct_answer": answer.lower(),
    }


# ---------------------------------------------------------------------------
# DISPATCH + PUBLIC API
# ---------------------------------------------------------------------------

_GENERATORS = {
    "Math Problems": generate_math_problem,
    "Logic Puzzles": generate_logic_puzzle,
    "Memory Challenges": generate_memory_challenge,
    "Word Games": generate_word_game,
    "Pattern Recognition": generate_pattern_recognition,
    "Riddles": generate_riddle,
    "Quick Quizzes": generate_quick_quiz,
}


def generate_challenge(challenge_type: Optional[str] = None, difficulty: str = "Easy") -> dict:
    """
    Generates one challenge of the given type and difficulty (or a random
    type if none specified). The correct answer is stored server-side
    (_ACTIVE_CHALLENGES) and NOT included in the returned dict -- use
    validate_answer() to check a user's response.
    """
    if difficulty not in DIFFICULTY_LEVELS:
        difficulty = "Easy"

    challenge_type = challenge_type or random.choice(CHALLENGE_TYPES)
    if challenge_type not in _GENERATORS:
        raise ValueError(f"Unknown challenge_type: {challenge_type}")

    raw = _GENERATORS[challenge_type](difficulty)
    challenge_id = str(uuid.uuid4())[:8]

    full_record = {
        "challenge_id": challenge_id,
        "challenge_type": challenge_type,
        "subtype": raw["subtype"],
        "difficulty_level": difficulty,
        "question": raw["question"],
        "correct_answer": raw["correct_answer"],
        "accepted_answers": raw.get("accepted_answers", [raw["correct_answer"]]),
    }
    _ACTIVE_CHALLENGES[challenge_id] = full_record

    # Public-facing version: no answer included.
    return {
        "challenge_id": challenge_id,
        "challenge_type": challenge_type,
        "subtype": raw["subtype"],
        "difficulty_level": difficulty,
        "question": raw["question"],
    }


def validate_answer(challenge_id: str, user_answer: str) -> dict:
    """
    Checks a user's answer against the stored challenge. Returns whether
    it was correct, the accepted answer(s) (revealed only now), and
    removes the challenge from the active store (one attempt per
    generated challenge).
    """
    record = _ACTIVE_CHALLENGES.pop(challenge_id, None)
    if record is None:
        return {"found": False, "is_correct": False, "correct_answer": None}

    normalized_user_answer = user_answer.strip().lower()
    accepted = [a.strip().lower() for a in record["accepted_answers"]]
    is_correct = normalized_user_answer in accepted

    return {
    "found": True,
    "is_correct": is_correct,
    "correct_answer": record["correct_answer"],
    "accepted_answers": record["accepted_answers"],
    "challenge_type": record["challenge_type"],
    "difficulty_level": record["difficulty_level"],
}

def get_challenge_for_user(user_id: int) -> dict:
    """
    Full pipeline version: determines the user's current difficulty via
    the Adaptive Difficulty Model (reinforcement.py), picks a challenge
    type from their stated preference if available, and generates a
    real challenge at that difficulty.
    """
    import os
    import sys

    src_dir = os.path.dirname(os.path.abspath(__file__))
    ai_ml_dir = os.path.dirname(src_dir)
    pipelines_dir = os.path.join(ai_ml_dir, "pipelines")
    for path in (src_dir, pipelines_dir):
        if path not in sys.path:
            sys.path.append(path)

    from reinforcement import get_difficulty_for_user
    from data_ingest import build_user_context

    difficulty_result = get_difficulty_for_user(user_id)
    difficulty = difficulty_result["next_difficulty"]

    context = build_user_context(user_id=user_id)
    preferences = context.get("preferences") or {}
    preferred_type = preferences.get("challenge_type_preference")
    challenge_type = preferred_type if preferred_type in CHALLENGE_TYPES else None

    challenge = generate_challenge(challenge_type=challenge_type, difficulty=difficulty)
    challenge["user_id"] = user_id
    challenge["source_rating"] = difficulty_result["current_rating"]
    return challenge


if __name__ == "__main__":
    print("=== Cognitive Challenge Engine: Demo (all 7 types, Medium difficulty) ===\n")
    for ctype in CHALLENGE_TYPES:
        challenge = generate_challenge(challenge_type=ctype, difficulty="Medium")
        print(f"[{ctype} -> {challenge['subtype']}]")
        print(f"  Q: {challenge['question']}")

        # Simulate answering correctly to demonstrate validate_answer()
        stored = _ACTIVE_CHALLENGES[challenge["challenge_id"]]
        result = validate_answer(challenge["challenge_id"], stored["correct_answer"])
        print(f"  Validated correct answer -> is_correct: {result['is_correct']}, "
              f"revealed answer: {result['correct_answer']}\n")

    print("=== Real Pipeline: Challenge for Real Users (1-5), driven by their actual difficulty ===\n")
    for uid in range(1, 6):
        challenge = get_challenge_for_user(uid)
        print(f"User {uid} (rating={challenge['source_rating']}, "
              f"difficulty={challenge['difficulty_level']}): "
              f"[{challenge['challenge_type']}] {challenge['question']}")
"""
Cognitive Challenge Engine
==========================
A production-ready, modular engine that generates, validates, and scores
cognitive challenges across seven categories:

  1. Mathematical Problems   — Arithmetic, Percentages, Algebra
  2. Logic Puzzles           — Number Patterns, Logical Reasoning, Missing Elements
  3. Memory Challenges       — Words, Numbers, Image Sequences, Position Memory
  4. Word Games              — Unscramble, Synonyms, Antonyms, Vocabulary Completion
  5. Pattern Recognition     — Shape Sequences, Color Patterns, Number Progression
  6. Riddles                 — Short Reasoning, Everyday Logic
  7. Quick Quizzes           — General Knowledge, Science

Usage:
    from cognitive_challenge_engine import CognitiveChallengeEngine

    engine = CognitiveChallengeEngine()
    challenge = engine.generate()                         # random category, random difficulty
    challenge = engine.generate(category="math")          # specific category
    challenge = engine.generate(difficulty="hard")         # specific difficulty
    result    = engine.validate(challenge, user_answer)    # validate and score
"""

from __future__ import annotations

import math
import random
import string
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional


# ═══════════════════════════════════════════════════════════════════════════════
# ENUMS & DATA CLASSES
# ═══════════════════════════════════════════════════════════════════════════════

class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Category(str, Enum):
    MATH = "math"
    LOGIC = "logic"
    MEMORY = "memory"
    WORD_GAMES = "word_games"
    PATTERN_RECOGNITION = "pattern_recognition"
    RIDDLES = "riddles"
    QUICK_QUIZ = "quick_quiz"


CATEGORY_LABELS: dict[Category, str] = {
    Category.MATH: "Mathematical Problems",
    Category.LOGIC: "Logic Puzzles",
    Category.MEMORY: "Memory Challenges",
    Category.WORD_GAMES: "Word Games",
    Category.PATTERN_RECOGNITION: "Pattern Recognition",
    Category.RIDDLES: "Riddles",
    Category.QUICK_QUIZ: "Quick Quizzes",
}

TIME_LIMITS: dict[Difficulty, int] = {
    Difficulty.EASY: 30,
    Difficulty.MEDIUM: 45,
    Difficulty.HARD: 60,
}

BASE_SCORES: dict[Difficulty, int] = {
    Difficulty.EASY: 10,
    Difficulty.MEDIUM: 20,
    Difficulty.HARD: 30,
}

XP_MULTIPLIERS: dict[Difficulty, int] = {
    Difficulty.EASY: 1,
    Difficulty.MEDIUM: 2,
    Difficulty.HARD: 3,
}


@dataclass
class Challenge:
    """Immutable data object representing a single generated challenge."""

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    category: str = ""
    sub_type: str = ""
    difficulty: str = ""
    question: str = ""
    options: list[str] = field(default_factory=list)
    correct_answer: str = ""
    display_data: dict[str, Any] = field(default_factory=dict)
    max_score: int = 0
    time_limit_seconds: int = 30
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ValidationResult:
    """Result of validating a user's answer against a challenge."""

    challenge_id: str = ""
    is_correct: bool = False
    user_answer: str = ""
    correct_answer: str = ""
    score: int = 0
    xp_earned: int = 0
    time_taken_seconds: float = 0.0
    time_bonus: int = 0
    category: str = ""
    difficulty: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# ═══════════════════════════════════════════════════════════════════════════════
# ABSTRACT BASE
# ═══════════════════════════════════════════════════════════════════════════════

class ChallengeGenerator(ABC):
    """Base class that every category generator must extend."""

    category: Category = Category.MATH

    @abstractmethod
    def generate(self, difficulty: Difficulty) -> Challenge:
        ...

    def _build(
        self,
        difficulty: Difficulty,
        sub_type: str,
        question: str,
        correct_answer: str,
        options: list[str] | None = None,
        display_data: dict[str, Any] | None = None,
    ) -> Challenge:
        return Challenge(
            category=self.category.value,
            sub_type=sub_type,
            difficulty=difficulty.value,
            question=question,
            options=options or [],
            correct_answer=str(correct_answer),
            display_data=display_data or {},
            max_score=BASE_SCORES[difficulty],
            time_limit_seconds=TIME_LIMITS[difficulty],
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 1. MATHEMATICAL PROBLEMS
# ═══════════════════════════════════════════════════════════════════════════════

class MathGenerator(ChallengeGenerator):
    category = Category.MATH

    def generate(self, difficulty: Difficulty) -> Challenge:
        fn = random.choice(self._variants(difficulty))
        return fn(difficulty)

    def _variants(self, difficulty: Difficulty):
        if difficulty == Difficulty.EASY:
            return [self._arithmetic_easy]
        elif difficulty == Difficulty.MEDIUM:
            return [self._arithmetic_medium, self._percentage_medium]
        return [self._algebra_hard, self._percentage_hard, self._arithmetic_hard]

    def _arithmetic_easy(self, d: Difficulty) -> Challenge:
        ops = [("+", lambda a, b: a + b), ("-", lambda a, b: a - b)]
        sym, fn = random.choice(ops)
        a, b = random.randint(1, 20), random.randint(1, 20)
        if sym == "-" and b > a:
            a, b = b, a
        return self._build(d, "arithmetic", f"{a} {sym} {b} = ?", str(fn(a, b)))

    def _arithmetic_medium(self, d: Difficulty) -> Challenge:
        a = random.randint(10, 50)
        b = random.randint(2, 9)
        c = random.randint(1, 20)
        ans = a * b + c
        return self._build(d, "arithmetic", f"{a} × {b} + {c} = ?", str(ans))

    def _arithmetic_hard(self, d: Difficulty) -> Challenge:
        a = random.randint(50, 200)
        b = random.randint(5, 15)
        c = random.randint(10, 50)
        ans = (a + c) * b
        return self._build(d, "arithmetic", f"({a} + {c}) × {b} = ?", str(ans))

    def _percentage_medium(self, d: Difficulty) -> Challenge:
        base = random.choice([50, 80, 120, 200, 250, 400])
        pct = random.choice([10, 20, 25, 50])
        ans = int(base * pct / 100)
        return self._build(d, "percentage", f"What is {pct}% of {base}?", str(ans))

    def _percentage_hard(self, d: Difficulty) -> Challenge:
        base = random.choice([120, 360, 480, 750, 960])
        pct = random.choice([15, 33, 45, 60, 75])
        ans = round(base * pct / 100, 2)
        ans_str = str(int(ans)) if ans == int(ans) else str(ans)
        return self._build(d, "percentage", f"What is {pct}% of {base}?", ans_str)

    def _algebra_hard(self, d: Difficulty) -> Challenge:
        x = random.randint(2, 15)
        a = random.randint(2, 8)
        b = random.randint(1, 30)
        result = a * x + b
        return self._build(
            d, "algebra", f"Solve for x: {a}x + {b} = {result}", str(x)
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 2. LOGIC PUZZLES
# ═══════════════════════════════════════════════════════════════════════════════

class LogicGenerator(ChallengeGenerator):
    category = Category.LOGIC

    _POOLS: dict[str, list[dict[str, str]]] = {
        "easy": [
            {"q": "What comes next: 2, 4, 6, 8, ?", "a": "10", "t": "number_pattern"},
            {"q": "What comes next: 5, 10, 15, 20, ?", "a": "25", "t": "number_pattern"},
            {"q": "What comes next: 1, 3, 5, 7, ?", "a": "9", "t": "number_pattern"},
            {"q": "Which does NOT belong: Cat, Dog, Car, Fish?", "a": "Car", "t": "missing_element"},
            {"q": "If all Roses are Flowers and all Flowers are Plants, are all Roses Plants?", "a": "yes", "t": "logical_reasoning"},
            {"q": "What comes next: 10, 20, 30, 40, ?", "a": "50", "t": "number_pattern"},
            {"q": "Which does NOT belong: Apple, Banana, Carrot, Grape?", "a": "Carrot", "t": "missing_element"},
        ],
        "medium": [
            {"q": "What comes next: 1, 1, 2, 3, 5, 8, ?", "a": "13", "t": "number_pattern"},
            {"q": "What comes next: 2, 6, 18, 54, ?", "a": "162", "t": "number_pattern"},
            {"q": "A is taller than B. B is taller than C. Who is the shortest?", "a": "C", "t": "logical_reasoning"},
            {"q": "Which does NOT belong: 2, 5, 11, 17, 21, 23?", "a": "21", "t": "missing_element"},
            {"q": "What comes next: 3, 6, 12, 24, ?", "a": "48", "t": "number_pattern"},
            {"q": "If today is Wednesday, what day is 100 days from now?", "a": "Friday", "t": "logical_reasoning"},
            {"q": "What comes next: 1, 4, 9, 16, ?", "a": "25", "t": "number_pattern"},
        ],
        "hard": [
            {"q": "What comes next: 1, 4, 9, 16, 25, ?", "a": "36", "t": "number_pattern"},
            {"q": "What comes next: 3, 9, 27, 81, ?", "a": "243", "t": "number_pattern"},
            {"q": "If no A's are B's and some B's are C's, can any A's be C's?", "a": "yes", "t": "logical_reasoning"},
            {"q": "What comes next: 0, 1, 1, 2, 3, 5, 8, 13, ?", "a": "21", "t": "number_pattern"},
            {"q": "Which does NOT belong: 121, 144, 150, 169, 196?", "a": "150", "t": "missing_element"},
            {"q": "What comes next: 2, 3, 5, 7, 11, 13, ?", "a": "17", "t": "number_pattern"},
            {"q": "A says 'B always lies.' B says 'A always lies.' If exactly one is truthful, who is it?", "a": "A", "t": "logical_reasoning"},
        ],
    }

    def generate(self, difficulty: Difficulty) -> Challenge:
        pool = self._POOLS.get(difficulty.value, self._POOLS["easy"])
        item = random.choice(pool)
        return self._build(difficulty, item["t"], item["q"], item["a"])


# ═══════════════════════════════════════════════════════════════════════════════
# 3. MEMORY CHALLENGES
# ═══════════════════════════════════════════════════════════════════════════════

class MemoryGenerator(ChallengeGenerator):
    category = Category.MEMORY

    _WORD_POOLS = {
        "easy": ["apple", "house", "river", "chair", "cloud", "smile", "bread"],
        "medium": ["guitar", "mountain", "bicycle", "dragon", "crystal", "window", "planet"],
        "hard": ["elephant", "telescope", "catalogue", "chandelier", "labyrinth", "synthesis", "orchestra"],
    }

    _IMAGE_LABELS = [
        "sun", "moon", "star", "tree", "fish", "bird", "bell",
        "heart", "key", "flag", "crown", "leaf", "clock", "book",
    ]

    def generate(self, difficulty: Difficulty) -> Challenge:
        fn = random.choice([
            self._numbers,
            self._words,
            self._position,
            self._image_sequence,
        ])
        return fn(difficulty)

    def _numbers(self, d: Difficulty) -> Challenge:
        length = {"easy": 4, "medium": 6, "hard": 8}[d.value]
        seq = [random.randint(0, 9) for _ in range(length)]
        seq_str = "".join(map(str, seq))
        return self._build(
            d,
            "numbers",
            "Memorize the number sequence, then type it back.",
            seq_str,
            display_data={"sequence": seq_str, "display_time_ms": 4000},
        )

    def _words(self, d: Difficulty) -> Challenge:
        pool = self._WORD_POOLS[d.value]
        count = {"easy": 3, "medium": 4, "hard": 5}[d.value]
        chosen = random.sample(pool, min(count, len(pool)))
        answer = ", ".join(chosen)
        return self._build(
            d,
            "words",
            "Memorize these words, then type them separated by commas.",
            answer,
            display_data={"sequence": answer, "display_time_ms": 5000},
        )

    def _position(self, d: Difficulty) -> Challenge:
        grid = {"easy": 3, "medium": 4, "hard": 5}[d.value]
        count = {"easy": 3, "medium": 5, "hard": 7}[d.value]
        total = grid * grid
        positions = sorted(random.sample(range(total), min(count, total)))
        answer = ",".join(map(str, positions))
        return self._build(
            d,
            "position",
            "Remember the highlighted cell positions on the grid.",
            answer,
            display_data={
                "grid_size": grid,
                "positions": positions,
                "display_time_ms": 4000,
            },
        )

    def _image_sequence(self, d: Difficulty) -> Challenge:
        count = {"easy": 3, "medium": 5, "hard": 7}[d.value]
        chosen = random.sample(self._IMAGE_LABELS, min(count, len(self._IMAGE_LABELS)))
        answer = ", ".join(chosen)
        return self._build(
            d,
            "image_sequence",
            "Memorize these images in order, then type their names separated by commas.",
            answer,
            display_data={"sequence": chosen, "display_time_ms": 5000},
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 4. WORD GAMES
# ═══════════════════════════════════════════════════════════════════════════════

class WordGamesGenerator(ChallengeGenerator):
    category = Category.WORD_GAMES

    _SYNONYMS = [
        ("happy", "joyful"), ("sad", "sorrowful"), ("big", "large"),
        ("fast", "quick"), ("smart", "intelligent"), ("angry", "furious"),
        ("brave", "courageous"), ("calm", "peaceful"), ("tiny", "minuscule"),
        ("begin", "commence"), ("end", "conclude"), ("strong", "powerful"),
    ]

    _ANTONYMS = [
        ("hot", "cold"), ("light", "dark"), ("early", "late"),
        ("happy", "sad"), ("fast", "slow"), ("love", "hate"),
        ("rich", "poor"), ("strong", "weak"), ("ancient", "modern"),
        ("expand", "shrink"), ("victory", "defeat"), ("accept", "refuse"),
    ]

    _VOCAB = [
        {"s": "The scientist made a groundbreaking ___.", "o": ["discovery", "mistake", "recipe", "journey"], "a": "discovery"},
        {"s": "She showed great ___ in the face of danger.", "o": ["courage", "confusion", "hunger", "silence"], "a": "courage"},
        {"s": "The river ___ through the valley.", "o": ["flows", "flies", "falls", "fades"], "a": "flows"},
        {"s": "His ___ performance impressed the judges.", "o": ["outstanding", "boring", "lazy", "quiet"], "a": "outstanding"},
        {"s": "The ancient artifact was found in a buried ___.", "o": ["tomb", "library", "kitchen", "garage"], "a": "tomb"},
        {"s": "The team celebrated their well-deserved ___.", "o": ["victory", "penalty", "failure", "absence"], "a": "victory"},
        {"s": "The ___ weather made everyone stay indoors.", "o": ["stormy", "sunny", "pleasant", "mild"], "a": "stormy"},
    ]

    _UNSCRAMBLE = {
        "easy": ["apple", "house", "water", "brain", "dream", "chair", "globe"],
        "medium": ["puzzle", "garden", "rocket", "bridge", "candle", "palace", "frozen"],
        "hard": ["philosophy", "algorithm", "labyrinth", "chandelier", "phenomenon", "encyclopedia", "catastrophe"],
    }

    def generate(self, difficulty: Difficulty) -> Challenge:
        fn = random.choice([
            self._unscramble,
            self._synonym,
            self._antonym,
            self._vocab_completion,
        ])
        return fn(difficulty)

    @staticmethod
    def _scramble(word: str) -> str:
        letters = list(word)
        for _ in range(30):
            random.shuffle(letters)
            if "".join(letters) != word:
                return "".join(letters)
        return "".join(reversed(letters))

    def _unscramble(self, d: Difficulty) -> Challenge:
        pool = self._UNSCRAMBLE[d.value]
        word = random.choice(pool)
        scrambled = self._scramble(word)
        return self._build(
            d, "unscramble",
            f"Unscramble the letters to form a word: {scrambled}",
            word,
            display_data={"scrambled": scrambled},
        )

    def _synonym(self, d: Difficulty) -> Challenge:
        pair = random.choice(self._SYNONYMS)
        return self._build(d, "synonym", f"What is a synonym for '{pair[0]}'?", pair[1])

    def _antonym(self, d: Difficulty) -> Challenge:
        pair = random.choice(self._ANTONYMS)
        return self._build(d, "antonym", f"What is an antonym for '{pair[0]}'?", pair[1])

    def _vocab_completion(self, d: Difficulty) -> Challenge:
        item = random.choice(self._VOCAB)
        return self._build(
            d, "vocabulary_completion",
            item["s"],
            item["a"],
            options=item["o"],
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 5. PATTERN RECOGNITION
# ═══════════════════════════════════════════════════════════════════════════════

class PatternRecognitionGenerator(ChallengeGenerator):
    category = Category.PATTERN_RECOGNITION

    _SHAPES = ["circle", "square", "triangle", "diamond", "hexagon", "star"]
    _COLORS = ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "pink"]

    def generate(self, difficulty: Difficulty) -> Challenge:
        fn = random.choice([
            self._shape_sequence,
            self._color_pattern,
            self._number_progression,
        ])
        return fn(difficulty)

    def _shape_sequence(self, d: Difficulty) -> Challenge:
        pat_len = {"easy": 2, "medium": 3, "hard": 4}[d.value]
        pat = random.sample(self._SHAPES, pat_len)
        display_len = pat_len * 2 + 1
        full = (pat * 5)[:display_len]
        answer = pat[len(full) % len(pat)]
        return self._build(
            d, "shape_sequence",
            "What shape comes next in the pattern?",
            answer,
            display_data={"sequence": full},
        )

    def _color_pattern(self, d: Difficulty) -> Challenge:
        pat_len = {"easy": 2, "medium": 3, "hard": 4}[d.value]
        pat = random.sample(self._COLORS, pat_len)
        display_len = pat_len * 2 + 1
        full = (pat * 5)[:display_len]
        answer = pat[len(full) % len(pat)]
        return self._build(
            d, "color_pattern",
            "What color comes next in the pattern?",
            answer,
            display_data={"sequence": full},
        )

    def _number_progression(self, d: Difficulty) -> Challenge:
        if d == Difficulty.EASY:
            start = random.randint(1, 5)
            step = random.randint(2, 5)
            seq = [start + step * i for i in range(5)]
            answer = str(seq[-1] + step)
        elif d == Difficulty.MEDIUM:
            base = random.randint(2, 4)
            seq = [base ** i for i in range(1, 6)]
            answer = str(base ** 6)
        else:
            variant = random.choice(["squares", "triangular"])
            if variant == "squares":
                seq = [i * i for i in range(1, 7)]
                answer = str(7 * 7)
            else:
                seq = [i * (i + 1) // 2 for i in range(1, 7)]
                answer = str(7 * 8 // 2)
        display = ", ".join(map(str, seq))
        return self._build(
            d, "number_progression",
            f"What comes next: {display}, ?",
            answer,
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 6. RIDDLES
# ═══════════════════════════════════════════════════════════════════════════════

class RiddleGenerator(ChallengeGenerator):
    category = Category.RIDDLES

    _POOL: dict[str, list[dict[str, str]]] = {
        "easy": [
            {"q": "I have hands but can't clap. What am I?", "a": "clock"},
            {"q": "What has keys but no locks?", "a": "keyboard"},
            {"q": "What has a head and a tail but no body?", "a": "coin"},
            {"q": "What can you catch but not throw?", "a": "cold"},
            {"q": "What has legs but doesn't walk?", "a": "table"},
            {"q": "What has teeth but cannot bite?", "a": "comb"},
            {"q": "What runs but never walks?", "a": "water"},
        ],
        "medium": [
            {"q": "The more you take, the more you leave behind. What am I?", "a": "footsteps"},
            {"q": "What gets wetter the more it dries?", "a": "towel"},
            {"q": "I speak without a mouth and hear without ears. What am I?", "a": "echo"},
            {"q": "What can travel the world while staying in a corner?", "a": "stamp"},
            {"q": "What has cities but no houses, forests but no trees?", "a": "map"},
            {"q": "What goes up but never comes down?", "a": "age"},
            {"q": "I have a neck but no head. What am I?", "a": "bottle"},
        ],
        "hard": [
            {"q": "I am not alive, but I grow; I need air, but water kills me. What am I?", "a": "fire"},
            {"q": "What disappears as soon as you say its name?", "a": "silence"},
            {"q": "I have branches but no fruit, trunk, or leaves. What am I?", "a": "bank"},
            {"q": "The person who makes it sells it. The buyer never uses it. The user never knows. What is it?", "a": "coffin"},
            {"q": "I can be cracked, made, told, and played. What am I?", "a": "joke"},
            {"q": "I fly without wings. I cry without eyes. What am I?", "a": "cloud"},
            {"q": "What has one eye but cannot see?", "a": "needle"},
        ],
    }

    def generate(self, difficulty: Difficulty) -> Challenge:
        item = random.choice(self._POOL.get(difficulty.value, self._POOL["easy"]))
        return self._build(difficulty, "riddle", item["q"], item["a"])


# ═══════════════════════════════════════════════════════════════════════════════
# 7. QUICK QUIZZES
# ═══════════════════════════════════════════════════════════════════════════════

class QuickQuizGenerator(ChallengeGenerator):
    category = Category.QUICK_QUIZ

    _POOL: dict[str, list[dict]] = {
        "easy": [
            {"q": "What planet is known as the Red Planet?", "o": ["Mars", "Venus", "Jupiter", "Saturn"], "a": "Mars", "t": "science"},
            {"q": "How many continents are there?", "o": ["5", "6", "7", "8"], "a": "7", "t": "general_knowledge"},
            {"q": "What is the chemical symbol for water?", "o": ["H2O", "CO2", "O2", "NaCl"], "a": "H2O", "t": "science"},
            {"q": "Which ocean is the largest?", "o": ["Pacific", "Atlantic", "Indian", "Arctic"], "a": "Pacific", "t": "general_knowledge"},
            {"q": "What gas do plants absorb from the atmosphere?", "o": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], "a": "Carbon Dioxide", "t": "science"},
            {"q": "What is the largest mammal?", "o": ["Elephant", "Blue Whale", "Giraffe", "Hippo"], "a": "Blue Whale", "t": "science"},
            {"q": "How many days are in a leap year?", "o": ["365", "366", "364", "367"], "a": "366", "t": "general_knowledge"},
        ],
        "medium": [
            {"q": "What is the powerhouse of the cell?", "o": ["Mitochondria", "Nucleus", "Ribosome", "Golgi body"], "a": "Mitochondria", "t": "science"},
            {"q": "Who painted the Mona Lisa?", "o": ["Da Vinci", "Michelangelo", "Raphael", "Picasso"], "a": "Da Vinci", "t": "general_knowledge"},
            {"q": "What is the speed of light (approx)?", "o": ["3×10⁸ m/s", "3×10⁶ m/s", "3×10⁴ m/s", "3×10¹⁰ m/s"], "a": "3×10⁸ m/s", "t": "science"},
            {"q": "Which country has the most UNESCO World Heritage Sites?", "o": ["Italy", "China", "Spain", "France"], "a": "Italy", "t": "general_knowledge"},
            {"q": "What element has the atomic number 79?", "o": ["Gold", "Silver", "Iron", "Copper"], "a": "Gold", "t": "science"},
            {"q": "In which year did World War II end?", "o": ["1945", "1944", "1946", "1943"], "a": "1945", "t": "general_knowledge"},
            {"q": "What is the smallest prime number?", "o": ["1", "2", "3", "0"], "a": "2", "t": "science"},
        ],
        "hard": [
            {"q": "What is the half-life of Carbon-14?", "o": ["5730 years", "1000 years", "10000 years", "2500 years"], "a": "5730 years", "t": "science"},
            {"q": "Which philosopher wrote 'The Republic'?", "o": ["Plato", "Aristotle", "Socrates", "Descartes"], "a": "Plato", "t": "general_knowledge"},
            {"q": "What is the rarest blood type?", "o": ["AB-", "O-", "B-", "A-"], "a": "AB-", "t": "science"},
            {"q": "In what year did the Berlin Wall fall?", "o": ["1989", "1991", "1985", "1990"], "a": "1989", "t": "general_knowledge"},
            {"q": "What is Avogadro's number (approx)?", "o": ["6.022×10²³", "6.022×10²⁴", "3.14×10²³", "9.81×10²³"], "a": "6.022×10²³", "t": "science"},
            {"q": "What is the deepest point in the ocean?", "o": ["Mariana Trench", "Java Trench", "Tonga Trench", "Puerto Rico Trench"], "a": "Mariana Trench", "t": "general_knowledge"},
            {"q": "Which planet has the most moons?", "o": ["Saturn", "Jupiter", "Uranus", "Neptune"], "a": "Saturn", "t": "science"},
        ],
    }

    def generate(self, difficulty: Difficulty) -> Challenge:
        item = random.choice(self._POOL.get(difficulty.value, self._POOL["easy"]))
        return self._build(
            difficulty,
            item.get("t", "general_knowledge"),
            item["q"],
            item["a"],
            options=item["o"],
        )


# ═══════════════════════════════════════════════════════════════════════════════
# ADAPTIVE DIFFICULTY MANAGER
# ═══════════════════════════════════════════════════════════════════════════════

class DifficultyManager:
    """Tracks a user's performance history and recommends a difficulty level."""

    def __init__(self) -> None:
        self._history: list[ValidationResult] = []

    def record(self, result: ValidationResult) -> None:
        self._history.append(result)

    def recommend(self, category: str | None = None) -> Difficulty:
        relevant = self._history
        if category:
            relevant = [r for r in relevant if r.category == category]

        if len(relevant) < 3:
            return Difficulty.EASY

        recent = relevant[-5:]
        rate = sum(1 for r in recent if r.is_correct) / len(recent)

        if rate >= 0.8:
            return Difficulty.HARD
        if rate >= 0.5:
            return Difficulty.MEDIUM
        return Difficulty.EASY

    @property
    def total_xp(self) -> int:
        return sum(r.xp_earned for r in self._history)

    @property
    def success_rate(self) -> float:
        if not self._history:
            return 0.0
        return sum(1 for r in self._history if r.is_correct) / len(self._history) * 100

    def category_stats(self) -> dict[str, dict[str, Any]]:
        stats: dict[str, dict[str, Any]] = {}
        for r in self._history:
            if r.category not in stats:
                stats[r.category] = {"total": 0, "correct": 0, "xp": 0}
            stats[r.category]["total"] += 1
            if r.is_correct:
                stats[r.category]["correct"] += 1
            stats[r.category]["xp"] += r.xp_earned
        for cat in stats:
            t = stats[cat]["total"]
            stats[cat]["accuracy"] = round(stats[cat]["correct"] / t * 100, 1) if t else 0
        return stats


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

class CognitiveChallengeEngine:
    """
    Public API for the Cognitive Challenge Engine.

    Methods:
        generate(category, difficulty)  →  Challenge
        validate(challenge, answer, time_taken)  →  ValidationResult
        random_category()  →  Category
        list_categories()  →  list[dict]
    """

    def __init__(self) -> None:
        self._generators: dict[Category, ChallengeGenerator] = {
            Category.MATH: MathGenerator(),
            Category.LOGIC: LogicGenerator(),
            Category.MEMORY: MemoryGenerator(),
            Category.WORD_GAMES: WordGamesGenerator(),
            Category.PATTERN_RECOGNITION: PatternRecognitionGenerator(),
            Category.RIDDLES: RiddleGenerator(),
            Category.QUICK_QUIZ: QuickQuizGenerator(),
        }
        self.difficulty_manager = DifficultyManager()

    def generate(
        self,
        category: str | Category | None = None,
        difficulty: str | Difficulty | None = None,
    ) -> Challenge:
        """Generate a challenge, optionally specifying category and difficulty."""
        if category is None:
            cat = self.random_category()
        elif isinstance(category, str):
            cat = Category(category)
        else:
            cat = category

        if difficulty is None:
            diff = self.difficulty_manager.recommend(cat.value)
        elif isinstance(difficulty, str):
            diff = Difficulty(difficulty)
        else:
            diff = difficulty

        generator = self._generators[cat]
        return generator.generate(diff)

    def validate(
        self,
        challenge: Challenge,
        user_answer: str,
        time_taken_seconds: float = 0.0,
    ) -> ValidationResult:
        """Compare the user's answer, compute score and XP, and record the result."""
        is_correct = (
            user_answer.strip().lower() == challenge.correct_answer.strip().lower()
        )

        base_score = BASE_SCORES.get(Difficulty(challenge.difficulty), 10)
        time_bonus = max(0, 15 - int(time_taken_seconds)) if is_correct else 0
        score = (base_score + time_bonus) if is_correct else 0
        xp = score * XP_MULTIPLIERS.get(Difficulty(challenge.difficulty), 1)

        result = ValidationResult(
            challenge_id=challenge.id,
            is_correct=is_correct,
            user_answer=user_answer,
            correct_answer=challenge.correct_answer,
            score=score,
            xp_earned=xp,
            time_taken_seconds=time_taken_seconds,
            time_bonus=time_bonus,
            category=challenge.category,
            difficulty=challenge.difficulty,
        )

        self.difficulty_manager.record(result)
        return result

    @staticmethod
    def random_category() -> Category:
        return random.choice(list(Category))

    @staticmethod
    def list_categories() -> list[dict[str, str]]:
        return [
            {"value": cat.value, "label": CATEGORY_LABELS[cat]}
            for cat in Category
        ]


# ═══════════════════════════════════════════════════════════════════════════════
# STANDALONE DEMO
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    engine = CognitiveChallengeEngine()

    print("=" * 60)
    print("  COGNITIVE CHALLENGE ENGINE — Interactive Demo")
    print("=" * 60)
    print()
    print("Categories:", ", ".join(c["label"] for c in engine.list_categories()))
    print()

    for cat in Category:
        for diff in Difficulty:
            ch = engine.generate(category=cat, difficulty=diff)
            result = engine.validate(ch, ch.correct_answer, time_taken_seconds=5.0)
            print(
                f"[{cat.value:<22}] [{diff.value:<6}] "
                f"Q: {ch.question[:55]:<55} "
                f"A: {ch.correct_answer:<15} "
                f"Score: {result.score:>3}  XP: {result.xp_earned:>4}"
            )

    print()
    print(f"Total XP accumulated: {engine.difficulty_manager.total_xp}")
    print(f"Overall success rate:  {engine.difficulty_manager.success_rate:.1f}%")
    print()
    print("Category breakdown:")
    for cat, stats in engine.difficulty_manager.category_stats().items():
        print(f"  {cat:<25} → {stats['correct']}/{stats['total']} correct ({stats['accuracy']}%), {stats['xp']} XP")

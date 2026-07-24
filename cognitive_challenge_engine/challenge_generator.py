"""
challenge_generator.py

Wraps the Google Gemini API to generate cognitive challenges for the
Cognitive Challenge Engine. Each category has its own prompt template tuned
to produce a consistent, parseable JSON shape:

{
  "category": "logic_puzzles",
  "difficulty": "medium",
  "question": "...",
  "answer": "...",           # the correct answer (string)
  "choices": [...] | null,   # present for multiple-choice types, else null
  "explanation": "..."       # short explanation shown after answering
}

Categories map 1:1 to the branches in the mind map:
  math_problems, logic_puzzles, memory_challenges, word_games,
  pattern_recognition, riddles, quick_quizzes
"""

import os
import json
import random
import uuid
from google import genai
from google.genai import types

MODEL = "gemini-3.5-flash-lite"

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Subtopics per category. Picked randomly on the PYTHON side (not left to the
# model) so repeated requests actually vary, instead of the model always
# reaching for its single most-likely subtopic.
CATEGORY_SUBTOPICS = {
    "math_problems": ["arithmetic operation", "percentage problem", "simple algebraic expression to solve for x"],
    "logic_puzzles": ["number pattern (find the next number)", "short logical reasoning riddle", "find-the-missing-element puzzle (missing shape/number in a sequence)"],
    "memory_challenges": ["a short list of 5-7 words or numbers to memorize then recall in order", "an image-sequence-recall challenge described in text (e.g. shapes/colors in a sequence, then ask which was Nth)", "a position-based memory test (describe a 3x3 grid with one marked cell, ask for its position after a delay)"],
    "word_games": ["unscramble this word", "give a synonym for this word", "give an antonym for this word", "complete this vocabulary sentence with the missing word"],
    "pattern_recognition": ["shape-sequence pattern (described in words)", "color pattern", "number progression"],
    "riddles": ["short reasoning riddle", "everyday logic riddle"],
    "quick_quizzes": ["general knowledge question", "basic science question"],
}

# Concrete, category-specific guidance per difficulty level, so "easy" vs
# "hard" actually changes the numbers/complexity involved instead of being
# ignored by the model.
DIFFICULTY_SPECS = {
    "math_problems": {
        "easy": "Use single-digit or small two-digit numbers (e.g. addition/subtraction under 20, or a round percentage like 10%/50% of a round number). Solvable in under 10 seconds.",
        "medium": "Use two-digit numbers, multiplication/division, a percentage of a non-round number, or a one-step algebraic equation (e.g. 2x + 3 = 11).",
        "hard": "Use multi-step arithmetic, a percentage requiring two steps, or a two-step algebraic equation (e.g. 3x - 5 = 2x + 7). Still mentally solvable but requires more working.",
    },
    "logic_puzzles": {
        "easy": "Use a short, obvious sequence (e.g. simple +2 number pattern) or a one-step logical deduction.",
        "medium": "Use a pattern with two combined rules (e.g. alternating +2/-1) or a logic riddle needing 2 deduction steps.",
        "hard": "Use a pattern with a non-obvious rule (e.g. multiply then subtract) or a logic riddle needing 3+ deduction steps.",
    },
    "memory_challenges": {
        "easy": "Use only 3-4 items to memorize.",
        "medium": "Use 5-6 items to memorize.",
        "hard": "Use 7-8 items to memorize, or add a distractor step between memorizing and recalling.",
    },
    "word_games": {
        "easy": "Use a common, short (4-5 letter) everyday word.",
        "medium": "Use a moderately common 6-8 letter word.",
        "hard": "Use a longer or less common word (9+ letters, still real and in general use, not obscure jargon).",
    },
    "pattern_recognition": {
        "easy": "Use a simple repeating 2-element pattern (e.g. A, B, A, B, ?).",
        "medium": "Use a 3-element repeating or arithmetic pattern.",
        "hard": "Use a pattern combining two rules at once (e.g. shape changes AND count increases).",
    },
    "riddles": {
        "easy": "Use a riddle with an obvious, well-known answer.",
        "medium": "Use a riddle requiring one lateral-thinking step.",
        "hard": "Use a riddle requiring multiple lateral-thinking steps or wordplay.",
    },
    "quick_quizzes": {
        "easy": "Use a widely-known fact (elementary-school level).",
        "medium": "Use a fact a well-read adult would likely know.",
        "hard": "Use a more specific or less commonly known fact (but still verifiable and non-obscure).",
    },
}

VALID_CATEGORIES = list(CATEGORY_SUBTOPICS.keys())

SYSTEM_PROMPT = """You are a challenge generator for a cognitive-training app.
Respond with ONLY a single JSON object, no markdown fences, no preamble, no
commentary. The JSON object must have exactly these keys:

- "category": string, one of the known category ids (passed to you)
- "difficulty": one of "easy", "medium", "hard"
- "question": string, the full challenge text shown to the user
- "answer": string, the correct answer (concise, suitable for exact-match or
  fuzzy-match comparison against user input)
- "choices": an array of 4 strings if this is multiple choice, otherwise null
- "explanation": a one-sentence explanation of the answer, shown after the
  user submits a response

Every request includes a random seed. Use it to genuinely vary the specific
numbers, words, and subject matter — never reuse a question, number set, or
word from a previous call. Keep the question text under 400 characters.
"""


def generate_challenge(category: str, difficulty: str = "medium") -> dict:
    """Call Gemini to generate one challenge for the given category.

    Raises ValueError for an unknown category, and json.JSONDecodeError if
    the model's response can't be parsed (caller should handle / retry).
    """
    if category not in CATEGORY_SUBTOPICS:
        raise ValueError(
            f"Unknown category '{category}'. Valid options: {VALID_CATEGORIES}"
        )

    if difficulty not in ("easy", "medium", "hard"):
        difficulty = "medium"

    # Pick the subtopic on the Python side so repeated calls actually vary
    # instead of the model defaulting to the same "random" choice every time.
    subtopic = random.choice(CATEGORY_SUBTOPICS[category])
    difficulty_guidance = DIFFICULTY_SPECS[category][difficulty]
    seed = uuid.uuid4().hex[:8]

    user_prompt = (
        f"Category id: {category}\n"
        f"Subtopic to use: {subtopic}\n"
        f"Target difficulty: {difficulty}\n"
        f"Difficulty guidance (follow exactly): {difficulty_guidance}\n"
        f"Random seed: {seed} (use only to pick fresh, unique numbers/words — "
        f"do not print the seed itself anywhere in your output)\n\n"
        f'Set "category" in your JSON output to exactly "{category}" and '
        f'"difficulty" to exactly "{difficulty}".'
    )

    response = client.models.generate_content(
        model=MODEL,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            max_output_tokens=1024,
            thinking_config=types.ThinkingConfig(thinking_level="minimal"),
        ),
    )

    raw_text = response.text.strip()

    # Strip stray markdown fences just in case the model adds them.
    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        if raw_text.startswith("json"):
            raw_text = raw_text[4:].strip()

    challenge = json.loads(raw_text)
    return challenge


def random_category() -> str:
    return random.choice(VALID_CATEGORIES)

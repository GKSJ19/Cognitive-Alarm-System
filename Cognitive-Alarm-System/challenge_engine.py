"""
Cognitive Challenge Engine
Generates and manages personalized cognitive challenges for wake-up verification
"""

import random
import string
from typing import Dict, List, Tuple, Optional
from enum import Enum
from datetime import datetime


class DifficultyLevel(Enum):
    BEGINNER = 1
    EASY = 2
    MEDIUM = 3
    HARD = 4
    EXPERT = 5


class MathChallenge:
    """Math problem generator"""
    
    @staticmethod
    def generate(difficulty: DifficultyLevel) -> Dict:
        """Generate a math challenge"""
        if difficulty == DifficultyLevel.BEGINNER:
            a, b = random.randint(1, 5), random.randint(1, 5)
            op = random.choice(['+', '-'])
            if op == '+':
                answer = str(a + b)
                question = f"What is {a} + {b}?"
            else:
                answer = str(abs(a - b))
                question = f"What is {a} - {b}?"
            time_limit = 30
            
        elif difficulty == DifficultyLevel.EASY:
            a, b = random.randint(5, 15), random.randint(5, 15)
            op = random.choice(['+', '-', '*'])
            if op == '+':
                answer = str(a + b)
                question = f"What is {a} + {b}?"
            elif op == '-':
                answer = str(a - b)
                question = f"What is {a} - {b}?"
            else:
                answer = str(a * b)
                question = f"What is {a} × {b}?"
            time_limit = 45
            
        elif difficulty == DifficultyLevel.MEDIUM:
            a, b, c = random.randint(10, 50), random.randint(10, 50), random.randint(2, 10)
            question = f"What is ({a} + {b}) × {c}?"
            answer = str((a + b) * c)
            time_limit = 60
            
        elif difficulty == DifficultyLevel.HARD:
            a, b, c = random.randint(20, 100), random.randint(20, 100), random.randint(5, 20)
            question = f"What is ({a} × {b}) ÷ {c}?"
            answer = str(int((a * b) / c))
            time_limit = 90
            
        else:  # EXPERT
            base = random.randint(2, 12)
            power = random.randint(2, 4)
            answer = str(base ** power)
            question = f"What is {base}^{power}?"
            time_limit = 120
        
        return {
            "type": "math",
            "difficulty": difficulty.name.lower(),
            "question": question,
            "answer": answer,
            "time_limit": time_limit,
            "hints": ["Look at the numbers carefully", "Check your math"]
        }


class LogicPuzzle:
    """Logic puzzle generator"""
    
    PUZZLES = [
        {
            "difficulty": DifficultyLevel.BEGINNER,
            "question": "I have cities but no houses. I have mountains but no trees. I have water but no fish. What am I?",
            "answer": "map",
            "hints": ["It's something you can hold", "You use it for travel"]
        },
        {
            "difficulty": DifficultyLevel.EASY,
            "question": "What has hands but cannot clap?",
            "answer": "clock",
            "hints": ["It tells you something important", "It's on your wall or wrist"]
        },
        {
            "difficulty": DifficultyLevel.MEDIUM,
            "question": "I speak without a mouth and hear without ears. I have no body, but come alive in wind. What am I?",
            "answer": "echo",
            "hints": ["Something you hear", "Related to sound"]
        },
        {
            "difficulty": DifficultyLevel.HARD,
            "question": "A man pushes his car to a hotel and tells the owner he's bankrupt. Why?",
            "answer": "playing monopoly",
            "hints": ["It's a game", "Think about board games"]
        },
        {
            "difficulty": DifficultyLevel.EXPERT,
            "question": "What can travel around the world while staying in a corner?",
            "answer": "stamp",
            "hints": ["Related to mail", "Postage..."]
        }
    ]
    
    @staticmethod
    def generate(difficulty: DifficultyLevel) -> Dict:
        """Generate a logic puzzle"""
        puzzles = [p for p in LogicPuzzle.PUZZLES if p["difficulty"] == difficulty]
        puzzle = random.choice(puzzles)
        
        time_limits = {
            DifficultyLevel.BEGINNER: 30,
            DifficultyLevel.EASY: 45,
            DifficultyLevel.MEDIUM: 60,
            DifficultyLevel.HARD: 90,
            DifficultyLevel.EXPERT: 120
        }
        
        return {
            "type": "logic",
            "difficulty": difficulty.name.lower(),
            "question": puzzle["question"],
            "answer": puzzle["answer"].lower(),
            "time_limit": time_limits[difficulty],
            "hints": puzzle["hints"]
        }


class MemoryChallenge:
    """Memory challenge generator"""
    
    @staticmethod
    def generate(difficulty: DifficultyLevel) -> Dict:
        """Generate a memory challenge"""
        sequence_lengths = {
            DifficultyLevel.BEGINNER: 3,
            DifficultyLevel.EASY: 4,
            DifficultyLevel.MEDIUM: 5,
            DifficultyLevel.HARD: 6,
            DifficultyLevel.EXPERT: 7
        }
        
        length = sequence_lengths[difficulty]
        sequence = [random.randint(1, 9) for _ in range(length)]
        
        time_limits = {
            DifficultyLevel.BEGINNER: 15,
            DifficultyLevel.EASY: 12,
            DifficultyLevel.MEDIUM: 10,
            DifficultyLevel.HARD: 8,
            DifficultyLevel.EXPERT: 5
        }
        
        question = f"Remember this sequence: {' '.join(map(str, sequence))}. Enter it again:"
        
        return {
            "type": "memory",
            "difficulty": difficulty.name.lower(),
            "question": question,
            "answer": ''.join(map(str, sequence)),
            "time_limit": time_limits[difficulty],
            "display_duration": 3,  # Show sequence for 3 seconds
            "hints": ["The sequence was displayed above", "Type all numbers in order"]
        }


class PatternRecognition:
    """Pattern recognition challenge generator"""
    
    PATTERNS = [
        ("2, 4, 6, 8, ?", "10"),
        ("1, 4, 9, 16, ?", "25"),
        ("3, 6, 12, 24, ?", "48"),
        ("5, 10, 15, 20, ?", "25"),
        ("1, 1, 2, 3, 5, 8, ?", "13"),  # Fibonacci
        ("A, C, E, G, ?", "i"),
        ("1, 4, 7, 10, ?", "13"),
        ("100, 81, 64, 49, ?", "36"),
    ]
    
    @staticmethod
    def generate(difficulty: DifficultyLevel) -> Dict:
        """Generate a pattern recognition challenge"""
        pattern, answer = random.choice(PatternRecognition.PATTERNS)
        
        time_limits = {
            DifficultyLevel.BEGINNER: 45,
            DifficultyLevel.EASY: 60,
            DifficultyLevel.MEDIUM: 75,
            DifficultyLevel.HARD: 90,
            DifficultyLevel.EXPERT: 120
        }
        
        return {
            "type": "pattern",
            "difficulty": difficulty.name.lower(),
            "question": f"What is the next number in this sequence? {pattern}",
            "answer": answer.lower(),
            "time_limit": time_limits[difficulty],
            "hints": ["Look for a mathematical relationship", "Try adding or multiplying"]
        }


class WordGame:
    """Word game generator"""
    
    WORDS = {
        DifficultyLevel.BEGINNER: ["cat", "dog", "sun", "moon", "star"],
        DifficultyLevel.EASY: ["computer", "keyboard", "monitor", "software"],
        DifficultyLevel.MEDIUM: ["algorithm", "programming", "intelligence"],
        DifficultyLevel.HARD: ["perseverance", "eloquence", "serendipity"],
        DifficultyLevel.EXPERT: ["antidisestablishmentarianism", "pseudopseudohypoparathyroidism"]
    }
    
    @staticmethod
    def generate(difficulty: DifficultyLevel) -> Dict:
        """Generate a word game challenge"""
        word = random.choice(WordGame.WORDS[difficulty])
        scrambled = ''.join(random.sample(word, len(word)))
        
        time_limits = {
            DifficultyLevel.BEGINNER: 30,
            DifficultyLevel.EASY: 45,
            DifficultyLevel.MEDIUM: 60,
            DifficultyLevel.HARD: 90,
            DifficultyLevel.EXPERT: 120
        }
        
        return {
            "type": "word",
            "difficulty": difficulty.name.lower(),
            "question": f"Unscramble this word: {scrambled}",
            "answer": word.lower(),
            "time_limit": time_limits[difficulty],
            "hints": [f"It has {len(word)} letters", "Think about common words"]
        }


class Riddle:
    """Riddle generator"""
    
    RIDDLES = [
        {
            "difficulty": DifficultyLevel.BEGINNER,
            "question": "What has a face and two hands but no arms or legs?",
            "answer": "clock"
        },
        {
            "difficulty": DifficultyLevel.EASY,
            "question": "I have keys but no locks. I have space but no room. You can enter but you can't go inside. What am I?",
            "answer": "keyboard"
        },
        {
            "difficulty": DifficultyLevel.MEDIUM,
            "question": "The more you take, the more you leave behind. What am I?",
            "answer": "footsteps"
        },
        {
            "difficulty": DifficultyLevel.HARD,
            "question": "I am taken from a mine and shut up in a wooden case, from which I am never released, yet I am used by almost everyone. What am I?",
            "answer": "pencil lead"
        },
        {
            "difficulty": DifficultyLevel.EXPERT,
            "question": "I speak all languages. I know all the world. I know what you know, but I know it before you do. What am I?",
            "answer": "mirror"
        }
    ]
    
    @staticmethod
    def generate(difficulty: DifficultyLevel) -> Dict:
        """Generate a riddle"""
        riddles = [r for r in Riddle.RIDDLES if r["difficulty"] == difficulty]
        riddle = random.choice(riddles)
        
        time_limits = {
            DifficultyLevel.BEGINNER: 30,
            DifficultyLevel.EASY: 45,
            DifficultyLevel.MEDIUM: 60,
            DifficultyLevel.HARD: 90,
            DifficultyLevel.EXPERT: 120
        }
        
        return {
            "type": "riddle",
            "difficulty": difficulty.name.lower(),
            "question": riddle["question"],
            "answer": riddle["answer"].lower(),
            "time_limit": time_limits[difficulty],
            "hints": ["Think about what the words mean", "Try different interpretations"]
        }


class QuickQuiz:
    """Quick quiz generator"""
    
    QUESTIONS = {
        DifficultyLevel.BEGINNER: [
            {"q": "What is the capital of France?", "a": "paris"},
            {"q": "What is 2 + 2?", "a": "4"},
            {"q": "What color is the sky?", "a": "blue"},
            {"q": "How many days are in a week?", "a": "7"},
        ],
        DifficultyLevel.EASY: [
            {"q": "Who wrote 'Romeo and Juliet'?", "a": "shakespeare"},
            {"q": "What is the largest planet?", "a": "jupiter"},
            {"q": "How many sides does a triangle have?", "a": "3"},
        ],
        DifficultyLevel.MEDIUM: [
            {"q": "What year did World War II end?", "a": "1945"},
            {"q": "What is the chemical symbol for gold?", "a": "au"},
            {"q": "Who invented the telephone?", "a": "bell"},
        ],
        DifficultyLevel.HARD: [
            {"q": "What is the capital of Mongolia?", "a": "ulaanbaatar"},
            {"q": "Who composed the 'Four Seasons'?", "a": "vivaldi"},
        ],
        DifficultyLevel.EXPERT: [
            {"q": "What is the only mammal that cannot jump?", "a": "elephant"},
            {"q": "What is the most spoken language by native speakers?", "a": "mandarin"},
        ]
    }
    
    @staticmethod
    def generate(difficulty: DifficultyLevel) -> Dict:
        """Generate a quick quiz question"""
        questions = QuickQuiz.QUESTIONS[difficulty]
        question_data = random.choice(questions)
        
        time_limits = {
            DifficultyLevel.BEGINNER: 20,
            DifficultyLevel.EASY: 30,
            DifficultyLevel.MEDIUM: 45,
            DifficultyLevel.HARD: 60,
            DifficultyLevel.EXPERT: 90
        }
        
        return {
            "type": "quiz",
            "difficulty": difficulty.name.lower(),
            "question": question_data["q"],
            "answer": question_data["a"].lower(),
            "time_limit": time_limits[difficulty],
            "hints": ["Think carefully", "You might know this already"]
        }


class ChallengeEngine:
    """Main challenge engine for generating personalized challenges"""
    
    GENERATORS = {
        "math": MathChallenge,
        "logic": LogicPuzzle,
        "memory": MemoryChallenge,
        "pattern": PatternRecognition,
        "word": WordGame,
        "riddle": Riddle,
        "quiz": QuickQuiz
    }
    
    @staticmethod
    def generate_challenge(
        challenge_type: str = None,
        difficulty: str = "medium"
    ) -> Dict:
        """Generate a random or specific challenge"""
        
        # Convert difficulty string to enum
        difficulty_map = {
            "beginner": DifficultyLevel.BEGINNER,
            "easy": DifficultyLevel.EASY,
            "medium": DifficultyLevel.MEDIUM,
            "hard": DifficultyLevel.HARD,
            "expert": DifficultyLevel.EXPERT
        }
        
        difficulty_enum = difficulty_map.get(difficulty.lower(), DifficultyLevel.MEDIUM)
        
        # If no challenge type specified, randomly select one
        if challenge_type is None:
            challenge_type = random.choice(list(ChallengeEngine.GENERATORS.keys()))
        
        # Get generator
        generator = ChallengeEngine.GENERATORS.get(challenge_type.lower())
        if generator is None:
            generator = MathChallenge
        
        # Generate challenge
        challenge = generator.generate(difficulty_enum)
        challenge["challenge_type"] = challenge_type.lower()
        challenge["created_at"] = datetime.utcnow().isoformat()
        
        return challenge
    
    @staticmethod
    def generate_personalized_challenge(
        user_performance: Dict,
        user_difficulty_preference: str = "medium"
    ) -> Dict:
        """Generate a challenge based on user performance"""
        
        # Determine adaptive difficulty
        accuracy = user_performance.get("accuracy", 0.5)
        speed = user_performance.get("avg_speed", 0.5)  # 0-1 scale
        
        # Adjust difficulty based on performance
        difficulty = user_difficulty_preference.lower()
        
        if accuracy > 0.85 and speed > 0.75:  # Very good performance
            difficulty = "expert" if difficulty != "expert" else "hard"
        elif accuracy > 0.75 and speed > 0.6:  # Good performance
            if difficulty == "beginner":
                difficulty = "easy"
            elif difficulty == "easy":
                difficulty = "medium"
            elif difficulty == "medium":
                difficulty = "hard"
        elif accuracy < 0.5:  # Poor performance
            if difficulty == "expert":
                difficulty = "hard"
            elif difficulty == "hard":
                difficulty = "medium"
            elif difficulty == "medium":
                difficulty = "easy"
        
        # Select varied challenge types
        recent_types = user_performance.get("recent_types", [])
        available_types = [t for t in ChallengeEngine.GENERATORS.keys() if t not in recent_types[-2:]]
        challenge_type = random.choice(available_types) if available_types else random.choice(list(ChallengeEngine.GENERATORS.keys()))
        
        return ChallengeEngine.generate_challenge(challenge_type, difficulty)
    
    @staticmethod
    def calculate_points(
        is_correct: bool,
        time_taken: int,
        time_limit: int,
        difficulty: str
    ) -> int:
        """Calculate points for challenge completion"""
        
        if not is_correct:
            return 0
        
        # Base points by difficulty
        base_points = {
            "beginner": 10,
            "easy": 20,
            "medium": 30,
            "hard": 50,
            "expert": 100
        }
        
        base = base_points.get(difficulty.lower(), 30)
        
        # Time bonus
        if time_taken < time_limit * 0.5:
            time_bonus = base * 0.5
        elif time_taken < time_limit * 0.75:
            time_bonus = base * 0.25
        else:
            time_bonus = 0
        
        return int(base + time_bonus)

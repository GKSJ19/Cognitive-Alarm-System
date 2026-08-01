import random
import uuid

CHALLENGE_TYPES = ["Math", "Logic", "Memory", "Pattern", "Word", "Riddle"]

class ChallengeEngine:
    @staticmethod
    def generate_challenge(difficulty: str, user_id: str = None, previous_type: str = None):
        """Generates a random challenge ensuring it's not the same as the previous one."""
        available_types = [t for t in CHALLENGE_TYPES if t != previous_type]
        challenge_type = random.choice(available_types)
        
        if challenge_type == "Math":
            return ChallengeEngine._generate_math(difficulty)
        elif challenge_type == "Logic":
            return ChallengeEngine._generate_logic(difficulty)
        elif challenge_type == "Memory":
            return ChallengeEngine._generate_memory(difficulty)
        elif challenge_type == "Pattern":
            return ChallengeEngine._generate_pattern(difficulty)
        elif challenge_type == "Word":
            return ChallengeEngine._generate_word(difficulty)
        elif challenge_type == "Riddle":
            return ChallengeEngine._generate_riddle(difficulty)
        else:
            return ChallengeEngine._generate_math(difficulty)

    @staticmethod
    def _generate_math(difficulty: str):
        if difficulty == "Beginner":
            num1, num2 = random.randint(1, 10), random.randint(1, 10)
            op = "+"
            ans = num1 + num2
        elif difficulty == "Easy":
            num1, num2 = random.randint(10, 50), random.randint(10, 50)
            op = random.choice(["+", "-"])
            ans = num1 + num2 if op == "+" else num1 - num2
        elif difficulty == "Medium":
            num1, num2 = random.randint(10, 20), random.randint(2, 9)
            op = "*"
            ans = num1 * num2
            options = [str(ans), str(ans + 2), str(ans - 1), str(ans + 5)]
            random.shuffle(options)
            return {
                "type": "Math",
                "difficulty": difficulty,
                "content": {
                    "question": f"What is {num1} {op} {num2}?",
                    "options": options
                },
                "correct_answer": str(ans),
                "time_limit_seconds": 45,
                "points": 20
            }
        elif difficulty == "Hard":
            num1, num2, num3 = random.randint(10, 50), random.randint(2, 9), random.randint(10, 50)
            op = "*+"
            ans = (num1 * num2) + num3
            return {
                "type": "Math",
                "difficulty": difficulty,
                "content": {
                    "question": f"What is ({num1} * {num2}) + {num3}?",
                    "options": [str(ans), str(ans + random.randint(1, 10)), str(ans - random.randint(1, 10)), str(ans + random.randint(11, 20))]
                },
                "correct_answer": str(ans),
                "time_limit_seconds": 60,
                "points": 30
            }
        else: # Expert
            num1, num2 = random.randint(10, 99), random.randint(10, 99)
            ans = num1 * num2
            return {
                "type": "Math",
                "difficulty": difficulty,
                "content": {
                    "question": f"What is {num1} * {num2}?",
                    "options": [str(ans), str(ans + 10), str(ans - 10), str(ans + 100)]
                },
                "correct_answer": str(ans),
                "time_limit_seconds": 45,
                "points": 50
            }

        # Fallback for Beginner and Easy
        options = [str(ans), str(ans + 2), str(ans - 1), str(ans + 5)]
        random.shuffle(options)
        return {
            "type": "Math",
            "difficulty": difficulty,
            "content": {
                "question": f"What is {num1} {op} {num2}?",
                "options": options
            },
            "correct_answer": str(ans),
            "time_limit_seconds": 30 if difficulty in ["Beginner", "Easy"] else 45,
            "points": 10 if difficulty in ["Beginner", "Easy"] else 20
        }

    @staticmethod
    def _generate_logic(difficulty: str):
        # Simplified Logic generator
        questions = [
            ("If all bloops are razzies and all razzies are lazzies, are all bloops lazzies?", "Yes", ["Yes", "No", "Maybe", "Cannot be determined"]),
            ("Some flinks are plinks. No plinks are slinks. Can a flink be a slink?", "Yes", ["Yes", "No", "Always", "Never"]),
            ("David's father has three sons: Snap, Crackle, and...?", "David", ["Pop", "David", "John", "Snack"])
        ]
        q, ans, options = random.choice(questions)
        random.shuffle(options)
        return {
            "type": "Logic",
            "difficulty": difficulty,
            "content": {
                "question": q,
                "options": options
            },
            "correct_answer": ans,
            "time_limit_seconds": 60,
            "points": 20
        }

    @staticmethod
    def _generate_memory(difficulty: str):
        # Generate a sequence of numbers or letters to remember
        length = 4 if difficulty in ["Beginner", "Easy"] else (6 if difficulty == "Medium" else 8)
        sequence = "".join([str(random.randint(0, 9)) for _ in range(length)])
        return {
            "type": "Memory",
            "difficulty": difficulty,
            "content": {
                "question": f"Memorize this sequence: {sequence}",
                "sequence": sequence,
                "display_time_ms": 3000 if difficulty == "Hard" else 5000,
            },
            "correct_answer": sequence,
            "time_limit_seconds": 30,
            "points": 25
        }

    @staticmethod
    def _generate_pattern(difficulty: str):
        # Find the next number in the pattern
        start = random.randint(1, 10)
        step = random.randint(2, 5)
        pattern = [start + (i * step) for i in range(4)]
        ans = str(start + (4 * step))
        options = [ans, str(int(ans) + step), str(int(ans) - step), str(int(ans) + 1)]
        random.shuffle(options)
        return {
            "type": "Pattern",
            "difficulty": difficulty,
            "content": {
                "question": f"What comes next? {pattern[0]}, {pattern[1]}, {pattern[2]}, {pattern[3]}, ...",
                "options": options
            },
            "correct_answer": ans,
            "time_limit_seconds": 45,
            "points": 15
        }

    @staticmethod
    def _generate_word(difficulty: str):
        words = [("SCRAMBLE", "MACBERLS"), ("ALARM", "MAARL"), ("MORNING", "GNMRNOI")]
        word, scrambled = random.choice(words)
        return {
            "type": "Word",
            "difficulty": difficulty,
            "content": {
                "question": f"Unscramble the word: {scrambled}",
                "options": [] # Text input
            },
            "correct_answer": word,
            "time_limit_seconds": 60,
            "points": 15
        }

    @staticmethod
    def _generate_riddle(difficulty: str):
        riddles = [
            ("I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", "An echo", ["A ghost", "An echo", "A cloud", "A shadow"]),
            ("You measure my life in hours and I serve you by expiring. I'm quick when I'm thin and slow when I'm fat. What am I?", "A candle", ["A clock", "A candle", "An hourglass", "A battery"])
        ]
        q, ans, options = random.choice(riddles)
        random.shuffle(options)
        return {
            "type": "Riddle",
            "difficulty": difficulty,
            "content": {
                "question": q,
                "options": options
            },
            "correct_answer": ans,
            "time_limit_seconds": 60,
            "points": 20
        }

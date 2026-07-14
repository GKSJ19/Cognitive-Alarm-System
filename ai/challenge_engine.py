import random


class ChallengeEngine:

    # -----------------------------
    # EASY LEVEL
    # -----------------------------
    def easy_math(self):
        a = random.randint(1, 20)
        b = random.randint(1, 20)

        return {
            "type": "Math",
            "difficulty": "Easy",
            "question": f"{a} + {b} = ?",
            "answer": a + b
        }

    def easy_memory(self):
        sequence = [random.randint(1, 5) for _ in range(3)]

        return {
            "type": "Memory",
            "difficulty": "Easy",
            "question": sequence,
            "answer": sequence
        }

    def easy_logic(self):
        questions = [
            {
                "question": "What comes next? 2, 4, 6, 8, ?",
                "answer": "10"
            },
            {
                "question": "Odd one out: Apple, Mango, Car, Banana",
                "answer": "Car"
            }
        ]

        q = random.choice(questions)

        return {
            "type": "Logic",
            "difficulty": "Easy",
            "question": q["question"],
            "answer": q["answer"]
        }

    # -----------------------------
    # MEDIUM LEVEL
    # -----------------------------
    def medium_math(self):
        a = random.randint(20, 100)
        b = random.randint(20, 100)

        return {
            "type": "Math",
            "difficulty": "Medium",
            "question": f"{a} × {b} = ?",
            "answer": a * b
        }

    def medium_memory(self):
        sequence = [random.randint(1, 9) for _ in range(5)]

        return {
            "type": "Memory",
            "difficulty": "Medium",
            "question": sequence,
            "answer": sequence
        }

    def medium_logic(self):
        questions = [
            {
                "question": "Find the missing number: 3, 6, 12, 24, ?",
                "answer": "48"
            },
            {
                "question": "Which number is odd? 22, 44, 57, 68",
                "answer": "57"
            }
        ]

        q = random.choice(questions)

        return {
            "type": "Logic",
            "difficulty": "Medium",
            "question": q["question"],
            "answer": q["answer"]
        }

    # -----------------------------
    # HARD LEVEL
    # -----------------------------
    def hard_math(self):
        a = random.randint(100, 500)
        b = random.randint(100, 500)

        return {
            "type": "Math",
            "difficulty": "Hard",
            "question": f"{a} × {b} = ?",
            "answer": a * b
        }

    def hard_memory(self):
        sequence = [random.randint(1, 9) for _ in range(8)]

        return {
            "type": "Memory",
            "difficulty": "Hard",
            "question": sequence,
            "answer": sequence
        }

    def hard_logic(self):
        questions = [
            {
                "question": "If CAT = 24 and DOG = 26, what is BAT?",
                "answer": "23"
            },
            {
                "question": "Complete the series: 1, 4, 9, 16, 25, ?",
                "answer": "36"
            }
        ]

        q = random.choice(questions)

        return {
            "type": "Logic",
            "difficulty": "Hard",
            "question": q["question"],
            "answer": q["answer"]
        }

    # -----------------------------
    # RANDOM GENERATOR
    # -----------------------------
    # -----------------------------
    # RANDOM GENERATOR
    # -----------------------------
    def generate_challenge(self, challenge_type, difficulty):

        challenge_type = challenge_type.lower()
        difficulty = difficulty.lower()

        if challenge_type == "math":

            if difficulty == "easy":
                return self.easy_math()

            elif difficulty == "medium":
                return self.medium_math()

            elif difficulty == "hard":
                return self.hard_math()

        elif challenge_type == "memory":

            if difficulty == "easy":
                return self.easy_memory()

            elif difficulty == "medium":
                return self.medium_memory()

            elif difficulty == "hard":
                return self.hard_memory()

        elif challenge_type == "logic":

            if difficulty == "easy":
                return self.easy_logic()

            elif difficulty == "medium":
                return self.medium_logic()

            elif difficulty == "hard":
                return self.hard_logic()

        return {
            "error": "Invalid challenge type or difficulty level"
        }
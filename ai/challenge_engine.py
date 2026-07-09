import random

class ChallengeEngine:
    def generate_math_problem(self):
        a = random.randint(10, 50)
        b = random.randint(10, 50)

        return {
            "type": "Math",
            "question": f"{a} + {b} = ?",
            "answer": a + b
        }

    def generate_memory_challenge(self):
        sequence = [random.randint(1, 9) for _ in range(5)]

        return {
            "type": "Memory",
            "question": sequence,
            "answer": sequence
        }

    def generate_logic_question(self):
        questions = [
            {
                "question": "What comes next? 2,4,6,8, ?",
                "answer": "10"
            },
            {
                "question": "Odd one out: Apple, Mango, Car, Banana",
                "answer": "Car"
            }
        ]

        return random.choice(questions)
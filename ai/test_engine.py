from challenge_engine import CognitiveChallengeEngine

engine = CognitiveChallengeEngine()

challenge = engine.generate()

print("Category :", challenge.category)
print("Difficulty :", challenge.difficulty)
print("Question :", challenge.question)
print("Correct Answer :", challenge.correct_answer)
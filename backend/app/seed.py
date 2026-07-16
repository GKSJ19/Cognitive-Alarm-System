import json
from sqlalchemy.orm import Session
from app.models import ChallengeCategory, Challenge

def seed_database(db: Session):
    # 1. Seed Categories
    categories_data = [
        {"name": "Math Problems", "description": "Procedural mental arithmetic puzzles at different difficulties."},
        {"name": "Logic Puzzles", "description": "Brain teasers testing analytical thinking."},
        {"name": "Memory Challenges", "description": "Quick cognitive recognition and repetition tasks."},
        {"name": "Word Games", "description": "Anagram solving and vocabulary scrambles."},
        {"name": "Pattern Recognition", "description": "Sequences, prime numbers, and progression completions."},
        {"name": "Riddles", "description": "Traditional wordplay riddles requiring intuitive solutions."},
        {"name": "Quick Quiz", "description": "General trivia questions with multiple options."}
    ]

    # Map name -> category DB object for linking challenges
    category_map = {}
    for cat in categories_data:
        db_cat = db.query(ChallengeCategory).filter(ChallengeCategory.name == cat["name"]).first()
        if not db_cat:
            db_cat = ChallengeCategory(name=cat["name"], description=cat["description"])
            db.add(db_cat)
            db.commit()
            db.refresh(db_cat)
        category_map[cat["name"]] = db_cat

    # 2. Check if we need to seed challenges (only if table is empty)
    if db.query(Challenge).count() > 0:
        return

    challenges = []

    # --- Logic Puzzles ---
    logic_cat = category_map["Logic Puzzles"]
    challenges.extend([
        Challenge(
            category_id=logic_cat.id,
            question_text="If a doctor gives you 3 pills and tells you to take one every half hour, how long will they last (in minutes)?",
            difficulty="easy",
            correct_answer="60",
            additional_data=json.dumps({"tip": "Think about when the first pill is taken."})
        ),
        Challenge(
            category_id=logic_cat.id,
            question_text="A father's child is my child's father. What is my relationship to the father? (Son, Daughter, Brother, Father)",
            difficulty="medium",
            correct_answer="Son",
            additional_data=json.dumps({"options": ["Son", "Daughter", "Brother", "Father"]})
        ),
        Challenge(
            category_id=logic_cat.id,
            question_text="You have a 3-gallon jug and a 5-gallon jug. How many fills of the 5-gallon jug are needed to measure exactly 4 gallons?",
            difficulty="hard",
            correct_answer="2",
            additional_data=json.dumps({"tip": "Fill the 5-gallon, pour into 3-gallon..."})
        )
    ])

    # --- Word Games (Anagrams) ---
    word_cat = category_map["Word Games"]
    challenges.extend([
        Challenge(
            category_id=word_cat.id,
            question_text="Unscramble the letters to find a common word: O P S T",
            difficulty="easy",
            correct_answer="post",
            additional_data=json.dumps({"scrambled": "O P S T", "possible_answers": ["post", "stop", "spot", "tops"]})
        ),
        Challenge(
            category_id=word_cat.id,
            question_text="Unscramble the letters to find a common word: T A S R I T",
            difficulty="medium",
            correct_answer="artist",
            additional_data=json.dumps({"scrambled": "T A S R I T", "possible_answers": ["artist", "strait"]})
        ),
        Challenge(
            category_id=word_cat.id,
            question_text="Unscramble the letters to find a common word: R O P C U T E M",
            difficulty="hard",
            correct_answer="computer",
            additional_data=json.dumps({"scrambled": "R O P C U T E M", "possible_answers": ["computer"]})
        )
    ])

    # --- Riddles ---
    riddle_cat = category_map["Riddles"]
    challenges.extend([
        Challenge(
            category_id=riddle_cat.id,
            question_text="What has a head and a tail but no body?",
            difficulty="easy",
            correct_answer="coin",
            additional_data=None
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="What has keys but can't open locks?",
            difficulty="easy",
            correct_answer="piano",
            additional_data=None
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="What is full of holes but still holds water?",
            difficulty="medium",
            correct_answer="sponge",
            additional_data=None
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="What goes up but never comes down?",
            difficulty="medium",
            correct_answer="age",
            additional_data=None
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="The person who makes it has no need of it; the person who buys it does not use it. The person who uses it can neither see nor feel it. What is it?",
            difficulty="hard",
            correct_answer="coffin",
            additional_data=None
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="What has roots that nobody sees, is taller than trees, up, up it goes, and yet never grows?",
            difficulty="hard",
            correct_answer="mountain",
            additional_data=None
        )
    ])

    # --- Quick Quiz ---
    quiz_cat = category_map["Quick Quiz"]
    challenges.extend([
        Challenge(
            category_id=quiz_cat.id,
            question_text="Which planet is known as the Red Planet?",
            difficulty="easy",
            correct_answer="Mars",
            additional_data=json.dumps({"options": ["Venus", "Mars", "Jupiter", "Saturn"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="What is the capital of France?",
            difficulty="easy",
            correct_answer="Paris",
            additional_data=json.dumps({"options": ["London", "Berlin", "Paris", "Madrid"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="What is the chemical symbol for gold?",
            difficulty="medium",
            correct_answer="Au",
            additional_data=json.dumps({"options": ["Ag", "Au", "Fe", "Cu"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="Who painted the Mona Lisa?",
            difficulty="medium",
            correct_answer="Leonardo da Vinci",
            additional_data=json.dumps({"options": ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="How many brains does an octopus have?",
            difficulty="hard",
            correct_answer="9",
            additional_data=json.dumps({"options": ["1", "3", "8", "9"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="What is the smallest country in the world?",
            difficulty="hard",
            correct_answer="Vatican City",
            additional_data=json.dumps({"options": ["Monaco", "Vatican City", "Liechtenstein", "San Marino"]})
        )
    ])

    for challenge in challenges:
        db.add(challenge)
    db.commit()

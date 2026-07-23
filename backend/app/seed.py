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

    # Clear existing challenges and re-seed to avoid duplicates
    db.query(Challenge).delete()
    db.commit()

    challenges = []

    # --- Logic Puzzles ---
    logic_cat = category_map["Logic Puzzles"]
    challenges.extend([
        # Number sequence
        Challenge(
            category_id=logic_cat.id,
            question_text="Complete the logic sequence: 5, 10, 15, 20, ?",
            difficulty="easy",
            correct_answer="25",
            additional_data=json.dumps({"subtype": "Number sequence", "tip": "Each number increases by 5."})
        ),
        Challenge(
            category_id=logic_cat.id,
            question_text="Complete the logic sequence: 2, 6, 12, 20, 30, ?",
            difficulty="medium",
            correct_answer="42",
            additional_data=json.dumps({"subtype": "Number sequence", "tip": "Differences are 4, 6, 8, 10, 12..."})
        ),
        Challenge(
            category_id=logic_cat.id,
            question_text="Complete the logic sequence: 8, 4, 12, 6, 18, ?",
            difficulty="hard",
            correct_answer="9",
            additional_data=json.dumps({"subtype": "Number sequence", "tip": "Divide by 2, then multiply by 3."})
        ),
        # Odd one out
        Challenge(
            category_id=logic_cat.id,
            question_text="Which of the following is the odd one out? (Apple, Banana, Carrot, Grape)",
            difficulty="easy",
            correct_answer="Carrot",
            additional_data=json.dumps({"subtype": "Odd one out", "options": ["Apple", "Banana", "Carrot", "Grape"], "tip": "Think about which one is a vegetable."})
        ),
        Challenge(
            category_id=logic_cat.id,
            question_text="Which of the following is the odd one out? (Gold, Silver, Iron, Wood)",
            difficulty="medium",
            correct_answer="Wood",
            additional_data=json.dumps({"subtype": "Odd one out", "options": ["Gold", "Silver", "Iron", "Wood"], "tip": "Three are metals."})
        ),
        Challenge(
            category_id=logic_cat.id,
            question_text="Which of the following is the odd one out? (Kangaroo, Platypus, Whale, Ostrich)",
            difficulty="hard",
            correct_answer="Ostrich",
            additional_data=json.dumps({"subtype": "Odd one out", "options": ["Kangaroo", "Platypus", "Whale", "Ostrich"], "tip": "One is a bird, the others are mammals."})
        ),
        # Logical reasoning
        Challenge(
            category_id=logic_cat.id,
            question_text="If A is taller than B, and B is taller than C, who is the shortest? (A, B, C)",
            difficulty="easy",
            correct_answer="C",
            additional_data=json.dumps({"subtype": "Logical reasoning", "options": ["A", "B", "C"]})
        ),
        Challenge(
            category_id=logic_cat.id,
            question_text="A clock shows 3:15. If the clock is rotated 90 degrees counter-clockwise, what number will the minute hand point to? (12, 9, 6, 3)",
            difficulty="medium",
            correct_answer="12",
            additional_data=json.dumps({"subtype": "Logical reasoning", "options": ["12", "9", "6", "3"]})
        ),
        Challenge(
            category_id=logic_cat.id,
            question_text="You have a 3-gallon jug and a 5-gallon jug. How many fills of the 5-gallon jug are needed to measure exactly 4 gallons?",
            difficulty="hard",
            correct_answer="2",
            additional_data=json.dumps({"subtype": "Logical reasoning", "tip": "Think about transferring water between jugs."})
        ),
        # True/False logic
        Challenge(
            category_id=logic_cat.id,
            question_text="True or False: An octagon has 8 sides.",
            difficulty="easy",
            correct_answer="True",
            additional_data=json.dumps({"subtype": "True/False logic", "options": ["True", "False"]})
        ),
        Challenge(
            category_id=logic_cat.id,
            question_text="True or False: If all cats have tails, and Leo is a cat, then Leo must have a tail.",
            difficulty="medium",
            correct_answer="True",
            additional_data=json.dumps({"subtype": "True/False logic", "options": ["True", "False"]})
        ),
        Challenge(
            category_id=logic_cat.id,
            question_text="True or False: In a room of 23 people, it is more likely than not that at least two people share the same birthday.",
            difficulty="hard",
            correct_answer="True",
            additional_data=json.dumps({"subtype": "True/False logic", "options": ["True", "False"]})
        )
    ])

    # --- Word Games ---
    word_cat = category_map["Word Games"]
    challenges.extend([
        # Unscramble words
        Challenge(
            category_id=word_cat.id,
            question_text="Unscramble the letters to find a common word: O P S T",
            difficulty="easy",
            correct_answer="post",
            additional_data=json.dumps({"subtype": "Unscramble words", "scrambled": "O P S T", "possible_answers": ["post", "stop", "spot", "tops"]})
        ),
        Challenge(
            category_id=word_cat.id,
            question_text="Unscramble the letters to find a common word: T A S R I T",
            difficulty="medium",
            correct_answer="artist",
            additional_data=json.dumps({"subtype": "Unscramble words", "scrambled": "T A S R I T", "possible_answers": ["artist", "strait"]})
        ),
        Challenge(
            category_id=word_cat.id,
            question_text="Unscramble the letters to find a common word: R O P C U T E M",
            difficulty="hard",
            correct_answer="computer",
            additional_data=json.dumps({"subtype": "Unscramble words", "scrambled": "R O P C U T E M", "possible_answers": ["computer"]})
        ),
        # Fill in the missing letter
        Challenge(
            category_id=word_cat.id,
            question_text="Fill in the missing letter: d_g (a, o, e, i)",
            difficulty="easy",
            correct_answer="o",
            additional_data=json.dumps({"subtype": "Fill in the missing letter", "options": ["a", "o", "e", "i"]})
        ),
        Challenge(
            category_id=word_cat.id,
            question_text="Fill in the missing letters: b_t_t_r (u-e, i-e, e-e)",
            difficulty="medium",
            correct_answer="u-e",
            additional_data=json.dumps({"subtype": "Fill in the missing letter", "options": ["u-e", "i-e", "e-e"], "possible_answers": ["u-e", "i-e", "u_e", "i_e"]})
        ),
        Challenge(
            category_id=word_cat.id,
            question_text="Fill in the missing letters: p_r_l_y_i_ (a-a-s-s, a-a-s-z, o-a-s-s)",
            difficulty="hard",
            correct_answer="a-a-s-s",
            additional_data=json.dumps({"subtype": "Fill in the missing letter", "options": ["a-a-s-s", "a-a-s-z", "o-a-s-s"], "possible_answers": ["a-a-s-s", "a_a_s_s"]})
        ),
        # Synonym/Antonym
        Challenge(
            category_id=word_cat.id,
            question_text="What is a synonym of 'Happy'? (Sad, Joyful, Angry, Tired)",
            difficulty="easy",
            correct_answer="Joyful",
            additional_data=json.dumps({"subtype": "Synonym/Antonym", "options": ["Sad", "Joyful", "Angry", "Tired"]})
        ),
        Challenge(
            category_id=word_cat.id,
            question_text="What is an antonym of 'Generous'? (Kind, Selfish, Happy, Polite)",
            difficulty="medium",
            correct_answer="Selfish",
            additional_data=json.dumps({"subtype": "Synonym/Antonym", "options": ["Kind", "Selfish", "Happy", "Polite"]})
        ),
        Challenge(
            category_id=word_cat.id,
            question_text="What is a synonym of 'Ephemeral'? (Short-lived, Permanent, Beautiful, Weak)",
            difficulty="hard",
            correct_answer="Short-lived",
            additional_data=json.dumps({"subtype": "Synonym/Antonym", "options": ["Short-lived", "Permanent", "Beautiful", "Weak"]})
        ),
        # Word matching
        Challenge(
            category_id=word_cat.id,
            question_text="Match the description: A fruit that is usually red or green and crunchy. (Banana, Apple, Grape, Orange)",
            difficulty="easy",
            correct_answer="Apple",
            additional_data=json.dumps({"subtype": "Word matching", "options": ["Banana", "Apple", "Grape", "Orange"]})
        ),
        Challenge(
            category_id=word_cat.id,
            question_text="Match the description: A period of ten years. (Century, Decade, Millennium, Fortnight)",
            difficulty="medium",
            correct_answer="Decade",
            additional_data=json.dumps({"subtype": "Word matching", "options": ["Century", "Decade", "Millennium", "Fortnight"]})
        ),
        Challenge(
            category_id=word_cat.id,
            question_text="Match the description: A celestial body that orbits a planet. (Star, Comet, Satellite, Asteroid)",
            difficulty="hard",
            correct_answer="Satellite",
            additional_data=json.dumps({"subtype": "Word matching", "options": ["Star", "Comet", "Satellite", "Asteroid"]})
        )
    ])

    # --- Riddles ---
    riddle_cat = category_map["Riddles"]
    challenges.extend([
        # Easy
        Challenge(
            category_id=riddle_cat.id,
            question_text="What has to be broken before you can use it?",
            difficulty="easy",
            correct_answer="egg",
            additional_data=json.dumps({"subtype": "Easy riddles"})
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="What has a head and a tail but no body?",
            difficulty="easy",
            correct_answer="coin",
            additional_data=json.dumps({"subtype": "Easy riddles"})
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="What has keys but can't open locks?",
            difficulty="easy",
            correct_answer="piano",
            additional_data=json.dumps({"subtype": "Easy riddles"})
        ),
        # Medium
        Challenge(
            category_id=riddle_cat.id,
            question_text="What is full of holes but still holds water?",
            difficulty="medium",
            correct_answer="sponge",
            additional_data=json.dumps({"subtype": "Medium riddles"})
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="What goes up but never comes down?",
            difficulty="medium",
            correct_answer="age",
            additional_data=json.dumps({"subtype": "Medium riddles"})
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="I speak without a mouth and hear without ears. I have no one, but I come alive with wind. What am I?",
            difficulty="medium",
            correct_answer="echo",
            additional_data=json.dumps({"subtype": "Medium riddles"})
        ),
        # Hard
        Challenge(
            category_id=riddle_cat.id,
            question_text="The person who makes it has no need of it; the person who buys it does not use it. The person who uses it can neither see nor feel it. What is it?",
            difficulty="hard",
            correct_answer="coffin",
            additional_data=json.dumps({"subtype": "Hard riddles"})
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="What has roots that nobody sees, is taller than trees, up, up it goes, and yet never grows?",
            difficulty="hard",
            correct_answer="mountain",
            additional_data=json.dumps({"subtype": "Hard riddles"})
        ),
        Challenge(
            category_id=riddle_cat.id,
            question_text="I am clean when I am black, and dirty when I am white. What am I?",
            difficulty="hard",
            correct_answer="blackboard",
            additional_data=json.dumps({"subtype": "Hard riddles", "possible_answers": ["blackboard", "chalkboard"]})
        )
    ])

    # --- Quick Quiz ---
    quiz_cat = category_map["Quick Quiz"]
    challenges.extend([
        # General Knowledge
        Challenge(
            category_id=quiz_cat.id,
            question_text="Which is the largest ocean in the world? (Atlantic, Pacific, Indian, Arctic)",
            difficulty="easy",
            correct_answer="Pacific",
            additional_data=json.dumps({"subtype": "General Knowledge", "options": ["Atlantic", "Pacific", "Indian", "Arctic"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="Who wrote the play 'Romeo and Juliet'? (William Shakespeare, Charles Dickens, Jane Austen, Mark Twain)",
            difficulty="medium",
            correct_answer="William Shakespeare",
            additional_data=json.dumps({"subtype": "General Knowledge", "options": ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="What is the official currency of Japan? (Yuan, Yen, Won, Baht)",
            difficulty="hard",
            correct_answer="Yen",
            additional_data=json.dumps({"subtype": "General Knowledge", "options": ["Yuan", "Yen", "Won", "Baht"]})
        ),
        # Science
        Challenge(
            category_id=quiz_cat.id,
            question_text="What temperature does water boil at in Celsius? (0, 50, 100, 200)",
            difficulty="easy",
            correct_answer="100",
            additional_data=json.dumps({"subtype": "Science", "options": ["0", "50", "100", "200"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="What is the chemical formula for water? (CO2, H2O, O2, NaCl)",
            difficulty="medium",
            correct_answer="H2O",
            additional_data=json.dumps({"subtype": "Science", "options": ["CO2", "H2O", "O2", "NaCl"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="What gas do plants absorb during photosynthesis? (Oxygen, Carbon Dioxide, Nitrogen, Helium)",
            difficulty="hard",
            correct_answer="Carbon Dioxide",
            additional_data=json.dumps({"subtype": "Science", "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"]})
        ),
        # Technology
        Challenge(
            category_id=quiz_cat.id,
            question_text="What does 'PC' stand for? (Personal Computer, Private Caller, Public Computing, Phone Call)",
            difficulty="easy",
            correct_answer="Personal Computer",
            additional_data=json.dumps({"subtype": "Technology", "options": ["Personal Computer", "Private Caller", "Public Computing", "Phone Call"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="Who is the co-founder of Microsoft? (Steve Jobs, Bill Gates, Mark Zuckerberg, Jeff Bezos)",
            difficulty="medium",
            correct_answer="Bill Gates",
            additional_data=json.dumps({"subtype": "Technology", "options": ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Jeff Bezos"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="What was the first commercial programming language? (FORTRAN, COBOL, BASIC, Assembly)",
            difficulty="hard",
            correct_answer="FORTRAN",
            additional_data=json.dumps({"subtype": "Technology", "options": ["FORTRAN", "COBOL", "BASIC", "Assembly"]})
        ),
        # Mathematics
        Challenge(
            category_id=quiz_cat.id,
            question_text="What is 7 times 8? (48, 54, 56, 64)",
            difficulty="easy",
            correct_answer="56",
            additional_data=json.dumps({"subtype": "Mathematics", "options": ["48", "54", "56", "64"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="What is the square root of 144? (10, 11, 12, 13)",
            difficulty="medium",
            correct_answer="12",
            additional_data=json.dumps({"subtype": "Mathematics", "options": ["10", "11", "12", "13"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="What is the value of Pi to two decimal places? (3.12, 3.14, 3.16, 3.18)",
            difficulty="hard",
            correct_answer="3.14",
            additional_data=json.dumps({"subtype": "Mathematics", "options": ["3.12", "3.14", "3.16", "3.18"]})
        ),
        # Daily Life
        Challenge(
            category_id=quiz_cat.id,
            question_text="How many hours are there in a day? (12, 24, 48, 60)",
            difficulty="easy",
            correct_answer="24",
            additional_data=json.dumps({"subtype": "Daily Life", "options": ["12", "24", "48", "60"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="How many teeth does an adult human typically have? (28, 30, 32, 34)",
            difficulty="medium",
            correct_answer="32",
            additional_data=json.dumps({"subtype": "Daily Life", "options": ["28", "30", "32", "34"]})
        ),
        Challenge(
            category_id=quiz_cat.id,
            question_text="Which country eats the most chocolate per capita? (USA, Germany, Switzerland, Belgium)",
            difficulty="hard",
            correct_answer="Switzerland",
            additional_data=json.dumps({"subtype": "Daily Life", "options": ["USA", "Germany", "Switzerland", "Belgium"]})
        )
    ])

    for challenge in challenges:
        db.add(challenge)
    db.commit()

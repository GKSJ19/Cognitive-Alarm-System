import random
def get_cognitive_challenge():
    challenges = [
        {
            "Challenge Type": "Riddle",
            "Question": "What gets wetter the more it dries?",
            "Options": [
                "Soap",
                "Towel",
                "Water",
                "Sponge"
            ],
            "Correct Answer": "Towel"
        },
        {
            "Challenge Type": "Riddle",
            "Question": "What has keys but can't open locks?",
            "Options": [
                "Keyboard",
                "Door",
                "Lock",
                "Book"
            ],
            "Correct Answer": "Keyboard"
        },
        {
            "Challenge Type": "Riddle",
            "Question": "What has one eye but cannot see?",
            "Options": [
                "Needle",
                "Camera",
                "Cyclops",
                "Button"
            ],
            "Correct Answer": "Needle"
        },
        {
            "Challenge Type": "Riddle",
            "Question": "The more you take, the more you leave behind. What am I?",
            "Options": [
                "Footsteps",
                "Money",
                "Water",
                "Time"
            ],
            "Correct Answer": "Footsteps"
        },
        {
            "Challenge Type": "Riddle",
            "Question": "What can travel around the world while staying in one place?",
            "Options": [
                "Stamp",
                "Bird",
                "Sun",
                "Cloud"
            ],
            "Correct Answer": "Stamp"
        }
    ]
    return random.choice(challenges)
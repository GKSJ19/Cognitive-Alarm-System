import random

IMAGE_BANK = {
    "sun": "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=200",
    "moon": "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=200",
    "tree": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200",
    "mountain": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200",
    "ocean": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200",
}

# How many items to remember, scaled by difficulty
LENGTHS = {
    "beginner": 3,
    "easy": 3,
    "medium": 4,
    "hard": 5,
    "expert": 6,
}


def generate(difficulty: str = "medium"):
    length = LENGTHS.get(difficulty, 4)
    subtype = random.choice(["memorize_numbers", "memorize_words", "position_based", "image_sequence"])

    if subtype == "memorize_numbers":
        seq = "".join(str(random.randint(1, 9)) for _ in range(length))
        question = f"Memorize this sequence, then type it back exactly: {seq}"
        answer = seq
    elif subtype == "memorize_words":
        word_bank = ["sun", "moon", "tree", "river", "cloud", "storm", "field", "stone", "flame", "wind"]
        n = min(length, len(word_bank))
        words = random.sample(word_bank, n)
        question = f"Memorize these words in order, then type them back separated by spaces: {' '.join(words)}"
        answer = " ".join(words)
    elif subtype == "position_based":
        letters = [chr(65 + i) for i in range(max(5, length + 2))]
        pos = random.randint(0, len(letters) - 1)
        question = f"In the list {', '.join(letters)}, what is the letter at position {pos + 1} (1-indexed)?"
        answer = letters[pos]
    else:
        names = list(IMAGE_BANK.keys())
        n = min(length, len(names))
        chosen = random.sample(names, n)
        image_urls = [IMAGE_BANK[name] for name in chosen]
        question = f"Memorize this image sequence, then type the names back in order separated by spaces: {' | '.join(image_urls)}"
        answer = " ".join(chosen)
    return question, answer
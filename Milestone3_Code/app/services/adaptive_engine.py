class AdaptiveDifficultyEngine:
    """
    Analyzes previous challenge attempts to adjust difficulty.
    Levels: Beginner, Easy, Medium, Hard, Expert
    """
    LEVELS = ("Beginner", "Easy", "Medium", "Hard", "Expert")

    @classmethod
    def calculate_new_level(cls, current_level: str, success_rate: float) -> str:
        try:
            current_idx = cls.LEVELS.index(current_level)
        except ValueError:
            current_idx = 1 # Default to Easy
        
        # Increase difficulty if success rate is high (>85%)
        if success_rate >= 85.0 and current_idx < len(cls.LEVELS) - 1:
            return cls.LEVELS[current_idx + 1]
        
        # Reduce difficulty if failure rate is high (success < 50%)
        elif success_rate < 50.0 and current_idx > 0:
            return cls.LEVELS[current_idx - 1]
        
        # Maintain difficulty
        return current_level

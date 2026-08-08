
enum ChallengeCategory {
  mathematicalProblems,
  logicPuzzles,
  memoryChallenges,
  wordGames,
  patternRecognition,
  riddles,
  quickQuizzes;


  String get label {
    switch (this) {
      case ChallengeCategory.mathematicalProblems:
        return 'Mathematical Problems';
      case ChallengeCategory.logicPuzzles:
        return 'Logic Puzzles';
      case ChallengeCategory.memoryChallenges:
        return 'Memory Challenges';
      case ChallengeCategory.wordGames:
        return 'Word Games';
      case ChallengeCategory.patternRecognition:
        return 'Pattern Recognition';
      case ChallengeCategory.riddles:
        return 'Riddles';
      case ChallengeCategory.quickQuizzes:
        return 'Quick Quizzes';
    }
  }


  List<String> get subtypes {
    switch (this) {
      case ChallengeCategory.mathematicalProblems:
        return ['Arithmetic operations', 'Percentages', 'Algebraic expressions'];
      case ChallengeCategory.logicPuzzles:
        return ['Number patterns', 'Logical reasoning', 'Missing element puzzles'];
      case ChallengeCategory.memoryChallenges:
        return ['Memorize words or numbers', 'Image sequence recall', 'Position-based memory tests'];
      case ChallengeCategory.wordGames:
        return ['Unscramble words', 'Synonyms', 'Antonyms', 'Vocabulary completion'];
      case ChallengeCategory.patternRecognition:
        return ['Shape sequences', 'Color patterns', 'Number progression'];
      case ChallengeCategory.riddles:
        return ['Short reasoning questions', 'Everyday logic riddles'];
      case ChallengeCategory.quickQuizzes:
        return ['General knowledge', 'Science'];
    }
  }


  String get storageKey => name;

  static ChallengeCategory fromStorageKey(String key) {
    return ChallengeCategory.values.firstWhere(
          (c) => c.storageKey == key,
      orElse: () => ChallengeCategory.mathematicalProblems,
    );
  }
}
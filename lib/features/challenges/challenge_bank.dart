import 'dart:math';

import 'challenge_category.dart';
import 'challenge_question.dart';

class ChallengeBank {
  ChallengeBank._();

  static final Random _rand = Random();


  static ChallengeQuestion getRandom(ChallengeCategory category) {
    if (category == ChallengeCategory.mathematicalProblems) {
      return _generateArithmetic();
    }
    final pool = _staticBank[category]!;
    return pool[_rand.nextInt(pool.length)];
  }

  static ChallengeCategory resolveCategoryFromChallengeType(String raw) {
    final byStorageKey = ChallengeCategory.values
        .where((c) => c.storageKey == raw)
        .toList();
    if (byStorageKey.isNotEmpty) return byStorageKey.first;
    return fromLegacyChallengeType(raw);
  }

  static ChallengeCategory fromLegacyChallengeType(String legacy) {
    switch (legacy) {
      case 'Math':
        return ChallengeCategory.mathematicalProblems;
      case 'Memory':
        return ChallengeCategory.memoryChallenges;
      case 'Riddle':
        return ChallengeCategory.riddles;
      default:
        return ChallengeCategory.mathematicalProblems;
    }
  }

  static ChallengeQuestion _generateArithmetic() {
    final ops = ['+', '-', '×'];
    final op = ops[_rand.nextInt(ops.length)];
    int a = _rand.nextInt(50) + 1;
    int b = _rand.nextInt(50) + 1;
    int answer;
    switch (op) {
      case '+':
        answer = a + b;
        break;
      case '-':
        if (b > a) {
          final tmp = a;
          a = b;
          b = tmp;
        }
        answer = a - b;
        break;
      default: // ×
        a = _rand.nextInt(12) + 1;
        b = _rand.nextInt(12) + 1;
        answer = a * b;
    }
    return ChallengeQuestion(
      id: 'math_${DateTime.now().microsecondsSinceEpoch}',
      category: ChallengeCategory.mathematicalProblems,
      subtype: 'Arithmetic operations',
      answerType: ChallengeAnswerType.freeText,
      prompt: '$a $op $b = ?',
      correctAnswers: [answer.toString()],
    );
  }

  static final Map<ChallengeCategory, List<ChallengeQuestion>> _staticBank = {
    ChallengeCategory.logicPuzzles: [
      const ChallengeQuestion(
        id: 'logic_1',
        category: ChallengeCategory.logicPuzzles,
        subtype: 'Number patterns',
        answerType: ChallengeAnswerType.freeText,
        prompt: 'What comes next: 2, 4, 8, 16, ?',
        correctAnswers: ['32'],
      ),
      const ChallengeQuestion(
        id: 'logic_2',
        category: ChallengeCategory.logicPuzzles,
        subtype: 'Missing element puzzles',
        answerType: ChallengeAnswerType.multipleChoice,
        prompt: 'Which shape completes the set: circle, square, circle, square, ?',
        choices: ['Circle', 'Triangle', 'Square', 'Pentagon'],
        correctAnswers: ['Circle'],
      ),
      const ChallengeQuestion(
        id: 'logic_3',
        category: ChallengeCategory.logicPuzzles,
        subtype: 'Logical reasoning',
        answerType: ChallengeAnswerType.multipleChoice,
        prompt: 'If all Zips are Zaps, and all Zaps are Zops, are all Zips Zops?',
        choices: ['Yes', 'No', 'Not enough info'],
        correctAnswers: ['Yes'],
      ),
      const ChallengeQuestion(
        id: 'logic_4',
        category: ChallengeCategory.logicPuzzles,
        subtype: 'Number patterns',
        answerType: ChallengeAnswerType.freeText,
        prompt: 'What comes next: 1, 1, 2, 3, 5, 8, ?',
        correctAnswers: ['13'],
      ),
    ],
    ChallengeCategory.memoryChallenges: [
      const ChallengeQuestion(
        id: 'memory_1',
        category: ChallengeCategory.memoryChallenges,
        subtype: 'Memorize words or numbers',
        answerType: ChallengeAnswerType.memoryRecall,
        prompt: 'Remember this sequence, in order.',
        correctAnswers: ['7', '2', '9', '4'],
        studyDuration: Duration(seconds: 4),
      ),
      const ChallengeQuestion(
        id: 'memory_2',
        category: ChallengeCategory.memoryChallenges,
        subtype: 'Memorize words or numbers',
        answerType: ChallengeAnswerType.memoryRecall,
        prompt: 'Remember this sequence, in order.',
        correctAnswers: ['Kite', 'Lamp', 'River', 'Chair'],
        studyDuration: Duration(seconds: 5),
      ),
      const ChallengeQuestion(
        id: 'memory_3',
        category: ChallengeCategory.memoryChallenges,
        subtype: 'Position-based memory tests',
        answerType: ChallengeAnswerType.memoryRecall,
        prompt: 'Remember which position each color appeared in (top-left, top-right, bottom-left, bottom-right).',
        correctAnswers: ['Red', 'Blue', 'Green', 'Yellow'],
        studyDuration: Duration(seconds: 4),
      ),
    ],
    ChallengeCategory.wordGames: [
      const ChallengeQuestion(
        id: 'word_1',
        category: ChallengeCategory.wordGames,
        subtype: 'Unscramble words',
        answerType: ChallengeAnswerType.freeText,
        prompt: 'Unscramble: TSMORNIG',
        correctAnswers: ['MORNINGS', 'MORNINGST'],
      ),
      const ChallengeQuestion(
        id: 'word_2',
        category: ChallengeCategory.wordGames,
        subtype: 'Synonyms',
        answerType: ChallengeAnswerType.multipleChoice,
        prompt: 'Which word means the same as "happy"?',
        choices: ['Joyful', 'Angry', 'Tired', 'Distant'],
        correctAnswers: ['Joyful'],
      ),
      const ChallengeQuestion(
        id: 'word_3',
        category: ChallengeCategory.wordGames,
        subtype: 'Antonyms',
        answerType: ChallengeAnswerType.multipleChoice,
        prompt: 'Which word is the opposite of "ancient"?',
        choices: ['Modern', 'Old', 'Historic', 'Faded'],
        correctAnswers: ['Modern'],
      ),
      const ChallengeQuestion(
        id: 'word_4',
        category: ChallengeCategory.wordGames,
        subtype: 'Vocabulary completion',
        answerType: ChallengeAnswerType.freeText,
        prompt: 'Complete the word: AL_RM',
        correctAnswers: ['ALARM'],
      ),
    ],
    ChallengeCategory.patternRecognition: [
      const ChallengeQuestion(
        id: 'pattern_1',
        category: ChallengeCategory.patternRecognition,
        subtype: 'Number progression',
        answerType: ChallengeAnswerType.freeText,
        prompt: 'What comes next: 3, 6, 12, 24, ?',
        correctAnswers: ['48'],
      ),
      const ChallengeQuestion(
        id: 'pattern_2',
        category: ChallengeCategory.patternRecognition,
        subtype: 'Color patterns',
        answerType: ChallengeAnswerType.multipleChoice,
        prompt: 'Pattern: red, red, blue, red, red, blue, ? — what comes next?',
        choices: ['Red', 'Blue', 'Green', 'Yellow'],
        correctAnswers: ['Red'],
      ),
      const ChallengeQuestion(
        id: 'pattern_3',
        category: ChallengeCategory.patternRecognition,
        subtype: 'Shape sequences',
        answerType: ChallengeAnswerType.multipleChoice,
        prompt: 'Sequence: triangle, square, pentagon, hexagon, ? — how many sides next?',
        choices: ['7', '6', '5', '8'],
        correctAnswers: ['7'],
      ),
    ],
    ChallengeCategory.riddles: [
      const ChallengeQuestion(
        id: 'riddle_1',
        category: ChallengeCategory.riddles,
        subtype: 'Everyday logic riddles',
        answerType: ChallengeAnswerType.freeText,
        prompt: 'The more you take, the more you leave behind. What are they?',
        correctAnswers: ['FOOTSTEPS', 'STEPS'],
      ),
      const ChallengeQuestion(
        id: 'riddle_2',
        category: ChallengeCategory.riddles,
        subtype: 'Short reasoning questions',
        answerType: ChallengeAnswerType.freeText,
        prompt: 'What has hands but cannot clap?',
        correctAnswers: ['CLOCK', 'A CLOCK'],
      ),
      const ChallengeQuestion(
        id: 'riddle_3',
        category: ChallengeCategory.riddles,
        subtype: 'Everyday logic riddles',
        answerType: ChallengeAnswerType.freeText,
        prompt: 'What gets wetter the more it dries?',
        correctAnswers: ['TOWEL', 'A TOWEL'],
      ),
    ],
    ChallengeCategory.quickQuizzes: [
      const ChallengeQuestion(
        id: 'quiz_1',
        category: ChallengeCategory.quickQuizzes,
        subtype: 'General knowledge',
        answerType: ChallengeAnswerType.multipleChoice,
        prompt: 'What is the capital of Japan?',
        choices: ['Tokyo', 'Seoul', 'Beijing', 'Bangkok'],
        correctAnswers: ['Tokyo'],
      ),
      const ChallengeQuestion(
        id: 'quiz_2',
        category: ChallengeCategory.quickQuizzes,
        subtype: 'Science',
        answerType: ChallengeAnswerType.multipleChoice,
        prompt: 'What planet is known as the Red Planet?',
        choices: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
        correctAnswers: ['Mars'],
      ),
      const ChallengeQuestion(
        id: 'quiz_3',
        category: ChallengeCategory.quickQuizzes,
        subtype: 'Science',
        answerType: ChallengeAnswerType.multipleChoice,
        prompt: 'How many bones are in the adult human body?',
        choices: ['206', '186', '226', '150'],
        correctAnswers: ['206'],
      ),
    ],
  };
}
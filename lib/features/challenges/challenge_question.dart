import 'challenge_category.dart';

enum ChallengeAnswerType {
  multipleChoice,
  freeText,
  memoryRecall,
}

class ChallengeQuestion {
  final String id;
  final ChallengeCategory category;
  final String subtype;
  final ChallengeAnswerType answerType;
  final String prompt;


  final List<String>? choices;


  final List<String> correctAnswers;


  final Duration? studyDuration;

  const ChallengeQuestion({
    required this.id,
    required this.category,
    required this.subtype,
    required this.answerType,
    required this.prompt,
    required this.correctAnswers,
    this.choices,
    this.studyDuration,
  });

  bool checkAnswer(List<String> given) {
    if (answerType == ChallengeAnswerType.freeText) {
      if (given.isEmpty) return false;
      final normalized = given.first.trim().toLowerCase();
      return correctAnswers.any((a) => a.trim().toLowerCase() == normalized);
    }

    if (given.length != correctAnswers.length) return false;
    for (var i = 0; i < given.length; i++) {
      if (given[i].trim().toLowerCase() != correctAnswers[i].trim().toLowerCase()) {
        return false;
      }
    }
    return true;
  }
}
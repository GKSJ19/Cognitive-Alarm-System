// lib/models/challenge_models.dart
//
// Wire-format models matching Tejaswa's milestone2 backend
// (app/models/challenge.py, app/models/verification.py).

class ChallengeModel {
  final String id;
  final String type; // Math, Logic, Memory, Pattern, Word, Riddle, Quiz
  final String difficulty; // Beginner, Easy, Medium, Hard, Expert
  final Map<String, dynamic> content; // shape varies per challenge type
  final int timeLimitSeconds;
  final int points;

  ChallengeModel({
    required this.id,
    required this.type,
    required this.difficulty,
    required this.content,
    required this.timeLimitSeconds,
    required this.points,
  });

  factory ChallengeModel.fromJson(Map<String, dynamic> json) {
    return ChallengeModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      type: json['type'] as String? ?? '',
      difficulty: json['difficulty'] as String? ?? 'Medium',
      content: (json['content'] as Map?)?.cast<String, dynamic>() ?? const {},
      timeLimitSeconds: json['time_limit_seconds'] as int? ?? 60,
      points: json['points'] as int? ?? 10,
    );
  }
}

class ChallengeAttemptResult {
  final String id;
  final String challengeId;
  final bool isCorrect;
  final double score;
  final double timeTakenSeconds;

  ChallengeAttemptResult({
    required this.id,
    required this.challengeId,
    required this.isCorrect,
    required this.score,
    required this.timeTakenSeconds,
  });

  factory ChallengeAttemptResult.fromJson(Map<String, dynamic> json) {
    return ChallengeAttemptResult(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      challengeId: json['challenge_id'] as String? ?? '',
      isCorrect: json['is_correct'] as bool? ?? false,
      score: (json['score'] as num?)?.toDouble() ?? 0.0,
      timeTakenSeconds: (json['time_taken_seconds'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class VerificationSession {
  final String id;
  final String userId;
  final String alarmId;
  final String alarmLogId;
  final String status; // pending, passed, failed
  final String method;
  final int requiredCorrectAnswers;
  final int currentCorrectAnswers;
  final List<String> challengesAttempted;

  VerificationSession({
    required this.id,
    required this.userId,
    required this.alarmId,
    required this.alarmLogId,
    required this.status,
    required this.method,
    required this.requiredCorrectAnswers,
    required this.currentCorrectAnswers,
    required this.challengesAttempted,
  });

  bool get isPassed => status == 'passed';

  factory VerificationSession.fromJson(Map<String, dynamic> json) {
    return VerificationSession(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      userId: json['user_id'] as String? ?? '',
      alarmId: json['alarm_id'] as String? ?? '',
      alarmLogId: json['alarm_log_id'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      method: json['method'] as String? ?? '',
      requiredCorrectAnswers: json['required_correct_answers'] as int? ?? 1,
      currentCorrectAnswers: json['current_correct_answers'] as int? ?? 0,
      challengesAttempted:
      (json['challenges_attempted'] as List?)?.cast<String>() ?? const [],
    );
  }
}
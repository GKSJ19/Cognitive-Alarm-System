

import '../core/network/api_client.dart';
import '../models/challenge_models.dart';

class VerificationRepository {
  VerificationRepository(this._client);
  final ApiClient _client;


  Future<VerificationSession> startVerification({
    required String alarmId,
    required String alarmLogId,
    required String difficulty,
  }) async {
    final data = await _client.post(
      '/v1/verification/start',
      data: {
        'alarm_id': alarmId,
        'alarm_log_id': alarmLogId,
        'difficulty': difficulty,
      },
    );
    return VerificationSession.fromJson(data);
  }


  Future<VerificationSession> validateVerification({
    required String verificationId,
    required String challengeAttemptId,
    required bool isCorrect,
  }) async {
    final data = await _client.post(
      '/v1/verification/validate',
      data: {
        'verification_id': verificationId,
        'challenge_attempt_id': challengeAttemptId,
        'is_correct': isCorrect,
      },
    );
    return VerificationSession.fromJson(data);
  }

  Future<VerificationSession> getStatus(String verificationId) async {
    final path = Uri(
      path: '/v1/verification/status',
      queryParameters: {'verification_id': verificationId},
    ).toString();
    final data = await _client.get(path);
    return VerificationSession.fromJson(data);
  }
}
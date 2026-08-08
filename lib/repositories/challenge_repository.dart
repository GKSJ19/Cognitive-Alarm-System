// lib/repositories/challenge_repository.dart
//
// Calls Tejaswa's milestone2 /challenges endpoints. Deliberately
// online-only for now (per team decision) — no offline fallback to
// the local ChallengeBank yet. If the backend is unreachable, calls
// throw ApiException/NetworkException/etc. straight through to the
// caller (see core/errors/network_exceptions.dart).

import '../core/network/api_client.dart';
import '../models/challenge_models.dart';

class ChallengeRepository {
  ChallengeRepository(this._client);
  final ApiClient _client;

  /// Generate a new challenge from the backend. [previousType] lets the
  /// engine avoid repeating the same challenge type consecutively.
  ///
  /// The backend endpoint declares difficulty/previous_type as plain
  /// function params (not a Pydantic body), so FastAPI reads them as
  /// query params, not JSON body fields. ApiClient.post() (as seen in
  /// api_client.dart) only takes a `data` body, not queryParameters,
  /// so the query string is built into the path here instead of
  /// depending on a signature that may not exist.
  Future<ChallengeModel> generateChallenge({
    required String difficulty,
    String? previousType,
  }) async {
    final query = <String, String>{
      'difficulty': difficulty,
      if (previousType != null) 'previous_type': previousType,
    };
    final path = Uri(
      path: '/v1/challenges/generate',
      queryParameters: query,
    ).toString();

    final data = await _client.post(path);
    return ChallengeModel.fromJson(data);
  }

  /// Submit an answer for a previously generated challenge.
  Future<ChallengeAttemptResult> submitChallenge({
    required String challengeId,
    required String alarmLogId,
    required String userAnswer,
    required double timeTakenSeconds,
    String? alarmId,
    int attemptNumber = 1,
  }) async {
    final data = await _client.post(
      '/v1/challenges/submit',
      data: {
        'challenge_id': challengeId,
        'alarm_log_id': alarmLogId,
        if (alarmId != null) 'alarm_id': alarmId,
        'user_answer': userAnswer,
        'time_taken_seconds': timeTakenSeconds,
        'attempt_number': attemptNumber,
      },
    );
    return ChallengeAttemptResult.fromJson(data);
  }
}
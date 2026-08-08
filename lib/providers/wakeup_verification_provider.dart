// lib/providers/wakeup_verification_provider.dart
//
// Replaces the fully-local ChallengeAttemptNotifier flow with a
// backend-driven one for the actual alarm-dismissal path. The old
// challenge_provider.dart (ChallengeBank-based, local answer checking)
// is left untouched — this is a new, separate provider. Migrate the
// alarm-ringing screen to use this one instead once it's wired up.
//
// Online-only for now, per team decision: if the backend is
// unreachable, the notifier surfaces an error state and does not fall
// back to local challenges. Offline handling is deferred.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/errors/network_exceptions.dart';
import '../models/challenge_models.dart';
import '../providers/core_providers.dart';
import '../repositories/challenge_repository.dart';
import '../repositories/verification_repository.dart';

final challengeRepositoryProvider = Provider<ChallengeRepository>((ref) {
  return ChallengeRepository(ref.watch(apiClientProvider));
});

final verificationRepositoryProvider = Provider<VerificationRepository>((ref) {
  return VerificationRepository(ref.watch(apiClientProvider));
});

enum WakeUpPhase {
  starting, // POSTing /verification/start
  generatingChallenge,
  awaitingAnswer,
  submitting, // POSTing /challenges/submit + /verification/validate
  passed, // verification.status == "passed"
  failed, // consecutive streak was broken (shown before regenerating)
  error, // network/backend error — see errorMessage
}

class WakeUpVerificationState {
  final WakeUpPhase phase;
  final VerificationSession? session;
  final ChallengeModel? currentChallenge;
  final String? errorMessage;

  const WakeUpVerificationState({
    this.phase = WakeUpPhase.starting,
    this.session,
    this.currentChallenge,
    this.errorMessage,
  });

  WakeUpVerificationState copyWith({
    WakeUpPhase? phase,
    VerificationSession? session,
    ChallengeModel? currentChallenge,
    String? errorMessage,
  }) {
    return WakeUpVerificationState(
      phase: phase ?? this.phase,
      session: session ?? this.session,
      currentChallenge: currentChallenge ?? this.currentChallenge,
      errorMessage: errorMessage,
    );
  }
}

/// Params needed to start a verification session for a given alarm firing.
class WakeUpParams {
  final String alarmId;
  final String alarmLogId; // see KNOWN GAP note in VerificationRepository
  final String difficulty;

  const WakeUpParams({
    required this.alarmId,
    required this.alarmLogId,
    required this.difficulty,
  });
}

class WakeUpVerificationNotifier extends StateNotifier<WakeUpVerificationState> {
  WakeUpVerificationNotifier(this._challengeRepo, this._verificationRepo, this._params)
      : super(const WakeUpVerificationState()) {
    _start();
  }

  final ChallengeRepository _challengeRepo;
  final VerificationRepository _verificationRepo;
  final WakeUpParams _params;

  String? _lastChallengeType;
  String? _lastAttemptId; // id returned by /challenges/submit

  Future<void> _start() async {
    state = state.copyWith(phase: WakeUpPhase.starting, errorMessage: null);
    try {
      final session = await _verificationRepo.startVerification(
        alarmId: _params.alarmId,
        alarmLogId: _params.alarmLogId,
        difficulty: _params.difficulty,
      );
      state = state.copyWith(session: session);
      await _loadNextChallenge();
    } catch (e) {
      state = state.copyWith(phase: WakeUpPhase.error, errorMessage: _describe(e));
    }
  }

  Future<void> _loadNextChallenge() async {
    state = state.copyWith(phase: WakeUpPhase.generatingChallenge, errorMessage: null);
    try {
      final challenge = await _challengeRepo.generateChallenge(
        difficulty: _params.difficulty,
        previousType: _lastChallengeType,
      );
      _lastChallengeType = challenge.type;
      state = state.copyWith(
        phase: WakeUpPhase.awaitingAnswer,
        currentChallenge: challenge,
      );
    } catch (e) {
      state = state.copyWith(phase: WakeUpPhase.error, errorMessage: _describe(e));
    }
  }

  /// Call when the user submits an answer to the current challenge.
  /// [timeTakenSeconds] should be measured by the UI (time between the
  /// challenge being shown and the answer being submitted).
  Future<void> submitAnswer(String userAnswer, double timeTakenSeconds) async {
    final challenge = state.currentChallenge;
    final session = state.session;
    if (challenge == null || session == null) return;

    state = state.copyWith(phase: WakeUpPhase.submitting, errorMessage: null);
    try {
      final attempt = await _challengeRepo.submitChallenge(
        challengeId: challenge.id,
        alarmLogId: _params.alarmLogId,
        alarmId: _params.alarmId,
        userAnswer: userAnswer,
        timeTakenSeconds: timeTakenSeconds,
      );
      _lastAttemptId = attempt.id;

      final updatedSession = await _verificationRepo.validateVerification(
        verificationId: session.id,
        challengeAttemptId: attempt.id,
        isCorrect: attempt.isCorrect,
      );
      state = state.copyWith(session: updatedSession);

      if (updatedSession.isPassed) {
        state = state.copyWith(phase: WakeUpPhase.passed);
        return;
      }

      if (!attempt.isCorrect) {
        // Streak reset — briefly show "failed" for this attempt, then
        // move to the next challenge. UI can use this phase to show a
        // "not quite, try again" message before the next question loads.
        state = state.copyWith(phase: WakeUpPhase.failed);
      }

      await _loadNextChallenge();
    } catch (e) {
      state = state.copyWith(phase: WakeUpPhase.error, errorMessage: _describe(e));
    }
  }

  String _describe(Object e) {
    if (e is ApiTimeoutException) return e.message;
    if (e is NetworkException) return e.message;
    if (e is UnauthorizedException) return e.message;
    if (e is ServerException) return e.message;
    if (e is ApiException) return e.message;
    return 'Something went wrong. Please try again.';
  }
}

final wakeUpVerificationProvider = StateNotifierProvider.autoDispose
    .family<WakeUpVerificationNotifier, WakeUpVerificationState, WakeUpParams>(
      (ref, params) {
    return WakeUpVerificationNotifier(
      ref.watch(challengeRepositoryProvider),
      ref.watch(verificationRepositoryProvider),
      params,
    );
  },
);
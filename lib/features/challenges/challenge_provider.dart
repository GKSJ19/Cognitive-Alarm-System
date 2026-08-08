import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'challenge_bank.dart';
import 'challenge_category.dart';
import 'challenge_question.dart';

enum ChallengeStatus { answering, correct, incorrect }

class ChallengeAttemptState {
  final ChallengeQuestion question;
  final ChallengeStatus status;
  final int attempts;


  final bool showRecallInput;

  const ChallengeAttemptState({
    required this.question,
    this.status = ChallengeStatus.answering,
    this.attempts = 0,
    this.showRecallInput = false,
  });

  ChallengeAttemptState copyWith({
    ChallengeQuestion? question,
    ChallengeStatus? status,
    int? attempts,
    bool? showRecallInput,
  }) {
    return ChallengeAttemptState(
      question: question ?? this.question,
      status: status ?? this.status,
      attempts: attempts ?? this.attempts,
      showRecallInput: showRecallInput ?? this.showRecallInput,
    );
  }
}

class ChallengeAttemptNotifier extends StateNotifier<ChallengeAttemptState> {
  final ChallengeCategory category;

  ChallengeAttemptNotifier(this.category)
      : super(ChallengeAttemptState(question: ChallengeBank.getRandom(category)));


  void revealRecallInput() {
    if (state.status != ChallengeStatus.answering) return;
    state = state.copyWith(showRecallInput: true);
  }

  void submit(List<String> given) {
    final isCorrect = state.question.checkAnswer(given);
    state = state.copyWith(
      status: isCorrect ? ChallengeStatus.correct : ChallengeStatus.incorrect,
      attempts: state.attempts + 1,
    );
  }


  void retrySameQuestion() {
    state = state.copyWith(status: ChallengeStatus.answering);
  }


  void nextQuestion() {
    state = ChallengeAttemptState(question: ChallengeBank.getRandom(category));
  }
}

final challengeAttemptProvider = StateNotifierProvider.autoDispose
    .family<ChallengeAttemptNotifier, ChallengeAttemptState, ChallengeCategory>(
      (ref, category) => ChallengeAttemptNotifier(category),
);

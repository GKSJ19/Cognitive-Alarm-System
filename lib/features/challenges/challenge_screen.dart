import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';
import 'challenge_category.dart';
import 'challenge_question.dart';
import 'challenge_provider.dart';
import 'challenge_result_screen.dart';


class ChallengeScreen extends ConsumerWidget {
  final ChallengeCategory category;
  final String alarmId;

  const ChallengeScreen({
    super.key,
    required this.category,
    required this.alarmId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(challengeAttemptProvider(category));
    final notifier = ref.read(challengeAttemptProvider(category).notifier);

    ref.listen(challengeAttemptProvider(category), (previous, next) {
      if (next.status == ChallengeStatus.correct) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => ChallengeResultScreen(
              alarmId: alarmId,
              category: category,
              attempts: next.attempts,
            ),
          ),
        );
      }
    });

    return PopScope(
      canPop: false,
      child: Scaffold(
        appBar: AppBar(
          title: Text(category.label),
          automaticallyImplyLeading: false,
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (state.attempts > 0 && state.status == ChallengeStatus.incorrect)
                  Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.error_outline, color: Colors.red),
                        SizedBox(width: 10),
                        Expanded(child: Text('Not quite — try again.')),
                      ],
                    ),
                  ),
                Text(
                  state.question.subtype,
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600, letterSpacing: 1.1),
                ),
                const SizedBox(height: 8),
                Text(
                  state.question.prompt,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 30),
                Expanded(
                  child: _ChallengeInput(
                    key: ValueKey(state.question.id),
                    state: state,
                    notifier: notifier,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}


class _ChallengeInput extends StatelessWidget {
  final ChallengeAttemptState state;
  final ChallengeAttemptNotifier notifier;

  const _ChallengeInput({super.key, required this.state, required this.notifier});

  @override
  Widget build(BuildContext context) {
    switch (state.question.answerType) {
      case ChallengeAnswerType.multipleChoice:
        return _MultipleChoiceInput(question: state.question, notifier: notifier);
      case ChallengeAnswerType.freeText:
        return _FreeTextInput(notifier: notifier);
      case ChallengeAnswerType.memoryRecall:
        return _MemoryRecallInput(state: state, notifier: notifier);
    }
  }
}

class _MultipleChoiceInput extends StatelessWidget {
  final ChallengeQuestion question;
  final ChallengeAttemptNotifier notifier;

  const _MultipleChoiceInput({required this.question, required this.notifier});

  @override
  Widget build(BuildContext context) {
    final choices = question.choices ?? const [];
    return ListView.separated(
      itemCount: choices.length,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final choice = choices[index];
        return SizedBox(
          height: 54,
          child: OutlinedButton(
            onPressed: () => notifier.submit([choice]),
            child: Text(choice, style: const TextStyle(fontSize: 16)),
          ),
        );
      },
    );
  }
}

class _FreeTextInput extends StatefulWidget {
  final ChallengeAttemptNotifier notifier;

  const _FreeTextInput({required this.notifier});

  @override
  State<_FreeTextInput> createState() => _FreeTextInputState();
}

class _FreeTextInputState extends State<_FreeTextInput> {
  final controller = TextEditingController();

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: controller,
          autofocus: true,
          textInputAction: TextInputAction.done,
          decoration: const InputDecoration(
            labelText: 'Your answer',
            border: OutlineInputBorder(),
          ),
          onSubmitted: (_) => widget.notifier.submit([controller.text]),
        ),
        const SizedBox(height: 20),
        SizedBox(
          height: 50,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: NueraColors.indigo),
            onPressed: () => widget.notifier.submit([controller.text]),
            child: const Text('Submit', style: TextStyle(fontSize: 16)),
          ),
        ),
      ],
    );
  }
}

class _MemoryRecallInput extends StatefulWidget {
  final ChallengeAttemptState state;
  final ChallengeAttemptNotifier notifier;

  const _MemoryRecallInput({required this.state, required this.notifier});

  @override
  State<_MemoryRecallInput> createState() => _MemoryRecallInputState();
}

class _MemoryRecallInputState extends State<_MemoryRecallInput> {
  late List<TextEditingController> controllers;

  @override
  void initState() {
    super.initState();
    controllers = List.generate(
      widget.state.question.correctAnswers.length,
          (_) => TextEditingController(),
    );
    final duration = widget.state.question.studyDuration ?? const Duration(seconds: 4);
    Future.delayed(duration, () {
      if (mounted) widget.notifier.revealRecallInput();
    });
  }

  @override
  void dispose() {
    for (final c in controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.state.showRecallInput) {
      // Study phase — show the sequence to memorize.
      return Center(
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          alignment: WrapAlignment.center,
          children: widget.state.question.correctAnswers
              .map(
                (item) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: BoxDecoration(
                color: NueraColors.indigo.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(item, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
            ),
          )
              .toList(),
        ),
      );
    }

    // Recall phase — one field per item, in order.
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Enter them back in order:',
          style: TextStyle(color: Colors.grey.shade600),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: ListView.separated(
            itemCount: controllers.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) => TextField(
              controller: controllers[index],
              decoration: InputDecoration(
                labelText: 'Item ${index + 1}',
                border: const OutlineInputBorder(),
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          height: 50,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: NueraColors.indigo),
            onPressed: () => widget.notifier.submit(controllers.map((c) => c.text).toList()),
            child: const Text('Submit', style: TextStyle(fontSize: 16)),
          ),
        ),
      ],
    );
  }
}

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';

/// Full-screen, non-dismissible-by-back-gesture puzzle screen shown while
/// an alarm is ringing. Pops itself once the puzzle is solved.
class AlarmRingScreen extends StatefulWidget {
  const AlarmRingScreen({super.key});

  @override
  State<AlarmRingScreen> createState() => _AlarmRingScreenState();
}

class _AlarmRingScreenState extends State<AlarmRingScreen> {
  final _answerController = TextEditingController();
  List<int> _litSequence = [];
  bool _showingSequence = true;
  Timer? _playbackTimer;

  @override
  void initState() {
    super.initState();
    _maybeStartMemoryPlayback();
  }

  @override
  void didUpdateWidget(covariant AlarmRingScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    _maybeStartMemoryPlayback();
  }

  void _maybeStartMemoryPlayback() {
    final session = context.read<AppState>().activeSession;
    if (session == null || session.currentKind != PuzzleKind.memory) return;
    _playbackTimer?.cancel();
    _showingSequence = true;
    _litSequence = [];
    int i = 0;
    _playbackTimer = Timer.periodic(const Duration(milliseconds: 550), (timer) {
      if (i < session.memorySequence.length) {
        setState(() => _litSequence = [session.memorySequence[i]]);
        i++;
      } else {
        timer.cancel();
        setState(() {
          _litSequence = [];
          _showingSequence = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _playbackTimer?.cancel();
    _answerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final session = app.activeSession;

    // Puzzle was solved elsewhere (or session cleared) -> close this screen.
    if (session == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (Navigator.of(context).canPop()) Navigator.of(context).pop();
      });
      return const SizedBox.shrink();
    }

    return PopScope(
      canPop: false, // alarm cannot be dismissed by back gesture — must solve the puzzle
      child: Scaffold(
        backgroundColor: AppColors.overlayBg,
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'ALARM RINGING — SOLVE TO DISMISS',
                    style: AppTextStyles.mono(size: 12, color: AppColors.violet).copyWith(letterSpacing: 1.6),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${app.now.hour.toString().padLeft(2, '0')}:${app.now.minute.toString().padLeft(2, '0')}',
                    style: AppTextStyles.mono(size: 44),
                  ),
                  const SizedBox(height: 24),
                  Container(
                    width: double.infinity,
                    constraints: const BoxConstraints(maxWidth: 400),
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.bgElev,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.violetDim),
                    ),
                    child: session.currentKind == PuzzleKind.math
                        ? _mathPuzzle(app, session)
                        : _memoryPuzzle(app, session),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _tag(String label) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(color: AppColors.violetDim, borderRadius: BorderRadius.circular(100)),
        child: Text(label.toUpperCase(), style: AppTextStyles.mono(size: 10, color: AppColors.violet).copyWith(letterSpacing: 1)),
      );

  Widget _diffDots(int difficulty) => Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(
          5,
          (i) => Container(
            margin: const EdgeInsets.only(right: 5),
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: i < difficulty ? AppColors.violet : AppColors.line,
            ),
          ),
        ),
      );

  Widget _wrongCount(int n) => Padding(
        padding: const EdgeInsets.only(top: 14),
        child: Center(
          child: Text(
            '$n wrong attempt${n == 1 ? '' : 's'} this alarm',
            style: AppTextStyles.mono(size: 11, color: AppColors.textDim),
          ),
        ),
      );

  Widget _mathPuzzle(AppState app, PuzzleSession session) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [_tag('Math'), _diffDots(session.difficulty)]),
        const SizedBox(height: 14),
        Center(
          child: Text(
            '${session.currentMathQuestion} = ?',
            style: AppTextStyles.display(size: 28, color: Colors.white),
          ),
        ),
        const SizedBox(height: 22),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _answerController,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                style: AppTextStyles.mono(size: 18),
                decoration: const InputDecoration(hintText: 'answer'),
                onSubmitted: (_) => _submitMath(app),
              ),
            ),
            const SizedBox(width: 10),
            ElevatedButton(
              onPressed: () => _submitMath(app),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.mint,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: Text('Solve', style: AppTextStyles.body(size: 14, weight: FontWeight.w600, color: const Color(0xFF062018))),
            ),
          ],
        ),
        _wrongCount(session.wrongAttempts),
      ],
    );
  }

  void _submitMath(AppState app) {
    final val = int.tryParse(_answerController.text);
    _answerController.clear();
    if (val == null) return;
    app.submitMathAnswer(val);
  }

  Widget _memoryPuzzle(AppState app, PuzzleSession session) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [_tag('Memory'), _diffDots(session.difficulty)]),
        const SizedBox(height: 14),
        Text(
          _showingSequence ? 'Memorize...' : 'Your turn — tap the tiles in order',
          style: AppTextStyles.body(size: 14, color: AppColors.violet),
        ),
        const SizedBox(height: 14),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          children: List.generate(9, (i) {
            final lit = _litSequence.contains(i);
            return GestureDetector(
              onTap: _showingSequence
                  ? null
                  : () {
                      final result = app.submitMemoryTap(i);
                      if (result == 'wrong') _maybeStartMemoryPlayback();
                    },
              child: Container(
                decoration: BoxDecoration(
                  color: lit ? AppColors.violetDim : AppColors.bgElev2,
                  border: Border.all(color: lit ? AppColors.violet : AppColors.line),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Text('${i + 1}', style: AppTextStyles.mono(size: 18)),
              ),
            );
          }),
        ),
        _wrongCount(session.wrongAttempts),
      ],
    );
  }
}

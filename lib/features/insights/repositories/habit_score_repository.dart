import 'dart:math';
import '../models/habit_score_model.dart';


class HabitScoreRepository {
 .
  final bool userHasHistory;

  HabitScoreRepository({this.userHasHistory = true});

  Future<HabitScoreModel> fetchHabitScore() async {
    await Future.delayed(const Duration(milliseconds: 400)); // simulate latency

    if (!userHasHistory) {
      return const HabitScoreModel(score: 0, components: [], trend: []);
    }

    final rng = Random(7); // stable seed so the demo doesn't jitter on refresh
    final components = HabitScoreModel.componentWeights.entries
        .map((e) => HabitComponent(
      label: e.key,
      weight: e.value,
      value: 55 + rng.nextInt(40), // 55-94
    ))
        .toList();

    final weighted = components.fold<double>(
      0,
          (sum, c) => sum + c.value * c.weight,
    );

    final trend = List.generate(14, (i) {
      final date = DateTime.now().subtract(Duration(days: 13 - i));
      final drift = (rng.nextInt(11) - 5); // +/-5 wobble
      final base = weighted.round();
      return HabitTrendPoint(
        date: date,
        score: (base + drift).clamp(0, 100),
      );
    });

    return HabitScoreModel(
      score: weighted.round().clamp(0, 100),
      components: components,
      trend: trend,
    );
  }
}

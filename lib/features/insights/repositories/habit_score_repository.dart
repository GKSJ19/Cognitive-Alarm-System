import 'dart:math';
import '../models/habit_score_model.dart';

/// STATUS: mock-only. The live /habit-score endpoint (EnvConfig.aiHost)
/// does not yet return components or a trend series — Section 6.2 of the
/// Master Team Plan documents this as Member 3's Week 5-6 deliverable,
/// frozen once the dashboard sprint begins. Swap fetchHabitScore's body
/// for a real call once that lands; the return shape (HabitScoreModel)
/// already matches the documented contract, so the screen shouldn't need
/// changes — just this repository.
///
/// To go live: replace the mock body with something like
///   final json = await apiClient.get('${EnvConfig.aiHost}/habit-score');
///   return HabitScoreModel.fromJson(json as Map<String, dynamic>);
/// following the same absolute-URL-bypass pattern as RecommendationRepository.
class HabitScoreRepository {
  /// Set this false to preview the empty state new users will see before
  /// they have any habit-score history.
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
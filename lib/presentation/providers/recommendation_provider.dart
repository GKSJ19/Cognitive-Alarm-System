import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';

import '../../providers/core_providers.dart';
import '../../data/models/recommendation_model.dart';
import '../../data/repositories/recommendation_repository.dart';

final recommendationRepositoryProvider = Provider<RecommendationRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final box = Hive.box('recommendationsCache');
  return RecommendationRepository(
    apiClient: apiClient,
    cacheBox: box,
  );
});

final habitScoreProvider = Provider<int>((ref) {
  return 0;
});

class RecommendationNotifier extends AsyncNotifier<RecommendationModel> {
  @override
  Future<RecommendationModel> build() async {
    final repo = ref.watch(recommendationRepositoryProvider);
    final score = ref.watch(habitScoreProvider);
    return repo.fetchRecommendation(score);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    final repo = ref.read(recommendationRepositoryProvider);
    final score = ref.read(habitScoreProvider);
    state = await AsyncValue.guard(() => repo.fetchRecommendation(score));
  }
}

final recommendationProvider =
AsyncNotifierProvider<RecommendationNotifier, RecommendationModel>(
  RecommendationNotifier.new,
);
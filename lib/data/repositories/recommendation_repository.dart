import 'package:dio/dio.dart';
import 'package:hive/hive.dart';
import '../models/recommendation_model.dart';
import '../../core/config/env_config.dart';
import '../../core/network/api_client.dart'; // ⚠️ adjust path if ApiClient lives elsewhere

class RecommendationFetchException implements Exception {
  final String message;
  RecommendationFetchException(this.message);
}

/// Kept for backward compatibility — recommendations_panel.dart still
/// catches this type. Since the /recommendation endpoint is now confirmed
/// live (see EnvConfig.aiHost note below), this shouldn't fire in normal
/// operation anymore, but the type needs to keep existing so that other
/// file's catch clause still compiles.
class RecommendationNotImplementedException implements Exception {}

class RecommendationRepository {
  final ApiClient apiClient;
  final Box cacheBox;

  RecommendationRepository({
    required this.apiClient,
    required this.cacheBox,
  });

  static const _cacheKeyPrefix = 'recommendation_';

  Future<RecommendationModel> fetchRecommendation(int score) async {
    final cacheKey = '$_cacheKeyPrefix$score';

    try {
      // Confirmed live: GET {aiHost}/recommendation — NOT /ai/recommendations
      // as the old comment claimed. This sits outside apiClient's /api/v1
      // base path, so we pass an absolute URL to bypass that prefix.
      // ⚠️ assumes ApiClient.get(path) returns a decoded Map<String, dynamic>
      final json = await apiClient.get(
        '${EnvConfig.aiHost}/recommendation',
      );
      final model = RecommendationModel.fromJson(json as Map<String, dynamic>);

      await cacheBox.put(cacheKey, json);
      return model;
    } on DioException catch (_) {
      return _fallbackToCacheOrThrow(cacheKey);
    } catch (_) {
      return _fallbackToCacheOrThrow(cacheKey);
    }
  }

  Future<RecommendationModel> _fallbackToCacheOrThrow(String cacheKey) async {
    final cached = cacheBox.get(cacheKey);
    if (cached != null) {
      return RecommendationModel.fromJson(Map<String, dynamic>.from(cached));
    }
    throw RecommendationFetchException(
      'Couldn\'t load your recommendation right now.',
    );
  }
}
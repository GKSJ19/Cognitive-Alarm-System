import 'package:dio/dio.dart';
import 'package:cognitive_alarm_platform/core/config/env_config.dart'; // ⚠️ adjust path if needed
import 'package:cognitive_alarm_platform/core/network/api_client.dart';
import 'package:cognitive_alarm_platform/data/models/coach_dashboard_model.dart';

/// Thrown when the backend responds 404 for the coach dashboard endpoint.
/// Per the team's integration audit, Coach dashboard endpoints are not
/// yet implemented server-side (Member 3, CRITICAL, not implemented).
/// Distinct from a transient network failure — the UI should show an
/// honest "coming soon" state rather than a generic load error.
class CoachDashboardNotImplementedException implements Exception {}

class CoachDashboardRepository {
  final ApiClient apiClient;

  CoachDashboardRepository({required this.apiClient});

  Future<CoachDashboardModel> getCoachDashboard() async {
    try {
      // ⚠️ Like /ai/recommendations, the TODO in coach_dashboard_screen.dart
      // references /coach/users and /coach/users/{id}/analytics without an
      // /api/v1 prefix — same pattern, so requesting this as a full
      // absolute URL to bypass ApiClient's baked-in /api/v1 baseUrl.
      // Unconfirmed by the doc directly; verify with Member 3.
      final json =
      await apiClient.get('${EnvConfig.aiHost}/coach/dashboard');
      return CoachDashboardModel.fromJson(json);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw CoachDashboardNotImplementedException();
      }
      rethrow;
    }
  }
}
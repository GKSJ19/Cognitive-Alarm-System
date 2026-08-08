import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:cognitive_alarm_platform/data/models/coach_dashboard_model.dart';
import 'package:cognitive_alarm_platform/data/repositories/coach_dashboard_repository.dart';
import 'package:cognitive_alarm_platform/providers/core_providers.dart';

final coachDashboardRepositoryProvider = Provider<CoachDashboardRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CoachDashboardRepository(apiClient: apiClient);
});

final coachDashboardProvider =
FutureProvider.autoDispose<CoachDashboardModel>((ref) async {
  final repo = ref.watch(coachDashboardRepositoryProvider);
  return repo.getCoachDashboard();
});
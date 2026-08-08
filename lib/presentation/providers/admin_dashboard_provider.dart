import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:cognitive_alarm_platform/data/models/admin_dashboard_model.dart';
import 'package:cognitive_alarm_platform/data/repositories/admin_dashboard_repository.dart';

final adminDashboardRepositoryProvider = Provider<AdminDashboardRepository>((ref) {
  return AdminDashboardRepository();
});

final adminDashboardProvider =
FutureProvider.autoDispose<AdminDashboardModel>((ref) async {
  final repo = ref.watch(adminDashboardRepositoryProvider);
  return repo.getAdminDashboard();
});
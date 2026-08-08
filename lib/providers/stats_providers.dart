import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/stats_models.dart';
import '../providers/core_providers.dart';
import '../repositories/real_stats_repository.dart';
import '../repositories/stats_repository.dart';

final userStatsRepositoryProvider = Provider<UserStatsRepository>((ref) {
  return RealUserStatsRepository(ref.watch(apiClientProvider));
});

final adminStatsRepositoryProvider = Provider<AdminStatsRepository>((ref) {
  return RealAdminStatsRepository(ref.watch(apiClientProvider));
});

final sleepScoreProvider =
FutureProvider.family<SleepScore, ({int hours, int quality})>((ref, params) {
  return ref.watch(userStatsRepositoryProvider).getSleepScore(
    hours: params.hours,
    quality: params.quality,
  );
});

final habitScoreProvider = FutureProvider.family<HabitScore,
    ({int onTime, int challenge, int snooze})>((ref, params) {
  return ref.watch(userStatsRepositoryProvider).getHabitScore(
    onTime: params.onTime,
    challenge: params.challenge,
    snooze: params.snooze,
  );
});

final dailyTrendsProvider = FutureProvider<DailyTrends>((ref) {
  return ref.watch(userStatsRepositoryProvider).getDailyTrends();
});

final weeklyTrendsProvider = FutureProvider<WeeklyTrends>((ref) {
  return ref.watch(userStatsRepositoryProvider).getWeeklyTrends();
});

final monthlyTrendsProvider = FutureProvider<MonthlyTrends>((ref) {
  return ref.watch(userStatsRepositoryProvider).getMonthlyTrends();
});

final activeUsersProvider = FutureProvider<ActiveUsers>((ref) {
  return ref.watch(adminStatsRepositoryProvider).getActiveUsers();
});

final alarmStatisticsProvider = FutureProvider<AlarmStatistics>((ref) {
  return ref.watch(adminStatsRepositoryProvider).getAlarmStatistics();
});
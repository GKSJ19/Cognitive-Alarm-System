import '../models/stats_models.dart';

abstract class UserStatsRepository {
  Future<SleepScore> getSleepScore({required int hours, required int quality});
  Future<HabitScore> getHabitScore({required int onTime, required int challenge, required int snooze});
  Future<DailyTrends> getDailyTrends();
  Future<WeeklyTrends> getWeeklyTrends();
  Future<MonthlyTrends> getMonthlyTrends();
}

abstract class AdminStatsRepository {
  Future<ActiveUsers> getActiveUsers();
  Future<AlarmStatistics> getAlarmStatistics();
}
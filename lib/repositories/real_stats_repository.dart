import '../core/network/api_client.dart';
import '../models/stats_models.dart';
import 'stats_repository.dart';

class RealUserStatsRepository implements UserStatsRepository {
  RealUserStatsRepository(this._client);
  final ApiClient _client;

  @override
  Future<SleepScore> getSleepScore({required int hours, required int quality}) async {
    final data = await _client.get('/v1/sleep-score', queryParameters: {
      'hours': hours,
      'quality': quality,
    });
    return SleepScore.fromJson(data);
  }

  @override
  Future<HabitScore> getHabitScore({required int onTime, required int challenge, required int snooze}) async {
    final data = await _client.get('/v1/habit-score', queryParameters: {
      'on_time': onTime,
      'challenge': challenge,
      'snooze': snooze,
    });
    return HabitScore.fromJson(data);
  }

  @override
  Future<DailyTrends> getDailyTrends() async {
    final data = await _client.get('/v1/daily-trends');
    return DailyTrends.fromJson(data);
  }

  @override
  Future<WeeklyTrends> getWeeklyTrends() async {
    final data = await _client.get('/v1/weekly-trends');
    return WeeklyTrends.fromJson(data);
  }

  @override
  Future<MonthlyTrends> getMonthlyTrends() async {
    final data = await _client.get('/v1/monthly-trends');
    return MonthlyTrends.fromJson(data);
  }
}

class RealAdminStatsRepository implements AdminStatsRepository {
  RealAdminStatsRepository(this._client);
  final ApiClient _client;

  @override
  Future<ActiveUsers> getActiveUsers() async {
    final data = await _client.get('/v1/active-users');
    return ActiveUsers.fromJson(data);
  }

  @override
  Future<AlarmStatistics> getAlarmStatistics() async {
    final data = await _client.get('/v1/alarm-statistics');
    return AlarmStatistics.fromJson(data);
  }
}
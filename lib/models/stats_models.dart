class SleepScore {
  final int sleepHours;
  final int sleepQuality;
  final int sleepScore;
  SleepScore({required this.sleepHours, required this.sleepQuality, required this.sleepScore});
  factory SleepScore.fromJson(Map<String, dynamic> json) => SleepScore(
    sleepHours: json['Sleep Hours'] as int,
    sleepQuality: json['Sleep Quality'] as int,
    sleepScore: json['Sleep Score'] as int,
  );
}

class HabitScore {
  final int habitScore;
  HabitScore({required this.habitScore});
  factory HabitScore.fromJson(Map<String, dynamic> json) =>
      HabitScore(habitScore: json['Habit Score'] as int);
}

class DailyTrends {
  final int habitScore, challengeScore, sleepScore;
  DailyTrends({required this.habitScore, required this.challengeScore, required this.sleepScore});
  factory DailyTrends.fromJson(Map<String, dynamic> json) => DailyTrends(
    habitScore: json['Habit Score'] as int,
    challengeScore: json['Challenge Score'] as int,
    sleepScore: json['Sleep Score'] as int,
  );
}

class WeeklyTrends {
  final int avgHabitScore, avgChallengeScore, avgSleepScore;
  WeeklyTrends({required this.avgHabitScore, required this.avgChallengeScore, required this.avgSleepScore});
  factory WeeklyTrends.fromJson(Map<String, dynamic> json) => WeeklyTrends(
    avgHabitScore: json['Average Habit Score'] as int,
    avgChallengeScore: json['Average Challenge Score'] as int,
    avgSleepScore: json['Average Sleep Score'] as int,
  );
}

class MonthlyTrends {
  final int monthlyHabitScore, monthlyChallengeScore, monthlySleepScore;
  MonthlyTrends({required this.monthlyHabitScore, required this.monthlyChallengeScore, required this.monthlySleepScore});
  factory MonthlyTrends.fromJson(Map<String, dynamic> json) => MonthlyTrends(
    monthlyHabitScore: json['Monthly Habit Score'] as int,
    monthlyChallengeScore: json['Monthly Challenge Score'] as int,
    monthlySleepScore: json['Monthly Sleep Score'] as int,
  );
}

class ActiveUsers {
  final int activeUsers;
  ActiveUsers({required this.activeUsers});
  factory ActiveUsers.fromJson(Map<String, dynamic> json) =>
      ActiveUsers(activeUsers: json['Active Users'] as int);
}

class AlarmStatistics {
  final int created, completed, missed, snoozed;
  AlarmStatistics({required this.created, required this.completed, required this.missed, required this.snoozed});
  factory AlarmStatistics.fromJson(Map<String, dynamic> json) => AlarmStatistics(
    created: json['Created'] as int,
    completed: json['Completed'] as int,
    missed: json['Missed'] as int,
    snoozed: json['Snoozed'] as int,
  );
}


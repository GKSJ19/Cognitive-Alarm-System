
class CoachDashboardModel {
  final int activeUsers;
  final int averageHabitScore;
  final int averageSleepScore;
  final int averageChallengeScore;
  final int completedAlarms;
  final int missedAlarms;

  CoachDashboardModel({
    required this.activeUsers,
    required this.averageHabitScore,
    required this.averageSleepScore,
    required this.averageChallengeScore,
    required this.completedAlarms,
    required this.missedAlarms,
  });

  factory CoachDashboardModel.fromJson(Map<String, dynamic> json) {
    return CoachDashboardModel(
      activeUsers: json['active_users'] as int? ?? 0,
      averageHabitScore: json['average_habit_score'] as int? ?? 0,
      averageSleepScore: json['average_sleep_score'] as int? ?? 0,
      averageChallengeScore: json['average_challenge_score'] as int? ?? 0,
      completedAlarms: json['completed_alarms'] as int? ?? 0,
      missedAlarms: json['missed_alarms'] as int? ?? 0,
    );
  }
}
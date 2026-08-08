/// STUB SCHEMA — no admin analytics endpoint exists yet (unconfirmed
/// with Member 3/Member 1). Update field names/types once a real
/// contract exists. Mirrors CoachDashboardModel's pattern.
class AdminDashboardModel {
  final int totalUsersCount;
  final int totalCoachesCount;
  final double platformAvgAdherence; // 0-100
  final List<double> signupTrend; // new users per period
  final List<String> trendLabels; // e.g. ['Week 1', 'Week 2', ...]
  final List<String> systemAlerts;

  AdminDashboardModel({
    required this.totalUsersCount,
    required this.totalCoachesCount,
    required this.platformAvgAdherence,
    required this.signupTrend,
    required this.trendLabels,
    required this.systemAlerts,
  });

  factory AdminDashboardModel.fromJson(Map<String, dynamic> json) {
    return AdminDashboardModel(
      totalUsersCount: json['total_users_count'] as int? ?? 0,
      totalCoachesCount: json['total_coaches_count'] as int? ?? 0,
      platformAvgAdherence:
      (json['platform_avg_adherence'] as num?)?.toDouble() ?? 0,
      signupTrend: (json['signup_trend'] as List<dynamic>?)
          ?.map((e) => (e as num).toDouble())
          .toList() ??
          [],
      trendLabels: (json['trend_labels'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ??
          [],
      systemAlerts: (json['system_alerts'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ??
          [],
    );
  }

  /// Placeholder data so the UI is buildable/demoable before the
  /// real endpoint exists. Delete once wired to the live API.
  factory AdminDashboardModel.stub() {
    return AdminDashboardModel(
      totalUsersCount: 312,
      totalCoachesCount: 14,
      platformAvgAdherence: 71,
      signupTrend: const [20, 28, 35, 30, 42, 48, 55],
      trendLabels: const ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
      systemAlerts: const [
        '2 coaches have not logged in for 14+ days.',
        'Notification delivery rate dropped 8% this week.',
      ],
    );
  }
}
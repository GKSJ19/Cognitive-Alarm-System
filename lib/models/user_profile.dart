/// Matches GET /users/me and the response body of POST /auth/register
/// (Cognitive-Alarm-System's UserResponse schema). Login and Google
/// sign-in return a token pair only — AuthRepository follows up with a
/// /users/me call to get this shape. This one response already includes
/// every profile field — there is no separate /users/profile endpoint.
class BackendUser {
  final String id;
  final String username;
  final String email;
  final String role;
  final bool isActive;
  final String? preferredWakeUpTime;
  final int? sleepDurationMinutes;
  final String? timezone;
  final String? difficultyPreference;
  final String? productivityGoals;
  final Map<String, dynamic>? habitPreferences;
  final DateTime createdAt;

  BackendUser({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    required this.isActive,
    this.preferredWakeUpTime,
    this.sleepDurationMinutes,
    this.timezone,
    this.difficultyPreference,
    this.productivityGoals,
    this.habitPreferences,
    required this.createdAt,
  });

  factory BackendUser.fromJson(Map<String, dynamic> json) => BackendUser(
    id: json['id'].toString(),
    username: json['username'] as String,
    email: json['email'] as String,
    // Backend's UserRole enum values are 'user', 'wellness_coach', 'admin'
    // — note it's 'wellness_coach', not 'coach'.
    role: json['role'] as String? ?? 'user',
    isActive: json['is_active'] as bool? ?? true,
    preferredWakeUpTime: json['preferred_wake_up_time'] as String?,
    sleepDurationMinutes: json['sleep_duration_minutes'] as int?,
    timezone: json['timezone'] as String?,
    difficultyPreference: json['difficulty_preference'] as String?,
    productivityGoals: json['productivity_goals'] as String?,
    habitPreferences: json['habit_preferences'] as Map<String, dynamic>?,
    createdAt: DateTime.parse(json['created_at'] as String),
  );
}

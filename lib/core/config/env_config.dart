// Confirmed 2026-08-08: only two backends actually exist for this app.
//   apiBaseUrl -> Member 1's Mongo/FastAPI service (auth, alarms, challenges,
//                 users, analytics). This is the ONLY host ApiClient uses;
//                 every repository built on apiClientProvider hits this.
//   aiHost     -> Member 3's AI & Analytics service (habit-score, recommendation,
//                 coach/*). Reached via absolute-URL calls that bypass
//                 apiBaseUrl entirely (see RecommendationRepository,
//                 CoachDashboardRepository) — NOT through ApiClient's base URL.
//
// Removed: `apiHost` (API_HOST env var) — declared but never read anywhere;
// apiBaseUrl (a *different* env var, API_BASE_URL) was the only one that did
// anything, so API_HOST was silently a no-op.
// Removed: `alarmHost` (ALARM_HOST, port 8002) — no separate alarm service
// exists. backend.zip's /alarms endpoints (real, JWT-protected, Mongo-backed)
// are already served on apiBaseUrl. If Member 2 stands up a real standalone
// alarm service later, re-add this AND update AlarmRepository to use it.
class EnvConfig {
  EnvConfig._();

  // Auth, alarms, challenges, users, analytics — Member 1's service.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8000',
  );

  // Habit-score, recommendation, coach/* — Member 3's service.
  static const String aiHost = String.fromEnvironment(
    'AI_HOST',
    defaultValue: 'http://127.0.0.1:8001',
  );
}
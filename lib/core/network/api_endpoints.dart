class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const login = '/auth/login';
  static const register = '/auth/register';
  static const refreshToken = '/auth/refresh';
  static const googleSignIn = '/auth/google';
  static const requestPasswordReset = '/auth/password-reset/request';
  static const confirmPasswordReset = '/auth/password-reset/confirm';

  // Alarms
  static const alarms = '/alarms';
  static String alarmById(String id) => '/alarms/$id';

  // Challenge
  static const challenge = '/challenge';
  static const challengeSubmit = '/challenge/submit';
  static const challengeHistory = '/challenge/history';

  // Analytics
  static const analytics = '/analytics';
}

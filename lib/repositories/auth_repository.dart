import 'package:dio/dio.dart';

import 'package:cognitive_alarm_platform/core/services/auth_service.dart';
import 'package:cognitive_alarm_platform/core/network/api_client.dart';
import 'package:cognitive_alarm_platform/core/storage/secure_storage_service.dart';
import 'package:cognitive_alarm_platform/models/user_profile.dart';

class AuthRepository {
  final AuthService _authService;
  final ApiClient _apiClient;
  final SecureStorageService _secureStorage;

  AuthRepository({
    required AuthService authService,
    required ApiClient apiClient,
    required SecureStorageService secureStorage,
  })  : _authService = authService,
        _apiClient = apiClient,
        _secureStorage = secureStorage;

  // ---- Firebase-based session state (Google sign-in) ----

  Future<bool> get isLoggedIn async {
    final user = _authService.currentUser;

    if (user != null && user.isAnonymous) {
      // Stray anonymous session from debugForceLogin() ("Skip Login
      // (Dev Only)") — not a real login. Clear it so devices with one
      // already persisted self-heal on next launch.
      await _authService.signOut();
    } else if (user != null) {
      // Real Firebase session (Google sign-in). Backend token isn't
      // involved in this path, so this is the source of truth here.
      return true;
    }

    // Email/password path: the backend is the source of truth, not just
    // "a token happens to be stored." A token that's expired or was
    // revoked server-side must not count as logged in — but a read
    // failure from the platform's secure-storage plugin must ALSO not
    // throw out of here uncaught: this getter runs inside GoRouter's
    // async `redirect`, which swallows navigation on an unhandled
    // exception with no visible error, so a storage glitch would
    // otherwise look exactly like "stuck on login with no error message."
    try {
      final token = await _secureStorage.accessToken;
      if (token == null || token.isEmpty) return false;

      await getCurrentUserFromBackend();
      return true;
    } catch (e) {
      await _secureStorage.clearAuthTokens();
      return false;
    }
  }

  Future<String?> get userRole => _secureStorage.userRole;

  Future<void> logout() async {
    await _authService.signOut();
    await _secureStorage.clearAuthTokens();
  }

  Future<void> requestPasswordReset(String email) async {
    await _authService.sendPasswordResetEmail(email);
  }

  /// ⚠️ FIX: previously this signed in anonymously FIRST and saved the
  /// role SECOND. But signing in is exactly what fires Firebase's
  /// authStateChanges stream, which GoRouterRefreshNotifier listens to in
  /// order to re-run the router's redirect. That meant redirect could
  /// (and did) read the OLD role from secure storage before saveUserRole
  /// below had actually written the new one — a race that made the
  /// dev role switcher unreliable, especially noticeable right after
  /// switching to 'admin' and immediately tapping a protected tile.
  ///
  /// Saving the role BEFORE triggering the sign-in (and therefore before
  /// the auth-state stream fires) ensures the redirect always sees the
  /// correct, already-updated role.
  Future<void> debugForceLogin({String role = 'user'}) async {
    await _secureStorage.saveUserRole(role);
    await _authService.signInAnonymouslyForDebug();
  }

  /// Signs in with Google via Firebase, then registers the resulting
  /// session with our backend so a `role` gets assigned — Firebase alone
  /// has no concept of role, so without this call a Google-signed-in
  /// user has no role and gets bounced from /coach-dashboard and
  /// /admin-dashboard even if they're a real coach or admin.
  ///
  /// Backend contract (Cognitive-Alarm-System's POST /auth/google):
  /// expects the Firebase ID token as `firebase_id_token`, returns the
  /// same {access_token, refresh_token} shape as /auth/login.
  ///
  /// Returns false if the user cancelled the Google picker.
  Future<bool> loginWithGoogle() async {
    final credential = await _authService.signInWithGoogle();
    final user = credential?.user;
    if (user == null) return false;

    final idToken = await user.getIdToken();
    final json = await _apiClient.post('/auth/google', data: {
      'firebase_id_token': idToken,
    });

    await _secureStorage.saveAccessToken(json['access_token'] as String);
    await _secureStorage.saveRefreshToken(json['refresh_token'] as String);

    final backendUser = await getCurrentUserFromBackend();
    await _secureStorage.saveUserRole(backendUser.role);
    return true;
  }

  // ---- Backend REST auth (Cognitive-Alarm-System contract) ----

  /// Backend's UserCreate model wants username/email/password — there is
  /// no "full_name" field anywhere on the backend User model.
  Future<BackendUser> registerWithBackend({
    required String username,
    required String email,
    required String password,
  }) async {
    final json = await _apiClient.post('/auth/register', data: {
      'username': username,
      'email': email,
      'password': password,
    });
    final user = BackendUser.fromJson(json);
    await _secureStorage.saveUserRole(user.role);
    return user;
  }

  /// POST /auth/login takes a plain JSON body ({email, password}) — this
  /// backend uses a Pydantic UserLogin schema, not FastAPI's
  /// OAuth2PasswordRequestForm, so no form-encoding is needed here.
  Future<void> loginWithBackend({
    required String email,
    required String password,
  }) async {
    final json = await _apiClient.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    await _secureStorage.saveAccessToken(json['access_token'] as String);
    await _secureStorage.saveRefreshToken(json['refresh_token'] as String);

    final user = await getCurrentUserFromBackend();
    await _secureStorage.saveUserRole(user.role);
  }

  /// Path is /auth/refresh, and the body field is `refresh_token`
  /// (RefreshRequest schema) — not /auth/refresh-token / `token`.
  Future<void> refresh() async {
    final currentRefresh = await _secureStorage.refreshToken;
    if (currentRefresh == null) {
      throw Exception('No refresh token stored');
    }
    final json = await _apiClient.post('/auth/refresh', data: {
      'refresh_token': currentRefresh,
    });
    await _secureStorage.saveAccessToken(json['access_token'] as String);
    await _secureStorage.saveRefreshToken(json['refresh_token'] as String);
  }

  /// Current-user lookup lives under the /users router, not /auth — it's
  /// GET /users/me (user_routes.py), and it already returns every profile
  /// field (habit prefs, wake time, etc.) in one response. There is no
  /// separate /users/profile endpoint.
  Future<BackendUser> getCurrentUserFromBackend() async {
    final json = await _apiClient.get('/users/me');
    return BackendUser.fromJson(json);
  }

  Future<void> logoutFromBackend() => _secureStorage.clearAuthTokens();
}
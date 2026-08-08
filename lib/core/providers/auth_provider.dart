import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:cognitive_alarm_platform/core/services/auth_service.dart';
import 'package:cognitive_alarm_platform/providers/core_providers.dart';
import 'package:cognitive_alarm_platform/repositories/auth_repository.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

final authStateProvider = StreamProvider<User?>((ref) {
  final authService = ref.watch(authServiceProvider);
  return authService.authStateChanges;
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final repo = AuthRepository(
    authService: ref.watch(authServiceProvider),
    apiClient: apiClient,
    secureStorage: ref.watch(secureStorageServiceProvider),
  );


  apiClient.onUnauthorized = () async {
    try {
      await repo.refresh();
      return true;
    } catch (_) {
      return false;
    }
  };

  return repo;
});
final isLoggedInProvider = FutureProvider<bool>((ref) {
  return ref.watch(authRepositoryProvider).isLoggedIn;
});

final userRoleProvider = FutureProvider<String?>((ref) {
  return ref.watch(authRepositoryProvider).userRole;
});



final isCoachProvider = Provider<bool>((ref) {
  final roleAsync = ref.watch(userRoleProvider);
  return roleAsync.maybeWhen(
    data: (role) => role == 'wellness_coach' || role == 'admin',
    orElse: () => false,
  );
});

final isAdminProvider = Provider<bool>((ref) {
  final roleAsync = ref.watch(userRoleProvider);
  return roleAsync.maybeWhen(
    data: (role) => role == 'admin',
    orElse: () => false,
  );
});
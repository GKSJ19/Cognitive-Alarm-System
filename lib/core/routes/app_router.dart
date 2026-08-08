import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

import '../../features/auth/screens/splash_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/coach/screens/coach_dashboard_screen.dart';
import '../../features/admin/screens/admin_dashboard_screen.dart'; // ⚠️ confirm this path/filename
import '../../presentation/widgets/unauthorized_screen.dart';

import 'app.routes.dart';
import '../providers/auth_provider.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>();

final goRouterProvider = Provider<GoRouter>((ref) {
  final authRepo = ref.watch(authRepositoryProvider);

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: AppRoutes.splash,
    refreshListenable: GoRouterRefreshNotifier(ref),
    redirect: (context, state) async {
      final loc = state.matchedLocation;
      final onSplash = loc == AppRoutes.splash;
      final onAuthScreen = loc == AppRoutes.login || loc == AppRoutes.register;
      final onCoachDashboard = loc == AppRoutes.coachDashboard;
      final onAdminDashboard = loc == AppRoutes.adminDashboard; // ⚠️ confirm this constant exists in app.routes.dart

      if (onSplash) return null;

      final loggedIn = await authRepo.isLoggedIn;

      if (!loggedIn && !onAuthScreen) return AppRoutes.login;
      if (loggedIn && onAuthScreen) return AppRoutes.home;

      // Role gate: coach dashboard — wellness_coach or admin may enter.
      if (loggedIn && onCoachDashboard) {
        final role = await authRepo.userRole;
        if (role != 'wellness_coach' && role != 'admin') return AppRoutes.unauthorized;
      }

      // Role gate: admin dashboard — admin only.
      if (loggedIn && onAdminDashboard) {
        final role = await authRepo.userRole;
        if (role != 'admin') return AppRoutes.unauthorized;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: AppRoutes.home,
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: AppRoutes.coachDashboard,
        builder: (context, state) => const CoachDashboardScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminDashboard, // ⚠️ confirm this constant exists
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: AppRoutes.unauthorized,
        builder: (context, state) => const UnauthorizedScreen(),
      ),
    ],
  );
});

class GoRouterRefreshNotifier extends ChangeNotifier {
  GoRouterRefreshNotifier(Ref ref) {
    ref.listen(authStateProvider, (_, __) => notifyListeners());
  }
}
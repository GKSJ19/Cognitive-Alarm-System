import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:cognitive_alarm_platform/core/providers/auth_provider.dart';
import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';
import 'package:cognitive_alarm_platform/core/widgets/neura_mark.dart';
import 'package:cognitive_alarm_platform/core/widgets/theme_toggle_switch.dart';
import 'package:cognitive_alarm_platform/presentation/widgets/recommendations_panel.dart';
import '../../../core/routes/app.routes.dart';
import '../../analytics/analytics_screen.dart';
import '../../alarm/providers/alarm_provider.dart';
import '../../alarm/screens/alarm_list_screen.dart';
import '../../auth/screens/login_screen.dart';
import '../../challenges/challenge_category_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../coach/screens/coach_dashboard_screen.dart';
import '../../admin/screens/admin_dashboard_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  Future<void> _handleSignOut(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(authRepositoryProvider).logout();

      if (!context.mounted) return;

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
            (route) => false,
      );
    } catch (e, st) {
      debugPrint('Logout failed: $e');
      debugPrintStack(stackTrace: st);

      if (!context.mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Logout failed: $e'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alarmsAsync = ref.watch(alarmListProvider);
    final alarms = alarmsAsync.valueOrNull ?? const [];
    final activeCount = alarms.where((a) => a.isEnabled).length;
    final user = ref.watch(authStateProvider).value;
    final isAdmin = ref.watch(isAdminProvider);
    final isCoach = ref.watch(isCoachProvider);
    final displayName = user?.displayName?.isNotEmpty == true
        ? user!.displayName!
        : (user?.email ?? 'there');

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _HomeHeader(
                displayName: displayName,
                activeCount: activeCount,
                onSignOut: () => _handleSignOut(context, ref),
              ),

              // --- DEBUG ONLY: quick role switcher + role-gated route
              // testers. Remove before release build (Milestone 4).
              if (kDebugMode)
                Builder(
                  builder: (context) {
                    final isDark = Theme.of(context).brightness == Brightness.dark;
                    // amber.shade300/200 read fine on a dark background but
                    // become near-invisible on this same tint in light mode
                    // — use a much darker amber for text there instead.
                    final labelColor = isDark ? Colors.amber.shade300 : Colors.amber.shade900;
                    return Container(
                      margin: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.amber.withValues(alpha: isDark ? 0.08 : 0.15),
                        border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.bug_report_outlined, size: 14, color: labelColor),
                              const SizedBox(width: 6),
                              Text(
                                'DEV ROLE:',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: labelColor,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 8),
                              ...['user', 'wellness_coach', 'admin'].map(
                                    (role) => Padding(
                                  padding: const EdgeInsets.only(right: 6),
                                  child: _DebugRoleChip(role: role),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Text(
                                'DEV NAV:',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: labelColor,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 8),
                              TextButton(
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                onPressed: () => context.go(AppRoutes.coachDashboard),
                                child: const Text('Coach Dashboard', style: TextStyle(fontSize: 11)),
                              ),
                              TextButton(
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                onPressed: () => context.go(AppRoutes.adminDashboard),
                                child: const Text('Admin Dashboard', style: TextStyle(fontSize: 11)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),

              Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Quick access',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 12),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 14,
                      crossAxisSpacing: 14,
                      childAspectRatio: 1.15,
                      children: [
                        _DashboardTile(
                          icon: Icons.alarm,
                          label: 'Alarms',
                          enabled: true,
                          tint: NueraColors.indigo,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AlarmListScreen()),
                          ),
                        ),
                        _DashboardTile(
                          icon: Icons.psychology_alt_outlined,
                          label: 'Challenge',
                          enabled: true,
                          tint: NueraColors.indigo,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const ChallengeCategoryScreen()),
                          ),
                        ),
                        _DashboardTile(
                          icon: Icons.bar_chart_rounded,
                          label: 'Analytics',
                          enabled: true,
                          tint: NueraColors.mindGreen,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AnalyticsScreen()),
                          ),
                        ),
                        _DashboardTile(
                          icon: Icons.person_outline,
                          label: 'Profile',
                          enabled: true,
                          tint: NueraColors.mindGreen,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const ProfileScreen()),
                          ),
                        ),
                        // Real (non-debug) entry point for coaches/admins — the
                        // debug-only "DEV NAV" banner above was the only way to
                        // reach these screens before, which meant a real coach
                        // or admin user had no way in outside dev mode.
                        if (isAdmin)
                          _DashboardTile(
                            icon: Icons.admin_panel_settings_outlined,
                            label: 'Admin Dashboard',
                            enabled: true,
                            tint: NueraColors.indigo,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const AdminDashboardScreen()),
                            ),
                          )
                        else if (isCoach)
                          _DashboardTile(
                            icon: Icons.psychology_outlined,
                            label: 'Coach Dashboard',
                            enabled: true,
                            tint: NueraColors.indigo,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const CoachDashboardScreen()),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),

              // --- Recommendations panel (Milestone 3, Priority 1) ---
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
                child: const RecommendationsPanel(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DebugRoleChip extends ConsumerWidget {
  final String role;
  const _DebugRoleChip({required this.role});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      borderRadius: BorderRadius.circular(6),
      onTap: () async {
        await ref.read(authRepositoryProvider).debugForceLogin(role: role);
        ref.invalidate(userRoleProvider);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Role forced to "$role"')),
          );
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: Colors.amber.withValues(alpha: isDark ? 0.15 : 0.25),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          role,
          style: TextStyle(
            fontSize: 11,
            color: isDark ? Colors.amber.shade200 : Colors.amber.shade900,
          ),
        ),
      ),
    );
  }
}

/// Combines what used to be a bare AppBar('Nuera') + a separate
/// "Welcome back" text block into one branded indigo-deep header.
class _HomeHeader extends StatelessWidget {
  final String displayName;
  final int activeCount;
  final VoidCallback onSignOut;

  const _HomeHeader({
    required this.displayName,
    required this.activeCount,
    required this.onSignOut,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 16, 16, 26),
      decoration: const BoxDecoration(
        color: NueraColors.indigoDeep,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: NueraColors.indigo,
                      borderRadius: BorderRadius.circular(11),
                    ),
                    child: const NueraMark(size: 18),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Nuera',
                    style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const ThemeToggleSwitch(),
                  const SizedBox(width: 4),
                  InkWell(
                    onTap: onSignOut,
                    borderRadius: BorderRadius.circular(17),
                    child: Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.logout, color: Colors.white, size: 16),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 22),
          Text(
            'Welcome back, $displayName',
            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            activeCount == 0
                ? 'No active alarms yet'
                : '$activeCount active alarm${activeCount == 1 ? '' : 's'}',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _DashboardTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool enabled;
  final Color tint;
  final VoidCallback? onTap;

  const _DashboardTile({
    required this.icon,
    required this.label,
    required this.enabled,
    required this.tint,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).cardTheme.color,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: enabled
            ? onTap
            : () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('$label is coming soon')),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: enabled ? tint.withValues(alpha: 0.12) : Colors.grey.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  size: 18,
                  color: enabled ? tint : Colors.grey.shade400,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: enabled ? null : Colors.grey.shade400,
                ),
              ),
              if (!enabled) ...[
                const SizedBox(height: 2),
                Text(
                  'Coming soon',
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade400),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
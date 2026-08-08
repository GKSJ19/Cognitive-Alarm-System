import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:cognitive_alarm_platform/presentation/providers/coach_dashboard_provider.dart';
import 'package:cognitive_alarm_platform/presentation/widgets/stat_card.dart';
import 'package:cognitive_alarm_platform/data/repositories/coach_dashboard_repository.dart';
import '../../../core/routes/app.routes.dart'; // ⚠️ confirm this relative path matches this file's actual depth

class CoachDashboardScreen extends ConsumerWidget {
  const CoachDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(coachDashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Coach Dashboard'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go(AppRoutes.home),
        ),
      ),
      body: dashboardAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => err is CoachDashboardNotImplementedException
            ? Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.hourglass_empty,
                  size: 40,
                  color: Theme.of(context).colorScheme.outline,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Coach dashboard is coming soon.',
                  style: TextStyle(fontStyle: FontStyle.italic),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        )
            : Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Could not load dashboard data: $err'),
          ),
        ),
        data: (data) => RefreshIndicator(
          onRefresh: () async => ref.refresh(coachDashboardProvider.future),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      label: 'Active Users',
                      value: '${data.activeUsers}',
                      icon: Icons.groups_outlined,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatCard(
                      label: 'Avg. Habit Score',
                      value: '${data.averageHabitScore}',
                      icon: Icons.check_circle_outline,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      label: 'Avg. Sleep Score',
                      value: '${data.averageSleepScore}',
                      icon: Icons.bedtime_outlined,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatCard(
                      label: 'Avg. Challenge Score',
                      value: '${data.averageChallengeScore}',
                      icon: Icons.psychology_alt_outlined,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      label: 'Completed Alarms',
                      value: '${data.completedAlarms}',
                      icon: Icons.alarm_on_outlined,
                      accentColor: Colors.green,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatCard(
                      label: 'Missed Alarms',
                      value: '${data.missedAlarms}',
                      icon: Icons.alarm_off_outlined,
                      accentColor: Colors.redAccent,
                    ),
                  ),
                ],
              ),
              // TODO: link to a Users list screen backed by GET /coach/users,
              // and per-user analytics via GET /coach/users/{user_id}/analytics
              // — this is where per-user recommendations now live, since the
              // dashboard endpoint doesn't return an aggregate list.
            ],
          ),
        ),
      ),
    );
  }
}
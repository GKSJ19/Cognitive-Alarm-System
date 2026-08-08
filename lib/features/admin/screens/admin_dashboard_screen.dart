import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:go_router/go_router.dart';

import 'package:cognitive_alarm_platform/presentation/providers/admin_dashboard_provider.dart';
import 'package:cognitive_alarm_platform/presentation/widgets/stat_card.dart';
import 'package:cognitive_alarm_platform/presentation/widgets/trend_chart.dart';
import 'package:cognitive_alarm_platform/data/models/recommendation_model.dart';
import 'package:cognitive_alarm_platform/presentation/widgets/recommendation_card.dart';
import '../../../core/routes/app.routes.dart'; // ⚠️ confirm this relative path matches this file's actual depth

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(adminDashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go(AppRoutes.home),
        ),
      ),
      body: dashboardAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Could not load dashboard data: $err'),
          ),
        ),
        data: (data) => RefreshIndicator(
          onRefresh: () async => ref.refresh(adminDashboardProvider.future),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      label: 'Total Users',
                      value: '${data.totalUsersCount}',
                      icon: Icons.people_outline,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatCard(
                      label: 'Total Coaches',
                      value: '${data.totalCoachesCount}',
                      icon: Icons.badge_outlined,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              StatCard(
                label: 'Platform Avg. Adherence',
                value: '${data.platformAvgAdherence.toStringAsFixed(0)}%',
                icon: Icons.trending_up,
              ),
              const SizedBox(height: 20),

              TrendChart(
                title: 'Signup Trend',
                points: [
                  for (int i = 0; i < data.signupTrend.length; i++)
                    FlSpot(i.toDouble(), data.signupTrend[i]),
                ],
                xLabels: data.trendLabels,
                minY: 0,
                maxY: (data.signupTrend.isEmpty
                    ? 10
                    : data.signupTrend.reduce((a, b) => a > b ? a : b) * 1.3)
                    .toDouble(),
              ),
              const SizedBox(height: 20),

              if (data.systemAlerts.isNotEmpty) ...[
                Text(
                  'System Alerts',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                for (final alert in data.systemAlerts)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: RecommendationCard(
                      recommendation: RecommendationModel(recommendation: alert),
                    ),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
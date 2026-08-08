import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';

import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';
import 'analytics_service.dart';
import '../challenges/challenge_category.dart';

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final service = AnalyticsService.instance;
    final entries = service.getAllEntries();

    if (entries.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Analytics')),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: Text(
                  'No alarms dismissed yet. Once you solve a wake-up challenge, your stats will show up here.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 15),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final streak = service.currentStreak();
    final avgAttempts = service.averageAttempts();
    final byCategory = service.countByCategory();
    final maxCount = byCategory.values.isEmpty
        ? 1
        : byCategory.values.reduce((a, b) => a > b ? a : b);

    return Scaffold(
      appBar: AppBar(title: const Text('Analytics')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Row(
            children: [
              Expanded(child: _StatCard(label: 'Day streak', value: '$streak')),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(label: 'Avg. attempts', value: avgAttempts.toStringAsFixed(1))),
            ],
          ),

          const SizedBox(height: 28),
          const Text('By category', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 14),
          ...ChallengeCategory.values.map((category) {
            final count = byCategory[category] ?? 0;
            final fraction = maxCount == 0 ? 0.0 : count / maxCount;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(category.label, style: const TextStyle(fontSize: 13)),
                  const SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        return Stack(
                          children: [
                            Container(height: 18, color: Colors.grey.shade200),
                            Container(
                              height: 18,
                              width: constraints.maxWidth * fraction,
                              color: NueraColors.indigo,
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text('$count', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                ],
              ),
            );
          }),
          const SizedBox(height: 28),
          const Text('Recent activity', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 14),
          ...entries.take(10).map(
                (e) => ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.check_circle_outline, color: NueraColors.mindGreen),
              title: Text(e.category.label),
              subtitle: Text('${e.attempts} attempt${e.attempts == 1 ? '' : 's'}'),
              trailing: Text(
                '${e.dismissedAt.hour.toString().padLeft(2, '0')}:${e.dismissedAt.minute.toString().padLeft(2, '0')}',
                style: TextStyle(color: Colors.grey.shade500),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;

  const _StatCard({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: NueraColors.indigo.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}
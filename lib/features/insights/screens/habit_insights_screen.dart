import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';
import 'package:cognitive_alarm_platform/presentation/widgets/trend_chart.dart';
import '../models/habit_score_model.dart';
import '../repositories/habit_score_repository.dart';
import '../widgets/habit_score_rings.dart';


const _componentCopy = {
  'Wake-Up Consistency': 'How close your actual wake-ups land to your set alarm time.',
  'Challenge Completion': 'How often you finish the wake-up challenge instead of dismissing it.',
  'Snooze Reduction': 'How well you\'re cutting back on snoozing over time.',
  'Sleep Schedule Adherence': 'How consistent your sleep schedule is night to night.',
};

class HabitInsightsScreen extends StatefulWidget {
  const HabitInsightsScreen({super.key});

  @override
  State<HabitInsightsScreen> createState() => _HabitInsightsScreenState();
}

class _HabitInsightsScreenState extends State<HabitInsightsScreen> {
  late final _repo = HabitScoreRepository();
  late final Future<HabitScoreModel> _future = _repo.fetchHabitScore();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Habit & Insights')),
      body: FutureBuilder<HabitScoreModel>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const _LoadingState();
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return _ErrorState(onRetry: () => setState(() {}));
          }
          final data = snapshot.data!;
          if (!data.hasHistory) {
            return const _EmptyState();
          }
          return _Loaded(data: data);
        },
      ),
    );
  }
}

class _Loaded extends StatelessWidget {
  final HabitScoreModel data;
  const _Loaded({required this.data});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Center(child: HabitScoreRing(score: data.score)),
        const SizedBox(height: 24),
        Text(
          'Breakdown',
          style: Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        ...data.components.map((c) => _ComponentTile(component: c)),
        const SizedBox(height: 24),
        TrendChart(
          title: 'Last 14 days',
          points: [
            for (int i = 0; i < data.trend.length; i++)
              FlSpot(i.toDouble(), data.trend[i].score.toDouble()),
          ],
          lineColor: NueraColors.indigo,
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class _ComponentTile extends StatelessWidget {
  final HabitComponent component;
  const _ComponentTile({required this.component});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: NueraColors.indigo.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  component.label,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              Text(
                '${component.value}',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: NueraColors.indigo,
                ),
              ),
              Text(
                '  ·  ${(component.weight * 100).round()}% weight',
                style: TextStyle(fontSize: 11, color: Colors.grey[600]),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: component.value / 100,
              minHeight: 6,
              backgroundColor: NueraColors.indigo.withValues(alpha: 0.08),
              valueColor: const AlwaysStoppedAnimation(NueraColors.dawnAmber),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            _componentCopy[component.label] ?? '',
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const SizedBox(height: 24),
        const Center(
          child: SizedBox(
            width: 160,
            height: 160,
            child: CircularProgressIndicator(strokeWidth: 12),
          ),
        ),
        const SizedBox(height: 32),
        ...List.generate(
          4,
              (_) => Container(
            height: 72,
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.insights_outlined, size: 56, color: Colors.grey),
            const SizedBox(height: 16),
            Text(
              'No habit history yet',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Complete a few alarms and challenges — your habit score '
                  'and trends will show up here once there\'s enough to work with.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorState({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.grey),
            const SizedBox(height: 12),
            const Text('Couldn\'t load your habit score right now.'),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}

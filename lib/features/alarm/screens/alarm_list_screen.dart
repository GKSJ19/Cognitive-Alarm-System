
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/themes/app_theme.dart';
import 'package:cognitive_alarm_platform/features/alarm/providers/alarm_provider.dart';
import '../models/alarm_model.dart';
import 'alarm_detail_screen.dart';
import 'add_alarm_screen.dart';

class AlarmListScreen extends ConsumerWidget {
  const AlarmListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alarmsAsync = ref.watch(alarmListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Alarms'),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white, // adjust to match your theme
      ),
      body: SafeArea(
        child: alarmsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text("Couldn't load alarms: $err")),
          data: (alarms) => CustomScrollView(
            slivers: [
              SliverToBoxAdapter(child: _NextAlarmHero(alarms: alarms)),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
                sliver: alarms.isEmpty
                    ? const SliverToBoxAdapter(child: _EmptyState())
                    : SliverList.separated(
                  itemCount: alarms.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, i) => _AlarmCard(
                    alarm: alarms[i],
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => AlarmDetailsScreen(alarm: alarms[i]),
                      ),
                    ),
                    onToggle: () =>
                        ref.read(alarmListProvider.notifier).toggleAlarm(alarms[i].id),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: NueraColors.dawnCoral,
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AddAlarmScreen()),
        ),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}


enum _DayPeriod { morning, afternoon, evening, night }

class _NextAlarmHero extends StatelessWidget {
  final List<AlarmModel> alarms;
  const _NextAlarmHero({required this.alarms});

  AlarmModel? get _next {
    final active = alarms.where((a) => a.isEnabled).toList()
      ..sort((a, b) => a.time.compareTo(b.time));
    return active.isEmpty ? null : active.first;
  }

  _DayPeriod _periodFor(int hour) {
    if (hour >= 5 && hour < 12) return _DayPeriod.morning;
    if (hour >= 12 && hour < 17) return _DayPeriod.afternoon;
    if (hour >= 17 && hour < 21) return _DayPeriod.evening;
    return _DayPeriod.night; // 9pm - 5am
  }

  ({String greeting, IconData icon, Color background}) _lookFor(_DayPeriod period) {
    switch (period) {
      case _DayPeriod.morning:
        return (
        greeting: 'Good morning',
        icon: Icons.wb_sunny_outlined,
        background: NueraColors.indigo,
        );
      case _DayPeriod.afternoon:
        return (
        greeting: 'Good afternoon',
        icon: Icons.wb_cloudy_outlined,
        background: NueraColors.indigo,
        );
      case _DayPeriod.evening:
        return (
        greeting: 'Good evening',
        icon: Icons.wb_twilight,
        background: NueraColors.indigo,
        );
      case _DayPeriod.night:
        return (
        greeting: 'Good night',
        icon: Icons.nightlight_round,

        background: NueraColors.indigoDeep,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final next = _next;
    final period = _periodFor(DateTime.now().hour);
    final look = _lookFor(period);

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: look.background,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(look.greeting, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 2),
                Text(
                  next == null ? 'No alarms set' : 'Next alarm',
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600),
                ),
                if (next != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    TimeOfDay.fromDateTime(next.time).format(context),
                    style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(next.label, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                ],
              ],
            ),
          ),
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(look.icon, color: Colors.white, size: 22),
          ),
        ],
      ),
    );
  }
}

class _AlarmCard extends StatelessWidget {
  final AlarmModel alarm;
  final VoidCallback onTap;
  final VoidCallback onToggle;
  const _AlarmCard({required this.alarm, required this.onTap, required this.onToggle});

  IconData get _icon {
    switch (alarm.challengeType) {
      case 'math':
        return Icons.psychology_outlined;
      case 'shake':
        return Icons.vibration;
      default:
        return Icons.bedtime_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final enabled = alarm.isEnabled;
    return Opacity(
      opacity: enabled ? 1 : 0.55,
      child: Material(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border(
                left: BorderSide(
                  color: enabled ? NueraColors.indigo : Colors.grey,
                  width: 4,
                ),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: NueraColors.indigo.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(_icon, color: NueraColors.indigo, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        TimeOfDay.fromDateTime(alarm.time).format(context),
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                      ),
                      Text(alarm.label, style: TextStyle(fontSize: 13, color: Colors.grey[600])),
                    ],
                  ),
                ),
                Switch(
                  value: enabled,
                  activeThumbColor: NueraColors.indigo,
                  onChanged: (_) => onToggle(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60),
      child: Column(
        children: [
          Icon(Icons.alarm_add_outlined, size: 56, color: Colors.grey[400]),
          const SizedBox(height: 12),
          Text('No alarms yet', style: TextStyle(fontSize: 16, color: Colors.grey[600])),
          const SizedBox(height: 4),
          Text('Tap + to set your first one', style: TextStyle(fontSize: 13, color: Colors.grey[400])),
        ],
      ),
    );
  }
}
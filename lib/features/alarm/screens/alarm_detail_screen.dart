import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';
import 'package:cognitive_alarm_platform/features/alarm/models/alarm_model.dart';
import 'package:cognitive_alarm_platform/features/alarm/providers/alarm_provider.dart';
import 'package:cognitive_alarm_platform/features/alarm/screens/edit_alarm_screen.dart';
import 'package:cognitive_alarm_platform/features/challenges/challenge_bank.dart';

class AlarmDetailsScreen extends ConsumerWidget {
  final AlarmModel alarm;
  const AlarmDetailsScreen({super.key, required this.alarm});

  static const _dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete alarm?'),
        content: Text('This will permanently remove "${alarm.label}".'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    await ref.read(alarmListProvider.notifier).removeAlarm(alarm.id);

    if (context.mounted) {
      Navigator.of(context).pop(); // back to AlarmListScreen
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final category =
    ChallengeBank.resolveCategoryFromChallengeType(alarm.challengeType);
    final repeatLabel = alarm.repeatDays.isEmpty
        ? 'One-time alarm'
        : alarm.repeatDays.map((d) => _dayLabels[d]).join(', ');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Alarm Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            tooltip: 'Edit',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => EditAlarmScreen(alarm: alarm),
                ),
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Center(
            child: Text(
              TimeOfDay.fromDateTime(alarm.time).format(context),
              style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
            ),
          ),
          Center(
            child: Text(
              alarm.label.isEmpty ? 'Alarm' : alarm.label,
              style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
            ),
          ),
          const SizedBox(height: 32),
          _DetailRow(icon: Icons.repeat, label: 'Repeat', value: repeatLabel),
          _DetailRow(
            icon: Icons.psychology_outlined,
            label: 'Challenge',
            value: category.label,
          ),
          _DetailRow(
            icon: Icons.vibration,
            label: 'Vibration',
            value: alarm.vibration ? 'On' : 'Off',
          ),
          _DetailRow(
            icon: Icons.volume_up_outlined,
            label: 'Sound',
            value: alarm.sound ? 'On' : 'Off',
          ),
          _DetailRow(
            icon: Icons.power_settings_new,
            label: 'Status',
            value: alarm.isEnabled ? 'Enabled' : 'Disabled',
          ),
          const SizedBox(height: 40),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
              ),
              onPressed: () => _confirmDelete(context, ref),
              icon: const Icon(Icons.delete_outline),
              label: const Text('Delete Alarm'),
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _DetailRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Icon(icon, color: NueraColors.indigo, size: 22),
          const SizedBox(width: 14),
          Text(label, style: const TextStyle(fontSize: 15)),
          const Spacer(),
          Text(value,
              style: TextStyle(fontSize: 15, color: Colors.grey.shade700)),
        ],
      ),
    );
  }
}

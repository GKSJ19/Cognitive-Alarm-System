import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cognitive_alarm_platform/features/alarm/screens/add_alarm_screen.dart';
import 'package:cognitive_alarm_platform/features/alarm/providers/alarm_provider.dart';

class AlarmListScreen extends ConsumerWidget {
  const AlarmListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alarms = ref.watch(alarmListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text("My Alarms"),
        centerTitle: true,
      ),
      body: alarms.isEmpty
          ? const Center(child: Text("No alarms yet. Tap + to add one."))
          : ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: alarms.length,
        separatorBuilder: (_, __) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final alarm = alarms[index];
          return Card(
            child: ListTile(
              leading: const Icon(Icons.alarm, size: 40),
              title: Text(
                alarm.time.format(context),
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              subtitle: Text(alarm.label),
              trailing: Switch(
                value: alarm.isEnabled,
                onChanged: (_) {
                  ref.read(alarmListProvider.notifier).toggleAlarm(alarm.id);
                },
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AddAlarmScreen()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
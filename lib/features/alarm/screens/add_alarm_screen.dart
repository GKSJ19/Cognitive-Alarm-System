import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cognitive_alarm_platform/core/services/notification_service.dart';
import 'package:cognitive_alarm_platform/features/alarm/models/alarm_model.dart';
import 'package:cognitive_alarm_platform/features/alarm/providers/alarm_provider.dart';
import 'package:cognitive_alarm_platform/features/challenges/challenge_category.dart';

class AddAlarmScreen extends ConsumerStatefulWidget {
  const AddAlarmScreen({super.key});

  @override
  ConsumerState<AddAlarmScreen> createState() => _AddAlarmScreenState();
}

class _AddAlarmScreenState extends ConsumerState<AddAlarmScreen> {
  TimeOfDay selectedTime = const TimeOfDay(hour: 6, minute: 30);
  final TextEditingController labelController = TextEditingController();
  ChallengeCategory selectedChallenge = ChallengeCategory.values.first;
  bool vibration = true;
  bool sound = true;
  final Set<int> selectedRepeatDays = {};

  static const _dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  void dispose() {
    labelController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final id = DateTime.now().microsecondsSinceEpoch.toString();
    final now = DateTime.now();

    DateTime scheduledTime = DateTime(
      now.year,
      now.month,
      now.day,
      selectedTime.hour,
      selectedTime.minute,
    );

    if (selectedRepeatDays.isEmpty && scheduledTime.isBefore(now)) {
      scheduledTime = scheduledTime.add(const Duration(days: 1));
    }

    final alarm = AlarmModel(
      id: id,
      time: scheduledTime,
      label: labelController.text.isEmpty ? "Alarm" : labelController.text,
      challengeType: selectedChallenge.storageKey,
      vibration: vibration,
      sound: sound,
      repeatDays: selectedRepeatDays.toList()..sort(),
    );

    try {
      await ref.read(alarmListProvider.notifier).addAlarm(alarm);

      await NotificationService.scheduleNotification(
        id: id.hashCode,
        title: "Smart Alarm",
        body: alarm.label,
        scheduledTime: scheduledTime,
      );
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Couldn't save alarm: $e")),
        );
      }
      return;
    }

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Alarm scheduled successfully!")),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Add Alarm")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Alarm Time", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: () async {
                  final TimeOfDay? pickedTime = await showTimePicker(
                    context: context,
                    initialTime: selectedTime,
                  );
                  if (pickedTime != null) {
                    setState(() {
                      selectedTime = pickedTime;
                    });
                  }
                },
                child: Text(selectedTime.format(context)),
              ),
              const SizedBox(height: 25),
              TextField(
                controller: labelController,
                decoration: const InputDecoration(
                  labelText: "Alarm Label",
                  hintText: "Morning Workout",
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 25),
              const Text("Repeat", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(
                selectedRepeatDays.isEmpty ? "One-time alarm" : "Repeats weekly",
                style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: List.generate(_dayLabels.length, (index) {
                  final isSelected = selectedRepeatDays.contains(index);
                  return FilterChip(
                    label: Text(_dayLabels[index]),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          selectedRepeatDays.add(index);
                        } else {
                          selectedRepeatDays.remove(index);
                        }
                      });
                    },
                  );
                }),
              ),
              const SizedBox(height: 25),
              const Text("Challenge Type", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              DropdownButtonFormField<ChallengeCategory>(
                decoration: const InputDecoration(border: OutlineInputBorder()),
                value: selectedChallenge,
                items: ChallengeCategory.values
                    .map((category) => DropdownMenuItem(
                  value: category,
                  child: Text(category.label),
                ))
                    .toList(),
                onChanged: (value) {
                  if (value == null) return;
                  setState(() {
                    selectedChallenge = value;
                  });
                },
              ),
              const SizedBox(height: 4),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: selectedChallenge.subtypes
                    .map((s) => Text(
                  '• $s',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ))
                    .toList(),
              ),
              const SizedBox(height: 25),
              SwitchListTile(
                title: const Text("Vibration"),
                value: vibration,
                onChanged: (value) {
                  setState(() {
                    vibration = value;
                  });
                },
              ),
              SwitchListTile(
                title: const Text("Sound"),
                value: sound,
                onChanged: (value) {
                  setState(() {
                    sound = value;
                  });
                },
              ),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _save,
                  child: const Text("Save Alarm", style: TextStyle(fontSize: 18)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
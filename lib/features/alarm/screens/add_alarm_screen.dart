import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cognitive_alarm_platform/core/services/notification_service.dart';
import 'package:cognitive_alarm_platform/features/alarm/models/alarm_model.dart';
import 'package:cognitive_alarm_platform/features/alarm/providers/alarm_provider.dart';

class AddAlarmScreen extends ConsumerStatefulWidget {
  const AddAlarmScreen({super.key});

  @override
  ConsumerState<AddAlarmScreen> createState() => _AddAlarmScreenState();
}

class _AddAlarmScreenState extends ConsumerState<AddAlarmScreen> {
  TimeOfDay selectedTime = const TimeOfDay(hour: 6, minute: 30);
  final TextEditingController labelController = TextEditingController();
  String selectedChallenge = "Math";
  bool vibration = true;
  bool sound = true;

  @override
  void dispose() {
    labelController.dispose();
    super.dispose();
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
              const SizedBox(height: 15),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: const [
                  Chip(label: Text("Mon")),
                  Chip(label: Text("Tue")),
                  Chip(label: Text("Wed")),
                  Chip(label: Text("Thu")),
                  Chip(label: Text("Fri")),
                  Chip(label: Text("Sat")),
                  Chip(label: Text("Sun")),
                ],
              ),
              const SizedBox(height: 25),
              const Text("Challenge Type", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(border: OutlineInputBorder()),
                value: selectedChallenge,
                items: const [
                  DropdownMenuItem(value: "Math", child: Text("Math")),
                  DropdownMenuItem(value: "Memory", child: Text("Memory")),
                  DropdownMenuItem(value: "Riddle", child: Text("Riddle")),
                ],
                onChanged: (value) {
                  setState(() {
                    selectedChallenge = value!;
                  });
                },
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
                  onPressed: () async {
                    final id = DateTime.now().microsecondsSinceEpoch.toString();

                    final alarm = AlarmModel(
                      id: id,
                      time: selectedTime,
                      label: labelController.text.isEmpty ? "Alarm" : labelController.text,
                      challengeType: selectedChallenge,
                      vibration: vibration,
                      sound: sound,
                    );

                    ref.read(alarmListProvider.notifier).addAlarm(alarm);

                    final now = DateTime.now();
                    DateTime scheduledTime = DateTime(
                      now.year,
                      now.month,
                      now.day,
                      selectedTime.hour,
                      selectedTime.minute,
                    );
                    if (scheduledTime.isBefore(now)) {
                      scheduledTime = scheduledTime.add(const Duration(days: 1));
                    }

                    await NotificationService.scheduleNotification(
                      id: id.hashCode,
                      title: "Smart Alarm",
                      body: alarm.label,
                      scheduledTime: scheduledTime,
                    );

                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Alarm scheduled successfully!")),
                      );
                      Navigator.pop(context);
                    }
                  },
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

import 'dart:async';

import 'package:flutter/material.dart';

import 'package:cognitive_alarm_platform/core/services/notification_service.dart';
import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';
import '../../challenges/challenge_bank.dart';
import '../../challenges/challenge_screen.dart';
import '../models/alarm_model.dart';
import '../../../core/services/sound_service.dart';

class AlarmRingingScreen extends StatefulWidget {
  final AlarmModel alarm;

  const AlarmRingingScreen({super.key, required this.alarm});

  @override
  State<AlarmRingingScreen> createState() => _AlarmRingingScreenState();
}

class _AlarmRingingScreenState extends State<AlarmRingingScreen> {
  late Timer _clockTimer;
  DateTime _now = DateTime.now();

  static const _defaultSnoozeMinutes = 5;

  @override
  void initState() {
    super.initState();
    SoundService.instance.playAlarmSound(assetPath: widget.alarm.soundPath);
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    SoundService.instance.stopAlarmSound();
    _clockTimer.cancel();
    super.dispose();
  }

  Future<void> _snooze() async {
    await SoundService.instance.stopAlarmSound();
    final notificationId = NotificationService.notificationIdFor(widget.alarm.id);
    await NotificationService.cancelNotification(notificationId);
    await NotificationService.scheduleNotification(
      id: notificationId,
      title: 'Smart Alarm',
      body: widget.alarm.label,
      scheduledTime: DateTime.now().add(const Duration(minutes: _defaultSnoozeMinutes)),
      payload: widget.alarm.id,
      playSound: widget.alarm.sound,
      enableVibration: widget.alarm.vibration,
    );
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  String get _hourMinute {
    final hour12 = _now.hour % 12 == 0 ? 12 : _now.hour % 12;
    final minute = _now.minute.toString().padLeft(2, '0');
    return '$hour12:$minute';
  }

  String get _amPm => _now.hour < 12 ? 'AM' : 'PM';

  void _startChallenge() {
    final category = ChallengeBank.resolveCategoryFromChallengeType(widget.alarm.challengeType);
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => ChallengeScreen(category: category, alarmId: widget.alarm.id),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: NueraColors.indigo,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              children: [
                const Spacer(),
                Text(
                  _hourMinute,
                  style: const TextStyle(fontSize: 72, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Text(
                  _amPm,
                  style: TextStyle(fontSize: 18, color: Colors.white.withValues(alpha: 0.7), letterSpacing: 2),
                ),
                const SizedBox(height: 16),
                Text(
                  widget.alarm.label.isEmpty ? 'Alarm' : widget.alarm.label,
                  style: const TextStyle(fontSize: 22, color: Colors.white, fontWeight: FontWeight.w500),
                  textAlign: TextAlign.center,
                ),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: NueraColors.indigo,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: _startChallenge,
                    child: const Text('Dismiss', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white54),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: _snooze,
                    child: Text(
                      'Snooze $_defaultSnoozeMinutes min',
                      style: const TextStyle(fontSize: 15, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

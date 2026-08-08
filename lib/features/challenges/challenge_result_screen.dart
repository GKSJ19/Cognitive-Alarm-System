
import 'package:flutter/material.dart';

import 'package:cognitive_alarm_platform/core/services/notification_service.dart';
import 'package:cognitive_alarm_platform/core/storage/hive_service.dart';
import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';
import '../analytics/analytics_service.dart';
import '../home/screens/home_screen.dart';
import '../../core/services/sound_service.dart';
import 'challenge_category.dart';


class ChallengeResultScreen extends StatelessWidget {
  final String alarmId;
  final ChallengeCategory category;
  final int attempts;

  const ChallengeResultScreen({
    super.key,
    required this.alarmId,
    required this.category,
    required this.attempts,
  });

  Future<void> _dismiss(BuildContext context) async {
    await SoundService.instance.stopAlarmSound();
    final dismissedAt = DateTime.now();
    final alarm = HiveService.instance.getAlarmById(alarmId);

    await AnalyticsService.instance.logDismissal(
      alarmId: alarmId,
      category: category,
      attempts: attempts,

      scheduledTime: alarm?.time ?? dismissedAt,
      dismissedAt: dismissedAt,
    );

    await NotificationService.cancelNotification(
      NotificationService.notificationIdFor(alarmId),
    );
    if (!context.mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const HomeScreen()),
          (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: NueraColors.mindGreen.withValues(alpha: 0.15),
                    ),
                    child: const Icon(Icons.check_rounded, size: 56, color: NueraColors.mindGreen),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Nice work!',
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your mind is awake now.',
                    style: TextStyle(fontSize: 15, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 36),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: NueraColors.indigo),
                      onPressed: () => _dismiss(context),
                      child: const Text('Dismiss Alarm', style: TextStyle(fontSize: 18)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
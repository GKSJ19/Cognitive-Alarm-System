import 'package:flutter/widgets.dart';
import 'package:android_alarm_manager_plus/android_alarm_manager_plus.dart';

import 'alarm_scheduler.dart';


const int _rescheduleCanaryId = 999999;

Future<void> startRescheduleCanary() async {
  await AndroidAlarmManager.periodic(
    const Duration(minutes: 15),
    _rescheduleCanaryId,
    _rescheduleCanaryCallback,
    wakeup: true,
    allowWhileIdle: true,
    rescheduleOnReboot: true,
  );
}

@pragma('vm:entry-point')
void _rescheduleCanaryCallback() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AlarmScheduler.rescheduleAll();
}
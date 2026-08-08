import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:cognitive_alarm_platform/features/alarm/models/alarm_model.dart';
import 'package:cognitive_alarm_platform/providers/core_providers.dart';
import '../../../core/services/notification_service.dart';
import '../../../core/services/alarm_scheduler.dart';


class AlarmListNotifier extends AsyncNotifier<List<AlarmModel>> {
  @override
  Future<List<AlarmModel>> build() async {
    return ref.watch(alarmRepositoryProvider).getAllAlarms();
  }

  Future<void> addAlarm(AlarmModel alarm) async {
    final repo = ref.read(alarmRepositoryProvider);
    await repo.createAlarm(alarm);
    await _syncNotification(alarm);
    state = await AsyncValue.guard(() async => repo.getAllAlarms());
  }

  Future<void> toggleAlarm(String id) async {
    final repo = ref.read(alarmRepositoryProvider);
    await repo.toggleAlarm(id);

    final updated = repo.getAllAlarms().where((a) => a.id == id);
    if (updated.isNotEmpty) {
      await _syncNotification(updated.first);
    }

    state = await AsyncValue.guard(() async => repo.getAllAlarms());
  }

  Future<void> removeAlarm(String id) async {
    final repo = ref.read(alarmRepositoryProvider);
    await NotificationService.cancelNotification(
      NotificationService.notificationIdFor(id),
    );
    await repo.deleteAlarm(id);
    state = await AsyncValue.guard(() async => repo.getAllAlarms());
  }

  Future<void> updateAlarm(AlarmModel alarm) async {
    final repository = ref.read(alarmRepositoryProvider);
    await repository.updateAlarm(alarm);
    await _syncNotification(alarm);
    state = await AsyncValue.guard(() async => repository.getAllAlarms());
  }


  Future<void> _syncNotification(AlarmModel alarm) async {
    final notificationId = NotificationService.notificationIdFor(alarm.id);
    if (alarm.isEnabled) {
      final nextTime = AlarmScheduler.nextOccurrence(alarm) ?? alarm.time;
      await NotificationService.scheduleNotification(
        id: notificationId,
        title: "Smart Alarm",
        body: alarm.label,
        scheduledTime: nextTime,
        payload: alarm.id,
        playSound: alarm.sound,
        enableVibration: alarm.vibration,
      );
    } else {
      await NotificationService.cancelNotification(notificationId);
    }
  }
}

final alarmListProvider =
AsyncNotifierProvider<AlarmListNotifier, List<AlarmModel>>(
  AlarmListNotifier.new,
);
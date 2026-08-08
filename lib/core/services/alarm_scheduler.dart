import '../../core/services/notification_service.dart';
import '../../core/storage/hive_service.dart';
import '../../repositories/alarm_repository.dart';
import '../../features/alarm/models/alarm_model.dart';

class AlarmScheduler {
  AlarmScheduler._();


  static DateTime? nextOccurrence(AlarmModel alarm, {DateTime? now}) {
    final currentTime = now ?? DateTime.now();

    if (alarm.repeatDays.isEmpty) {

      return alarm.time.isAfter(currentTime) ? alarm.time : null;
    }

    for (int daysAhead = 0; daysAhead < 8; daysAhead++) {
      final candidateDay = currentTime.add(Duration(days: daysAhead));
      final candidate = DateTime(
        candidateDay.year,
        candidateDay.month,
        candidateDay.day,
        alarm.time.hour,
        alarm.time.minute,
      );
      final weekdayIndex = candidate.weekday - 1;
      if (alarm.repeatDays.contains(weekdayIndex) && candidate.isAfter(currentTime)) {
        return candidate;
      }
    }
    return null;
  }

  static Future<void> rescheduleAll() async {
    await HiveService.instance.init();
    final alarms = HiveService.instance.getAllAlarms().where((a) => a.isEnabled);

    for (final alarm in alarms) {
      final next = nextOccurrence(alarm);
      final notificationId = NotificationService.notificationIdFor(alarm.id);

      if (next == null) {

        await HiveService.instance.saveAlarm(alarm.copyWith(isEnabled: false));
        continue;
      }

      await NotificationService.scheduleNotification(
        id: notificationId,
        title: 'Smart Alarm',
        body: alarm.label,
        scheduledTime: next,
        payload: alarm.id,
        playSound: alarm.sound,
        enableVibration: alarm.vibration,
      );
    }
  }


  static Future<void> rescheduleAllActiveAlarms(AlarmRepository repository) async {
    final alarms = repository.getAllAlarms().where((a) => a.isEnabled);

    for (final alarm in alarms) {
      final next = nextOccurrence(alarm);
      final notificationId = NotificationService.notificationIdFor(alarm.id);

      if (next == null) {
        await repository.updateAlarm(alarm.copyWith(isEnabled: false));
        continue;
      }

      await NotificationService.scheduleNotification(
        id: notificationId,
        title: 'Smart Alarm',
        body: alarm.label,
        scheduledTime: next,
        payload: alarm.id,
        playSound: alarm.sound,
        enableVibration: alarm.vibration,
      );
    }
  }
}
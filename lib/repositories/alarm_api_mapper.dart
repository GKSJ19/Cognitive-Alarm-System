// lib/repositories/alarm_api_mapper.dart
//
// Translates between the local Hive `AlarmModel` (used for on-device
// scheduling/notifications) and the backend's wire format for
// POST/PUT /v1/alarms (see Tejaswa's milestone2 AlarmCreate/AlarmUpdate/
// AlarmModel Pydantic schemas).
//
// Field mismatches this resolves:
//   - AlarmModel.isEnabled        <-> backend "is_active"
//   - AlarmModel.time (DateTime)  <-> backend "time" ("HH:MM" string)
//   - AlarmModel.repeatDays       <-> backend "days_active"
//   - AlarmModel.soundPath        -> not sent; backend only has "sound_name"
//   - AlarmModel.challengeType    -> not sent; backend only has "difficulty"
//
// OPEN QUESTION (flag to the team): the backend has no field for
// challengeType (mathematicalProblems, etc.) — only a Easy/Medium/Hard
// "difficulty". Right now this mapper sends a default difficulty and
// keeps challengeType purely local. If the backend is meant to drive
// challenge selection too, challengeType needs to be added server-side.

import 'package:cognitive_alarm_platform/features/alarm/models/alarm_model.dart';

class AlarmApiMapper {
  /// Local -> backend, for POST /v1/alarms (AlarmCreate schema).
  static Map<String, dynamic> toCreateJson(AlarmModel alarm) {
    return {
      'label': alarm.label,
      'time': _formatTime(alarm.time),
      'alarm_type': _inferAlarmType(alarm.repeatDays),
      'days_active': alarm.repeatDays,
      'is_active': alarm.isEnabled,
      'sound_name': alarm.soundPath ?? 'default',
      'snooze_duration': 5, // no local equivalent yet; backend default
      'vibration': alarm.vibration,
      'snooze_enabled': true, // no local equivalent yet; backend default
      'difficulty': alarm.difficulty,
    };
  }

  /// Local -> backend, for PUT /v1/alarms/{id} (AlarmUpdate schema).
  /// Only sends fields that make sense to update from a local edit.
  static Map<String, dynamic> toUpdateJson(AlarmModel alarm) {
    return {
      'label': alarm.label,
      'time': _formatTime(alarm.time),
      'alarm_type': _inferAlarmType(alarm.repeatDays),
      'days_active': alarm.repeatDays,
      'is_active': alarm.isEnabled,
      'sound_name': alarm.soundPath ?? 'default',
      'vibration': alarm.vibration,
      'difficulty': alarm.difficulty,
    };
  }

  /// Backend -> local. Requires a reference date to attach the "HH:MM"
  /// time string to, since the backend doesn't store a full DateTime.
  /// Pass DateTime.now() (or the alarm's next-occurrence date) as [onDate].
  static AlarmModel fromApiJson(Map<String, dynamic> json, {DateTime? onDate}) {
    final timeStr = json['time'] as String? ?? '07:00';
    final parts = timeStr.split(':');
    final hour = int.tryParse(parts[0]) ?? 7;
    final minute = parts.length > 1 ? (int.tryParse(parts[1]) ?? 0) : 0;

    final base = onDate ?? DateTime.now();
    final time = DateTime(base.year, base.month, base.day, hour, minute);

    return AlarmModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      time: time,
      label: json['label'] as String? ?? 'Alarm',
      challengeType: 'mathematicalProblems', // backend has no equivalent; local default
      vibration: json['vibration'] as bool? ?? true,
      sound: true, // backend has no boolean "sound" flag, only sound_name
      isEnabled: json['is_active'] as bool? ?? true,
      repeatDays: (json['days_active'] as List?)?.cast<int>() ?? const [],
      soundPath: json['sound_name'] as String?,
      backendId: json['_id']?.toString() ?? json['id']?.toString(),
      difficulty: json['difficulty'] as String? ?? 'Medium',
    );
  }

  /// Extracts just the backend id from a raw create/update response,
  /// for the common case of stamping an existing local AlarmModel with
  /// its backendId via copyWith rather than fully reconstructing it.
  static String? extractBackendId(Map<String, dynamic> json) {
    return json['_id']?.toString() ?? json['id']?.toString();
  }

  static String _formatTime(DateTime time) {
    final h = time.hour.toString().padLeft(2, '0');
    final m = time.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  /// Backend wants an alarm_type string; local model only tracks
  /// repeatDays. This infers a reasonable value — adjust the thresholds
  /// if your definition of "weekday"/"weekend" differs.
  static String _inferAlarmType(List<int> repeatDays) {
    if (repeatDays.isEmpty) return 'one-time';
    final allDays = {0, 1, 2, 3, 4, 5, 6};
    if (repeatDays.toSet().containsAll(allDays)) return 'daily';
    const weekdays = {0, 1, 2, 3, 4};
    const weekend = {5, 6};
    if (repeatDays.toSet().difference(weekdays).isEmpty) return 'weekday';
    if (repeatDays.toSet().difference(weekend).isEmpty) return 'weekend';
    return 'daily';
  }
}
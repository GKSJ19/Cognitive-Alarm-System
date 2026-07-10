import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cognitive_alarm_platform/features/alarm/models/alarm_model.dart';

class AlarmListNotifier extends StateNotifier<List<AlarmModel>> {
  AlarmListNotifier() : super([]);

  void addAlarm(AlarmModel alarm) {
    state = [...state, alarm];
  }

  void toggleAlarm(String id) {
    state = [
      for (final alarm in state)
        if (alarm.id == id) alarm.copyWith(isEnabled: !alarm.isEnabled) else alarm,
    ];
  }

  void removeAlarm(String id) {
    state = state.where((alarm) => alarm.id != id).toList();
  }
}

final alarmListProvider =
StateNotifierProvider<AlarmListNotifier, List<AlarmModel>>(
      (ref) => AlarmListNotifier(),
);
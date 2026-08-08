import 'package:hive/hive.dart';

part 'alarm_model.g.dart';

@HiveType(typeId: 0)
class AlarmModel {
  @HiveField(0)
  final String id;
  @HiveField(1)
  final DateTime time;
  @HiveField(2)
  final String label;
  @HiveField(3)
  final String challengeType;
  @HiveField(4)
  final bool vibration;
  @HiveField(5)
  final bool sound;
  @HiveField(6)
  final bool isEnabled;
  @HiveField(7)
  final List<int> repeatDays;
  @HiveField(8)
  final String? soundPath;

  @HiveField(9)
  final String? backendId;

  @HiveField(10)
  final String difficulty;

  /// Whether the difficulty of this alarm's challenge is being actively
  /// tuned by Member 3's Adaptive Difficulty Engine, vs. a static preset.
  /// Defaults false: until the backend actually sends `is_adaptive` on the
  /// alarm-list response (Section 5.2), we don't claim an alarm is adaptive
  /// just to make the tag show up.
  @HiveField(11)
  final bool isAdaptive;

  /// 'device' or 'server' — which mechanism actually fires this alarm.
  /// Unlike isAdaptive, this one Member 4 can set truthfully client-side:
  /// every alarm in this app is currently scheduled locally via
  /// android_alarm_manager_plus, so 'device' is the honest default today,
  /// not a stub. Update this if/when a server-triggered fallback path
  /// (FCM-based) is added.
  @HiveField(12)
  final String scheduledVia;

  AlarmModel({
    required this.id,
    required this.time,
    required this.label,
    required this.challengeType,
    required this.vibration,
    required this.sound,
    this.isEnabled = true,
    this.repeatDays = const [],
    this.soundPath,
    this.backendId,
    this.difficulty = 'Medium',
    this.isAdaptive = false,
    this.scheduledVia = 'device',
  });

  AlarmModel copyWith({
    DateTime? time,
    String? label,
    String? challengeType,
    bool? vibration,
    bool? sound,
    bool? isEnabled,
    List<int>? repeatDays,
    String? soundPath,
    String? backendId,
    String? difficulty,
    bool? isAdaptive,
    String? scheduledVia,
  }) {
    return AlarmModel(
      id: id,
      time: time ?? this.time,
      label: label ?? this.label,
      challengeType: challengeType ?? this.challengeType,
      vibration: vibration ?? this.vibration,
      sound: sound ?? this.sound,
      isEnabled: isEnabled ?? this.isEnabled,
      repeatDays: repeatDays ?? this.repeatDays,
      soundPath: soundPath ?? this.soundPath,
      backendId: backendId ?? this.backendId,
      difficulty: difficulty ?? this.difficulty,
      isAdaptive: isAdaptive ?? this.isAdaptive,
      scheduledVia: scheduledVia ?? this.scheduledVia,
    );
  }
}
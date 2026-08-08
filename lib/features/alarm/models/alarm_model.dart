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
    );
  }
}
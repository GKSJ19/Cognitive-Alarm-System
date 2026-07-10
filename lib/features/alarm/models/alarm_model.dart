import 'package:flutter/material.dart';

class AlarmModel {
  final String id;
  final TimeOfDay time;
  final String label;
  final String challengeType;
  final bool vibration;
  final bool sound;
  final bool isEnabled;

  AlarmModel({
    required this.id,
    required this.time,
    required this.label,
    required this.challengeType,
    required this.vibration,
    required this.sound,
    this.isEnabled = true,
  });

  AlarmModel copyWith({bool? isEnabled}) {
    return AlarmModel(
      id: id,
      time: time,
      label: label,
      challengeType: challengeType,
      vibration: vibration,
      sound: sound,
      isEnabled: isEnabled ?? this.isEnabled,
    );
  }
}
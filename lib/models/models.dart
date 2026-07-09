import 'package:flutter/material.dart';

enum PuzzleMode { mixed, math, memory }

extension PuzzleModeLabel on PuzzleMode {
  String get label {
    switch (this) {
      case PuzzleMode.mixed:
        return 'Mixed puzzles';
      case PuzzleMode.math:
        return 'Math only';
      case PuzzleMode.memory:
        return 'Memory only';
    }
  }
}

class Alarm {
  final String id;
  TimeOfDay time;
  PuzzleMode mode;
  bool active;
  String? lastFiredKey; // prevents re-firing within the same minute

  Alarm({
    required this.id,
    required this.time,
    required this.mode,
    this.active = true,
    this.lastFiredKey,
  });
}

class WakeLogEntry {
  final DateTime time;
  final int solveSeconds;
  final int wrongAttempts;
  final int engagementScore;

  WakeLogEntry({
    required this.time,
    required this.solveSeconds,
    required this.wrongAttempts,
    required this.engagementScore,
  });
}

/// Per-user data isolated after login, mirrors the web prototype's
/// per-username data store.
class UserData {
  final List<Alarm> alarms = [];
  final List<WakeLogEntry> log = [];
  int streak = 0;
}

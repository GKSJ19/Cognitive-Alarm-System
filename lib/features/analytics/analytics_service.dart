import 'package:hive_flutter/hive_flutter.dart';

import 'analytics_entry.dart';
import '../challenges/challenge_category.dart';

class AnalyticsService {
  AnalyticsService._();
  static final AnalyticsService instance = AnalyticsService._();

  static const _boxName = 'analytics_entries';
  Box<AnalyticsEntry>? _box;


  Future<void> init() async {
    if (!Hive.isAdapterRegistered(1)) {
      Hive.registerAdapter(AnalyticsEntryAdapter());
    }
    _box = await Hive.openBox<AnalyticsEntry>(_boxName);
  }

  Box<AnalyticsEntry> get _requireBox {
    final box = _box;
    if (box == null) {
      throw StateError('AnalyticsService.init() must be called before use');
    }
    return box;
  }

  Future<void> logDismissal({
    required String alarmId,
    required ChallengeCategory category,
    required int attempts,
    required DateTime scheduledTime,
    required DateTime dismissedAt,
  }) async {
    final entry = AnalyticsEntry(
      id: '${alarmId}_${dismissedAt.microsecondsSinceEpoch}',
      alarmId: alarmId,
      categoryKey: category.storageKey,
      attempts: attempts,
      scheduledTime: scheduledTime,
      dismissedAt: dismissedAt,
    );
    await _requireBox.put(entry.id, entry);
  }

  List<AnalyticsEntry> getAllEntries() {
    final entries = _requireBox.values.toList();
    entries.sort((a, b) => b.dismissedAt.compareTo(a.dismissedAt));
    return entries;
  }

  int currentStreak() {
    final entries = getAllEntries();
    if (entries.isEmpty) return 0;

    final days = entries
        .map((e) => DateTime(e.dismissedAt.year, e.dismissedAt.month, e.dismissedAt.day))
        .toSet();

    var cursor = DateTime.now();
    var cursorDay = DateTime(cursor.year, cursor.month, cursor.day);
    if (!days.contains(cursorDay)) {
      cursorDay = cursorDay.subtract(const Duration(days: 1));
    }

    var streak = 0;
    while (days.contains(cursorDay)) {
      streak++;
      cursorDay = cursorDay.subtract(const Duration(days: 1));
    }
    return streak;
  }

  double averageAttempts() {
    final entries = getAllEntries();
    if (entries.isEmpty) return 0;
    final total = entries.map((e) => e.attempts).reduce((a, b) => a + b);
    return total / entries.length;
  }

  Map<ChallengeCategory, int> countByCategory() {
    final counts = <ChallengeCategory, int>{};
    for (final e in getAllEntries()) {
      counts[e.category] = (counts[e.category] ?? 0) + 1;
    }
    return counts;
  }
}
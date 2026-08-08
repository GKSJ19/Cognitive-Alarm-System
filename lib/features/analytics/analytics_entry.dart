import 'package:hive/hive.dart';

import '../challenges/challenge_category.dart';

part 'analytics_entry.g.dart';

@HiveType(typeId: 1)
class AnalyticsEntry {
  @HiveField(0)
  final String id;
  @HiveField(1)
  final String alarmId;
  @HiveField(2)
  final String categoryKey;
  @HiveField(3)
  final int attempts;
  @HiveField(4)
  final DateTime scheduledTime;
  @HiveField(5)
  final DateTime dismissedAt;

  AnalyticsEntry({
    required this.id,
    required this.alarmId,
    required this.categoryKey,
    required this.attempts,
    required this.scheduledTime,
    required this.dismissedAt,
  });

  ChallengeCategory get category => ChallengeCategory.fromStorageKey(categoryKey);


  Duration get delay => dismissedAt.difference(scheduledTime);
}
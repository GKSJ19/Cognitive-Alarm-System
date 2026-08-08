
class HabitComponent {
  final String label;
  final double weight; // e.g. 0.35 for Wake-Up Consistency
  final int value; // 0-100

  const HabitComponent({
    required this.label,
    required this.weight,
    required this.value,
  });

  factory HabitComponent.fromJson(Map<String, dynamic> json) {
    return HabitComponent(
      label: json['label']?.toString() ?? '',
      weight: (json['weight'] as num?)?.toDouble() ?? 0,
      value: (json['value'] as num?)?.toInt() ?? 0,
    );
  }
}

class HabitTrendPoint {
  final DateTime date;
  final int score;
  const HabitTrendPoint({required this.date, required this.score});

  factory HabitTrendPoint.fromJson(Map<String, dynamic> json) {
    return HabitTrendPoint(
      date: DateTime.tryParse(json['date']?.toString() ?? '') ??
          DateTime.now(),
      score: (json['score'] as num?)?.toInt() ?? 0,
    );
  }
}

class HabitScoreModel {
  final int score; // 0-100 composite
  final List<HabitComponent> components;
  final List<HabitTrendPoint> trend;

  const HabitScoreModel({
    required this.score,
    required this.components,
    required this.trend,
  });

  bool get hasHistory => trend.isNotEmpty;

  factory HabitScoreModel.fromJson(Map<String, dynamic> json) {
    return HabitScoreModel(
      score: (json['score'] as num?)?.toInt() ?? 0,
      components: (json['components'] as List? ?? [])
          .map((e) => HabitComponent.fromJson(e as Map<String, dynamic>))
          .toList(),
      trend: (json['trend'] as List? ?? [])
          .map((e) => HabitTrendPoint.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  static const componentWeights = {
    'Wake-Up Consistency': 0.35,
    'Challenge Completion': 0.25,
    'Snooze Reduction': 0.20,
    'Sleep Schedule Adherence': 0.20,
  };
}
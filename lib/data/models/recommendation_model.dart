class RecommendationModel {
  final String username;
  final String? goal;

  /// Kept as a single String for backward compatibility —
  /// admin_dashboard_screen.dart reuses this same model type for
  /// unrelated admin alerts as a plain string message. The real
  /// /recommendation endpoint actually returns a *list* of strings under
  /// a lowercase "recommendation" key (not a capitalized single string),
  /// so this joins them into one display string rather than changing the
  /// field's type and risking a break elsewhere.
  final String recommendation;

  /// Raw list version, for anywhere that wants to render each tip
  /// separately instead of one joined block of text.
  final List<String> recommendations;

  RecommendationModel({
    this.username = '',
    this.goal,
    required this.recommendation,
    List<String>? recommendations,
  }) : recommendations = recommendations ?? const [];

  factory RecommendationModel.fromJson(Map<String, dynamic> json) {
    // Confirmed live shape:
    // {"username": "testuser", "goal": null, "recommendation": ["Maintain a healthy sleep schedule"]}
    final raw = json['recommendation'];
    final list = raw is List
        ? raw.map((e) => e.toString()).toList()
        : (raw != null ? [raw.toString()] : <String>[]);

    return RecommendationModel(
      username: json['username']?.toString() ?? '',
      goal: json['goal']?.toString(),
      recommendation: list.join('\n'),
      recommendations: list,
    );
  }

  Map<String, dynamic> toJson() => {
    'username': username,
    'goal': goal,
    'recommendation': recommendations,
  };
}
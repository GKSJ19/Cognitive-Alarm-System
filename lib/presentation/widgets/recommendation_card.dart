import 'package:flutter/material.dart';
import 'package:cognitive_alarm_platform/data/models/recommendation_model.dart';

/// Reusable card for displaying a single recommendation string.
/// Used on the main dashboard as well as Coach/Admin dashboards.
class RecommendationCard extends StatelessWidget {
  final RecommendationModel recommendation;

  const RecommendationCard({
    super.key,
    required this.recommendation,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.lightbulb_outline),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                recommendation.recommendation,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
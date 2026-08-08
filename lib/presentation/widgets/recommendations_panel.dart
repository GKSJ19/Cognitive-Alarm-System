import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/recommendation_provider.dart';
import '../../data/repositories/recommendation_repository.dart';


class RecommendationsPanel extends ConsumerWidget {
  const RecommendationsPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recommendationAsync = ref.watch(recommendationProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Your recommendation',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.refresh, size: 20),
              tooltip: 'Refresh',
              onPressed: () => ref.read(recommendationProvider.notifier).refresh(),
            ),
          ],
        ),
        const SizedBox(height: 8),
        recommendationAsync.when(
          loading: () => const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
          ),
          error: (err, _) => err is RecommendationNotImplementedException
              ? Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(
                    Icons.hourglass_empty,
                    color: Theme.of(context).colorScheme.outline,
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Recommendations are coming soon.',
                      style: TextStyle(fontStyle: FontStyle.italic),
                    ),
                  ),
                ],
              ),
            ),
          )
              : Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.error_outline, color: Theme.of(context).colorScheme.error),
                  const SizedBox(width: 12),
                  const Expanded(child: Text('Couldn\'t load your recommendation.')),
                  TextButton(
                    onPressed: () => ref.read(recommendationProvider.notifier).refresh(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          ),
          data: (model) => Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(model.recommendation),
            ),
          ),
        ),
      ],
    );
  }
}
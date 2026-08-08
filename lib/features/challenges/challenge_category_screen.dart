import 'package:flutter/material.dart';
import '../challenges/challenge_category.dart';
import '../challenges/challenge_screen.dart'; 


class ChallengeCategoryScreen extends StatelessWidget {
  const ChallengeCategoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Challenge')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: ChallengeCategory.values.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, i) {
          final category = ChallengeCategory.values[i];
          return Card(
            child: ListTile(
              title: Text(category.label),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ChallengeScreen(
                      alarmId: 'practice',
                      category: category,
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

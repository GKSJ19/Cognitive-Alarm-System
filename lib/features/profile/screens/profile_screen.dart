import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cognitive_alarm_platform/core/providers/auth_provider.dart';
import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';

/// Minimal profile screen. Only uses fields already confirmed elsewhere
/// in the app — home_screen.dart reads user.displayName and user.email
/// off authStateProvider, so those are safe. If your BackendUser model
/// has more fields you want shown here (avatar, streak, join date,
/// goal, etc.), add them — I deliberately didn't invent fields I
/// couldn't confirm exist.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).value;
    final displayName = user?.displayName?.isNotEmpty == true
        ? user!.displayName!
        : (user?.email ?? 'there');

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 36,
              backgroundColor: NueraColors.indigo.withValues(alpha: 0.15),
              child: Text(
                displayName.isNotEmpty ? displayName[0].toUpperCase() : '?',
                style: TextStyle(
                  fontSize: 28,
                  color: NueraColors.indigo,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              displayName,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
            ),
            if (user?.email != null) ...[
              const SizedBox(height: 4),
              Text(
                user!.email!,
                style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
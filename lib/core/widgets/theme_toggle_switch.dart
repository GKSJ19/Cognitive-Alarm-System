import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/theme_provider.dart';


class ThemeToggleSwitch extends ConsumerWidget {
  const ThemeToggleSwitch({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          isDark ? Icons.dark_mode_outlined : Icons.light_mode_outlined,
          size: 18,
        ),
        const SizedBox(width: 6),
        Switch(
          value: isDark,
          onChanged: (_) => ref.read(themeModeProvider.notifier).toggle(),
        ),
      ],
    );
  }
}
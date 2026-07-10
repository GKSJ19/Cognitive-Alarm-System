import 'package:flutter/material.dart';

import 'core/themes/app_theme.dart';
import 'features/auth/screens/splash_screen.dart';

class NueraApp extends StatelessWidget {
  const NueraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Nuera — Wake your mind',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const SplashScreen(),
    );
  }
}

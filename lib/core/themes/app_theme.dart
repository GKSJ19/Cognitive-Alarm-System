import 'package:flutter/material.dart';

class NueraColors {
  NueraColors._();

  static const Color indigo = Color(0xFF5B3FF0);
  static const Color indigoDeep = Color(0xFF241B5C);
  static const Color dawnCoral = Color(0xFFFF6B4A);
  static const Color dawnAmber = Color(0xFFFFB020);
  static const Color mindGreen = Color(0xFF34D399);
  static const Color surfaceLight = Color(0xFFF7F6FB);
  static const Color surfaceDark = Color(0xFF13111C);
}

class AppTheme {
  AppTheme._();

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      seedColor: NueraColors.indigo,
      brightness: Brightness.light,
      secondary: NueraColors.dawnCoral,
    ),
    scaffoldBackgroundColor: NueraColors.surfaceLight,
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      foregroundColor: NueraColors.indigoDeep,
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: NueraColors.indigo, width: 2),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: NueraColors.indigo,
        foregroundColor: Colors.white,
        minimumSize: const Size(120, 50),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: NueraColors.indigo.withValues(alpha: 0.08)),
      ),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.fromSeed(
      seedColor: NueraColors.indigo,
      brightness: Brightness.dark,
      secondary: NueraColors.dawnCoral,
    ),
    scaffoldBackgroundColor: NueraColors.surfaceDark,
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      foregroundColor: Colors.white,
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: NueraColors.dawnCoral,
        foregroundColor: Colors.white,
        minimumSize: const Size(120, 50),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: const Color(0xFF1D1A2B),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
      ),
    ),
  );
}
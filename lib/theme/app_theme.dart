import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Central color + typography tokens for the Lucid cognitive alarm app.
/// Mirrors the web prototype's palette: deep near-black background,
/// mint for calm/dashboard state, violet for the alarm/puzzle state.
class AppColors {
  static const bg = Color(0xFF080B14);
  static const bgElev = Color(0xFF111726);
  static const bgElev2 = Color(0xFF171F33);
  static const line = Color(0xFF232C44);
  static const text = Color(0xFFE7EBF5);
  static const textDim = Color(0xFF8892A8);
  static const mint = Color(0xFF6EE7B7);
  static const mintDim = Color(0xFF2E5C4C);
  static const violet = Color(0xFF9C8CFF);
  static const violetDim = Color(0xFF332C6B);
  static const amber = Color(0xFFF5C563);
  static const overlayBg = Color(0xFF080714);
}

class AppTextStyles {
  static TextStyle display({double size = 22, FontWeight weight = FontWeight.w600, Color? color}) =>
      GoogleFonts.spaceGrotesk(fontSize: size, fontWeight: weight, color: color ?? AppColors.text, letterSpacing: -0.3);

  static TextStyle body({double size = 14, FontWeight weight = FontWeight.w400, Color? color}) =>
      GoogleFonts.inter(fontSize: size, fontWeight: weight, color: color ?? AppColors.text);

  static TextStyle mono({double size = 14, FontWeight weight = FontWeight.w500, Color? color}) =>
      GoogleFonts.jetBrainsMono(fontSize: size, fontWeight: weight, color: color ?? AppColors.text);
}

ThemeData buildAppTheme() {
  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.bg,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.mint,
      secondary: AppColors.violet,
      surface: AppColors.bgElev,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).apply(
      bodyColor: AppColors.text,
      displayColor: AppColors.text,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.bgElev2,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.line),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.mint),
      ),
      hintStyle: AppTextStyles.body(color: AppColors.textDim),
    ),
  );
}

import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryTeal = Color(0xFF0D7D6E);
  static const Color accentAmber = Color(0xFFF59E0B);
  static const Color dangerRed = Color(0xFFE24B4A);
  static const Color successGreen = Color(0xFF639922);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryTeal,
        primary: primaryTeal,
        secondary: accentAmber,
        error: dangerRed,
        surface: Colors.white,
      ),
      fontFamily: 'DM Sans',
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: 'Syne', fontWeight: FontWeight.bold),
        displayMedium: TextStyle(fontFamily: 'Syne', fontWeight: FontWeight.bold),
        displaySmall: TextStyle(fontFamily: 'Syne', fontWeight: FontWeight.bold),
        headlineLarge: TextStyle(fontFamily: 'Syne', fontWeight: FontWeight.bold),
        headlineMedium: TextStyle(fontFamily: 'Syne', fontWeight: FontWeight.w600),
        headlineSmall: TextStyle(fontFamily: 'Syne', fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(fontFamily: 'DM Sans'),
        bodyMedium: TextStyle(fontFamily: 'DM Sans'),
        bodySmall: TextStyle(fontFamily: 'DM Sans'),
      ),
    );
  }
}

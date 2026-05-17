import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Indra Aurora — Warm Dark / Rose Pink / Luminous Gradients
class IndraAuroraTheme {
  // Unique palette
  static const Color _scaffold = Color(0xFF1A0A14);
  static const Color _card = Color(0xFF261520);
  static const Color _accent = Color(0xFFF472B6);
  static const Color _accentLight = Color(0xFFFBBF24);
  static const Color _textMuted = Color(0xFFAA7A90);
  static const Color _border = Color(0xFF3A1F30);

  static ThemeData get theme => ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: _scaffold,
    cardColor: _card,
    colorScheme: const ColorScheme.dark(
      primary: _accent,
      secondary: _accentLight,
      surface: _card,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: _scaffold,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: GoogleFonts.jetBrainsMono(
        color: _accent,
        fontSize: 12,
        fontWeight: FontWeight.bold,
        letterSpacing: 2.0,
      ),
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
      displayLarge: GoogleFonts.jetBrainsMono(color: Colors.white, fontWeight: FontWeight.bold),
      displayMedium: GoogleFonts.jetBrainsMono(color: Colors.white, fontWeight: FontWeight.bold),
      bodyLarge: GoogleFonts.inter(color: Colors.white),
      bodyMedium: GoogleFonts.inter(color: _textMuted),
      labelSmall: GoogleFonts.jetBrainsMono(color: _accent, fontWeight: FontWeight.w700, letterSpacing: 1.0),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: _scaffold,
      selectedItemColor: _accent,
      unselectedItemColor: _textMuted,
    ),
    dividerColor: _border,
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: _accent,
    ),
  );
}

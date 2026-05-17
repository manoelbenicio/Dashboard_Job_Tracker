import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Indra Glass — Deep Purple / Violet / Glassmorphism
class IndraGlassTheme {
  // Unique palette
  static const Color _scaffold = Color(0xFF0F0A1A);
  static const Color _card = Color(0xFF1A1230);
  static const Color _accent = Color(0xFFA855F7);
  static const Color _accentLight = Color(0xFFC084FC);
  static const Color _textMuted = Color(0xFF9B8BB8);
  static const Color _border = Color(0xFF2A1F45);

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
        color: _accentLight,
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
      labelSmall: GoogleFonts.jetBrainsMono(color: _accentLight, fontWeight: FontWeight.w600, letterSpacing: 1.2),
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

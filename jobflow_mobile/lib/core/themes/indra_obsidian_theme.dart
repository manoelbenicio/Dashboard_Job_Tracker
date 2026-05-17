import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Indra Obsidian — Charcoal / Ember Orange / Fintech
class IndraObsidianTheme {
  static const Color _scaffold = Color(0xFF111111);
  static const Color _card = Color(0xFF1C1C1C);
  static const Color _accent = Color(0xFFFF6B2B);
  static const Color _accentLight = Color(0xFFFF9456);
  static const Color _textMuted = Color(0xFF888888);
  static const Color _border = Color(0xFF2A2A2A);

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
      labelSmall: GoogleFonts.jetBrainsMono(color: _accent, fontWeight: FontWeight.w600, letterSpacing: 1.2),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: _scaffold,
      selectedItemColor: _accent,
      unselectedItemColor: _textMuted,
    ),
    dividerColor: _border,
  );
}

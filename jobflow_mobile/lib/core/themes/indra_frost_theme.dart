import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Indra Frost — Cool Silver / Ice Blue / Minimalist
class IndraFrostTheme {
  static const Color _scaffold = Color(0xFFEAEFF5);
  static const Color _card = Color(0xFFF8FAFB);
  static const Color _accent = Color(0xFF0EA5E9);
  static const Color _accentLight = Color(0xFF38BDF8);
  static const Color _textPrimary = Color(0xFF0F172A);
  static const Color _textMuted = Color(0xFF64748B);
  static const Color _border = Color(0xFFCBD5E1);

  static ThemeData get theme => ThemeData(
    brightness: Brightness.light,
    scaffoldBackgroundColor: _scaffold,
    cardColor: _card,
    colorScheme: const ColorScheme.light(
      primary: _accent,
      secondary: _accentLight,
      surface: _card,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: _card,
      foregroundColor: _textPrimary,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: GoogleFonts.jetBrainsMono(
        color: _accent,
        fontSize: 12,
        fontWeight: FontWeight.bold,
        letterSpacing: 2.0,
      ),
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).copyWith(
      displayLarge: GoogleFonts.jetBrainsMono(color: _textPrimary, fontWeight: FontWeight.bold),
      displayMedium: GoogleFonts.jetBrainsMono(color: _textPrimary, fontWeight: FontWeight.bold),
      bodyLarge: GoogleFonts.inter(color: _textPrimary),
      bodyMedium: GoogleFonts.inter(color: _textMuted),
      labelSmall: GoogleFonts.jetBrainsMono(color: _textMuted, fontWeight: FontWeight.w600, letterSpacing: 1.2),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: _card,
      selectedItemColor: _accent,
      unselectedItemColor: _textMuted,
      elevation: 4,
    ),
    dividerColor: _border,
  );
}

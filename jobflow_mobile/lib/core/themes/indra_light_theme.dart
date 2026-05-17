import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Indra Light — Clean White / Executive Light Mode
class IndraLightTheme {
  static const Color _scaffold = Color(0xFFF5F7FA);
  static const Color _card = Color(0xFFFFFFFF);
  static const Color _accent = Color(0xFF0066CC);
  static const Color _accentLight = Color(0xFF3399FF);
  static const Color _textPrimary = Color(0xFF1A1A2E);
  static const Color _textMuted = Color(0xFF6B7280);
  static const Color _border = Color(0xFFE5E7EB);

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
      elevation: 1,
      centerTitle: true,
      titleTextStyle: GoogleFonts.jetBrainsMono(
        color: _textPrimary,
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
      elevation: 8,
    ),
    dividerColor: _border,
  );
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Indra Pulse — Pure Black / Neon Green / Bloomberg Terminal
class IndraPulseTheme {
  // Unique palette
  static const Color _scaffold = Color(0xFF0A0A0A);
  static const Color _card = Color(0xFF141414);
  static const Color _accent = Color(0xFF00FF41);
  static const Color _accentDim = Color(0xFF00CC33);
  static const Color _textMuted = Color(0xFF666666);
  static const Color _border = Color(0xFF1E1E1E);

  static ThemeData get theme => ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: _scaffold,
    cardColor: _card,
    colorScheme: const ColorScheme.dark(
      primary: _accent,
      secondary: _accentDim,
      surface: _card,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: _scaffold,
      foregroundColor: _accent,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: GoogleFonts.jetBrainsMono(
        color: _accent,
        fontSize: 12,
        fontWeight: FontWeight.bold,
        letterSpacing: 2.0,
      ),
    ),
    textTheme: GoogleFonts.jetBrainsMonoTextTheme(ThemeData.dark().textTheme).copyWith(
      displayLarge: GoogleFonts.jetBrainsMono(color: _accent, fontWeight: FontWeight.bold, fontSize: 36),
      displayMedium: GoogleFonts.jetBrainsMono(color: _accent, fontWeight: FontWeight.bold),
      bodyLarge: GoogleFonts.jetBrainsMono(color: Colors.white),
      bodyMedium: GoogleFonts.jetBrainsMono(color: _textMuted),
      labelSmall: GoogleFonts.jetBrainsMono(color: _accentDim, fontWeight: FontWeight.w600, letterSpacing: 1.0),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: _scaffold,
      selectedItemColor: _accent,
      unselectedItemColor: _textMuted,
    ),
    dividerColor: _border,
  );
}

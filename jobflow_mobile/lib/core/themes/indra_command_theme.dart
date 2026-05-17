import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Indra Command — Deep Navy / Steel Blue / Military Precision
class IndraCommandTheme {
  // Unique palette
  static const Color _scaffold = Color(0xFF0A1628);
  static const Color _card = Color(0xFF132035);
  static const Color _accent = Color(0xFF4A90D9);
  static const Color _accentLight = Color(0xFF6BA8E8);
  static const Color _textMuted = Color(0xFF7B8FAD);
  static const Color _border = Color(0xFF1E3050);

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
        color: _textMuted,
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
      labelSmall: GoogleFonts.jetBrainsMono(color: _textMuted, fontWeight: FontWeight.w600, letterSpacing: 1.2),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: _scaffold,
      selectedItemColor: _accent,
      unselectedItemColor: _textMuted,
    ),
    dividerColor: _border,
  );
}

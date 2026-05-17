import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'indra_tokens.dart';

class IndraMatrixTheme {
  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF0A0E14), // Darker than deep for contrast
      colorScheme: const ColorScheme.dark(
        primary: IndraTokens.cyan,
        secondary: IndraTokens.teal,
        surface: IndraTokens.dark,
        background: Color(0xFF0A0E14),
        error: IndraTokens.error,
        onPrimary: IndraTokens.deep,
        onSurface: Colors.white,
      ),
      textTheme: GoogleFonts.interTextTheme(
        ThemeData.dark().textTheme,
      ).copyWith(
        // Use JetBrains Mono for display / large numbers
        displayLarge: GoogleFonts.jetBrainsMono(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
        displayMedium: GoogleFonts.jetBrainsMono(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
        // Use Inter for regular body text
        bodyLarge: GoogleFonts.inter(color: Colors.white),
        bodyMedium: GoogleFonts.inter(color: IndraTokens.light),
        labelSmall: GoogleFonts.jetBrainsMono(
          color: IndraTokens.light,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
      cardTheme: CardTheme(
        color: IndraTokens.dark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(0), // Matrix uses hard edges/terminal style
          side: const BorderSide(color: Color(0x0AFFFFFF)),
        ),
        elevation: 0,
        margin: EdgeInsets.zero,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.jetBrainsMono(
          color: IndraTokens.light,
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.0,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: IndraTokens.deep,
        selectedItemColor: IndraTokens.cyan,
        unselectedItemColor: IndraTokens.light,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }
}

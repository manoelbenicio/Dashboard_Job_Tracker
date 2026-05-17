import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'indra_command_theme.dart';
import 'indra_pulse_theme.dart';
import 'indra_glass_theme.dart';
import 'indra_matrix_theme.dart';
import 'indra_aurora_theme.dart';
import 'indra_light_theme.dart';
import 'indra_obsidian_theme.dart';
import 'indra_frost_theme.dart';

// ─────────────────────────────────────────────────────────
// 1) IndraLayout — controls DASHBOARD STRUCTURE (widgets, KPIs, arrangement)
// ─────────────────────────────────────────────────────────

enum IndraLayout {
  command('Indra Command', 'Portfolio Overview • 2×2 KPI Grid', Icons.dashboard),
  pulse('Indra Pulse', 'Bloomberg Terminal • Real-Time Feed', Icons.speed),
  glass('Indra Glass', 'Glassmorphism • Quick Actions', Icons.blur_on),
  matrix('Indra Matrix', 'Data-Dense Grid • JetBrains Mono', Icons.grid_on),
  aurora('Indra Aurora', 'Luminous Gradients • Pipeline Board', Icons.auto_awesome);

  final String displayName;
  final String subtitle;
  final IconData icon;
  const IndraLayout(this.displayName, this.subtitle, this.icon);
}

// ─────────────────────────────────────────────────────────
// 2) IndraPalette — controls ONLY COLORS (ColorScheme, ThemeData)
// ─────────────────────────────────────────────────────────

enum IndraPalette {
  command('Command Navy', 'Deep Navy / Steel Blue', Color(0xFF4A90D9)),
  pulse('Pulse Neon', 'Emerald Neon Terminal', Color(0xFF00E676)),
  glass('Glass Purple', 'Purple Glassmorphism', Color(0xFFBB86FC)),
  matrix('Matrix Teal', 'Teal Data-Dense', Color(0xFF00BCD4)),
  aurora('Aurora Rose', 'Rose Luminous Gradients', Color(0xFFFF6B9D)),
  light('Light Executive', 'Clean White Executive', Color(0xFF1976D2)),
  obsidian('Obsidian Ember', 'Charcoal Ember Fintech', Color(0xFFFF6D00)),
  frost('Frost Silver', 'Silver Ice Minimalist', Color(0xFF78909C));

  final String displayName;
  final String subtitle;
  final Color swatch;
  const IndraPalette(this.displayName, this.subtitle, this.swatch);

  ThemeData get themeData {
    switch (this) {
      case IndraPalette.command:
        return IndraCommandTheme.theme;
      case IndraPalette.pulse:
        return IndraPulseTheme.theme;
      case IndraPalette.glass:
        return IndraGlassTheme.theme;
      case IndraPalette.matrix:
        return IndraMatrixTheme.theme;
      case IndraPalette.aurora:
        return IndraAuroraTheme.theme;
      case IndraPalette.light:
        return IndraLightTheme.theme;
      case IndraPalette.obsidian:
        return IndraObsidianTheme.theme;
      case IndraPalette.frost:
        return IndraFrostTheme.theme;
    }
  }
}

// ─────────────────────────────────────────────────────────
// 3) IndraThemeState — holds BOTH layout + palette independently
// ─────────────────────────────────────────────────────────

class IndraThemeState {
  final IndraLayout layout;
  final IndraPalette palette;

  const IndraThemeState({
    this.layout = IndraLayout.matrix,
    this.palette = IndraPalette.matrix,
  });

  IndraThemeState copyWith({IndraLayout? layout, IndraPalette? palette}) {
    return IndraThemeState(
      layout: layout ?? this.layout,
      palette: palette ?? this.palette,
    );
  }

  ThemeData get themeData => palette.themeData;
}

// ─────────────────────────────────────────────────────────
// 4) ThemeNotifier — persists layout + palette independently
// ─────────────────────────────────────────────────────────

class ThemeNotifier extends StateNotifier<IndraThemeState> {
  ThemeNotifier() : super(const IndraThemeState()) {
    _loadSaved();
  }

  static const _layoutKey = 'selected_layout';
  static const _paletteKey = 'selected_palette';
  // Legacy key for backward compatibility
  static const _legacyKey = 'selected_theme';

  Future<void> _loadSaved() async {
    final prefs = await SharedPreferences.getInstance();

    // Try new keys first
    final savedLayout = prefs.getString(_layoutKey);
    final savedPalette = prefs.getString(_paletteKey);

    if (savedLayout != null && savedPalette != null) {
      // New format — load both
      final layout = IndraLayout.values.firstWhere(
        (l) => l.name == savedLayout,
        orElse: () => IndraLayout.matrix,
      );
      final palette = IndraPalette.values.firstWhere(
        (p) => p.name == savedPalette,
        orElse: () => IndraPalette.matrix,
      );
      state = IndraThemeState(layout: layout, palette: palette);
    } else {
      // Legacy migration — old single key maps to both
      final legacy = prefs.getString(_legacyKey);
      if (legacy != null) {
        final layout = IndraLayout.values.firstWhere(
          (l) => l.name == legacy,
          orElse: () => IndraLayout.matrix,
        );
        final palette = IndraPalette.values.firstWhere(
          (p) => p.name == legacy,
          orElse: () => IndraPalette.matrix,
        );
        state = IndraThemeState(layout: layout, palette: palette);
        // Migrate to new format
        await prefs.setString(_layoutKey, layout.name);
        await prefs.setString(_paletteKey, palette.name);
      }
    }
  }

  Future<void> setLayout(IndraLayout layout) async {
    state = state.copyWith(layout: layout);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_layoutKey, layout.name);
  }

  Future<void> setPalette(IndraPalette palette) async {
    state = state.copyWith(palette: palette);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_paletteKey, palette.name);
  }
}

// ─────────────────────────────────────────────────────────
// 5) Providers
// ─────────────────────────────────────────────────────────

final themeProvider = StateNotifierProvider<ThemeNotifier, IndraThemeState>((ref) {
  return ThemeNotifier();
});

// Convenience providers for easy access
final layoutProvider = Provider<IndraLayout>((ref) {
  return ref.watch(themeProvider).layout;
});

final paletteProvider = Provider<IndraPalette>((ref) {
  return ref.watch(themeProvider).palette;
});

// ──────────────────────────────────────────────────────────
// BACKWARD COMPATIBILITY — keep IndraTheme available but deprecated
// This prevents breaking existing imports during migration.
// ──────────────────────────────────────────────────────────

@Deprecated('Use IndraLayout + IndraPalette instead')
typedef IndraTheme = IndraPalette;

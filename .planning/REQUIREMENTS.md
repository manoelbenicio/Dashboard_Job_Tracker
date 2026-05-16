# Milestone v3.1 Requirements: Indra Design System — Layout & Palette Decoupling

## 1. Settings & Configuration
- [ ] **CFG-01**: Restore Gemini API key input field in Settings screen with secure storage via SharedPreferences
- [ ] **CFG-02**: Settings screen displays two independent sections: "Layout" and "Color Palette"
- [ ] **CFG-03**: Both layout and palette selections persist independently via SharedPreferences

## 2. Architecture — Decoupled Theme System
- [ ] **THEME-01**: Create `IndraLayout` enum (command, pulse, glass, matrix, aurora) — controls dashboard widget structure
- [ ] **THEME-02**: Create `IndraPalette` enum (teal_corporate, emerald_neon, purple_glass, cyan_matrix, rose_aurora, plus existing: light, obsidian, frost) — controls only ColorScheme
- [ ] **THEME-03**: Refactor `ThemeNotifier` to hold two independent state values: active layout + active palette
- [ ] **THEME-04**: Each `IndraPalette` generates a `ThemeData` with only color tokens — no layout/structure changes

## 3. Dashboard Layouts — Full KPI Parity
- [ ] **LAYOUT-01**: Indra Command layout — Portfolio Overview header, 2×2 KPI grid (Dominance, Applications, Response Rate, Interviews), Application Trend chart, Active Pipelines list
- [ ] **LAYOUT-02**: Indra Pulse layout — Market Dominance Index hero metric, 3-column mini KPIs (Sent, Response, Offers) with sparkline bars, Real-Time Feed activity list
- [ ] **LAYOUT-03**: Indra Glass layout — Dominance Probability hero with badges, 2×2 KPI grid (Applications, Response Rate, Interviews, Avg Response), Quick Actions section
- [ ] **LAYOUT-04**: Indra Matrix layout — Data-dense 2×3 KPI grid with delta indicators, Target/Stage/Status pipeline table, JetBrains Mono typography throughout
- [ ] **LAYOUT-05**: Indra Aurora layout — Dominance Probability hero with Top Global badge, 4-column mini KPIs, Pipeline Board with horizontal scroll columns

## 4. Color Palette Independence
- [ ] **PAL-01**: User can change color palette without affecting the active layout structure
- [ ] **PAL-02**: User can change layout without affecting the active color palette
- [ ] **PAL-03**: All layout widgets consume colors exclusively from `Theme.of(context).colorScheme` — no hardcoded color values

## Traceability

| REQ-ID | Phase |
|--------|-------|
| CFG-01 | 23 |
| CFG-02 | 25 |
| CFG-03 | 25 |
| THEME-01 | 23 |
| THEME-02 | 23 |
| THEME-03 | 23 |
| THEME-04 | 23 |
| LAYOUT-01 | 24 |
| LAYOUT-02 | 24 |
| LAYOUT-03 | 24 |
| LAYOUT-04 | 24 |
| LAYOUT-05 | 24 |
| PAL-01 | 25 |
| PAL-02 | 25 |
| PAL-03 | 24 |

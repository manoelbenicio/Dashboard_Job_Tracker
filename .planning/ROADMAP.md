# Milestone v3.1 Roadmap: Indra Design System — Layout & Palette Decoupling

**3 phases** | **16 requirements mapped** | All covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 23 | Theme Architecture & Settings Fix | Decouple IndraLayout from IndraPalette, restore API key field | CFG-01, THEME-01, THEME-02, THEME-03, THEME-04 | 5 |
| 24 | 5 Dashboard Layouts | Implement all 5 distinct dashboard layouts with full KPI parity | LAYOUT-01 to LAYOUT-05, PAL-03 | 6 |
| 25 | Settings UI — Dual Selectors | Build separate Layout Selector and Palette Selector in Settings | CFG-02, CFG-03, PAL-01, PAL-02 | 4 |

---

### Phase Details

**Phase 23: Theme Architecture & Settings Fix**
Goal: Decouple IndraLayout from IndraPalette and restore API key field
Requirements: CFG-01, THEME-01, THEME-02, THEME-03, THEME-04
Success criteria:
1. API key field is visible and functional in Settings screen
2. `IndraLayout` enum exists with 5 values (command, pulse, glass, matrix, aurora)
3. `IndraPalette` enum exists with 8+ color palettes
4. `ThemeNotifier` stores layout and palette independently
5. Changing palette does NOT alter dashboard widget structure

**Phase 24: 5 Dashboard Layouts**
Goal: Implement all 5 distinct dashboard layouts with full KPI parity per mockups
Requirements: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, LAYOUT-05, PAL-03
Success criteria:
1. Command layout renders Portfolio Overview + 2×2 KPI grid + trend chart + pipelines
2. Pulse layout renders Market Dominance hero + 3-col mini KPIs + Real-Time Feed
3. Glass layout renders Dominance Probability hero + badges + 2×2 KPIs + Quick Actions
4. Matrix layout renders data-dense 2×3 grid + pipeline table in JetBrains Mono
5. Aurora layout renders hero + 4-col KPIs + horizontal Pipeline Board
6. All layouts use only `Theme.of(context).colorScheme` — zero hardcoded colors

**Phase 25: Settings UI — Dual Selectors**
Goal: Build the two independent selectors in Settings for layout and palette
Requirements: CFG-02, CFG-03, PAL-01, PAL-02
Success criteria:
1. Settings shows "Dashboard Layout" section with 5 layout options and preview
2. Settings shows "Color Palette" section with 8+ palette options and color swatches
3. Changing layout preserves current palette; changing palette preserves current layout
4. Both selections persist across app restarts

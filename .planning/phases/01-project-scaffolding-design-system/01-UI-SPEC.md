---
phase: 1
name: Project Scaffolding & Design System
status: approved
revision: 0
dimensions:
  spacing: pass
  typography: pass
  color: pass
  copywriting: pass
  interaction: pass
  consistency: pass
---

# UI-SPEC — Phase 1: Project Scaffolding & Design System

## Stitch Prototypes

- **Dashboard Screen**: `projects/16468924275197107240/screens/f55497c5a93a4a23946df09ec3e5384d`
- **Design System Asset**: `assets/fefa03855ea047e8ac5899f7f723ed76` ("Emerald Executive")
- **Stitch Project**: `projects/16468924275197107240`

## Creative North Star

**"The Executive Lens"** — A high-end physical workspace aesthetic. Dark obsidian and frosted glass where information doesn't just sit; it *breathes*. Intentional asymmetry and tonal depth. Layering rather than lines. Authoritative, calm, and premium.

## 1. Color System

### Surface Hierarchy (elevation by light)
| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#111319` | Base layer / page background |
| `surface-container-lowest` | `#0c0e14` | Input fields, deepest recessed areas |
| `surface-container-low` | `#191b22` | Sidebar, structural sections |
| `surface-container` | `#1e1f26` | Standard cards |
| `surface-container-high` | `#282a30` | Elevated elements, hover states |
| `surface-container-highest` | `#33343b` | Active/focused elements |
| `surface-variant` | `#33343b` | Glass panels (at 60% opacity + blur) |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#4edea3` | Primary accent, active states |
| `primary-container` | `#10b981` | Gradient start, fills |
| `secondary` | `#9ed2b5` | Secondary accent |
| `tertiary` | `#ffb3af` | Warning/pending states |
| `error` | `#ffb4ab` | Error states |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `on-surface` | `#e2e2eb` | Primary text (NEVER use #FFF) |
| `on-surface-variant` | `#bbcabf` | Secondary/muted text |
| `on-primary` | `#003824` | Text on primary backgrounds |
| `outline` | `#86948a` | Subtle borders |
| `outline-variant` | `#3c4a42` | Ghost borders (at 15% opacity) |

### Rules
- **No-Line Rule**: No 1px borders for section separation — use background tonal shifts instead
- **Glass & Gradient Rule**: Floating elements use `surface-variant` at 60% opacity + `backdrop-blur: 12-20px`
- **Emerald gradients**: `primary-container` → `primary` at 135° angle (never flat fills)
- **Glass Stroke**: Premium cards get 1px inner-border using `white` at 10% opacity

## 2. Typography

**Font**: Inter (Google Fonts) — editorial intent, not utilitarian
**Data Font**: JetBrains Mono — for numbers, KPI values, metrics

| Scale | Size | Weight | Letter-spacing | Usage |
|-------|------|--------|----------------|-------|
| Display | 48px | 800 | -0.02em | Hero KPI numbers |
| Headline | 32px | 700 | -0.02em | Page titles |
| Title | 20px | 600 | normal | Card headings |
| Title-sm | 16px | 600 | normal | Nav items, sub-headings |
| Body | 14px | 400 | normal | Content text |
| Label-md | 12px | 500 | normal | Metadata, timestamps |
| Label-sm | 11px | 500 | 0.1em | All-caps section headers |

### Rules
- Negative letter-spacing on Display/Headline makes text feel "tight and expensive"
- Label-sm headers use ALL CAPS for grouping sections
- JetBrains Mono exclusively for numerical data (KPIs, salaries, dates)

## 3. Spacing System

**Base unit**: 8px grid

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4px | Inline gaps |
| `space-sm` | 8px | Inner padding |
| `space-md` | 16px | Card padding |
| `space-lg` | 24px | Section gaps |
| `space-xl` | 32px | Major section gaps |
| `space-2xl` | 40px | Between dashboard sections (minimum) |
| `space-3xl` | 48px | Page margins |

### Rules
- **Embrace Negative Space**: Minimum 40px between major dashboard sections
- **Activity feed**: 24-32px vertical whitespace between entries (NO divider lines)
- **Card internal padding**: 24px minimum

## 4. Components

### Sidebar Navigation
- Width: 240px, fixed/sticky
- Background: `surface-container-low` (#191b22)
- Active state: 4px vertical emerald pill on far-left + `on-surface` text color
- Inactive: `on-surface-variant` text
- Items: `title-sm` weight
- Group headers: `label-sm`, ALL CAPS, 0.1em letter-spacing
- Logo: "JobFlow" in bold white + "EXECUTIVE SUITE" in `label-sm`

### KPI Cards
- Background: `surface-container` + glass stroke (1px white/10%)
- Border radius: 16px (rounded-2xl)
- Hero number: 48px/800, JetBrains Mono
- Trend arrow: emerald for up, tertiary for down
- Progress bar: thin 2px line at bottom, emerald gradient
- Hover: elevate to `surface-container-high`, 300ms transition

### Charts
- **AreaChart**: Emerald gradient fill (primary-container → primary/20%)
- **Donut**: Center label with percentage, color-coded segments
- Chart container: `surface-container` background, same glass card style
- Labels/axes: `on-surface-variant`, `label-md` size

### Buttons
- **Primary**: Gradient fill `primary-container` → `primary`, rounded-md (0.75rem), `on-primary` text
- **Secondary (Glass)**: `white/5` background + backdrop-blur, ghost border
- **Tertiary**: Text-only in `primary` color

### Input Fields
- Background: `surface-container-lowest` (#0c0e14)
- Border radius: 0.25rem (sm)
- Label: `label-md` ABOVE the field (never floating/inside)
- Focus: ghost border shifts to `outline`

### Status Chips
- Background: `surface-container-high`
- Small 6px status dot (color-coded)
- Text: `label-md` weight
- No heavy color fills

### Activity Feed
- No divider lines — whitespace separation only
- Hover: background shifts to `surface-container-low`
- Timestamps: `label-md` in `on-surface-variant`
- 300ms ease-in-out transitions

## 5. Interaction & Animation

### Entry Animations
- **Cards**: Staggered fadeInUp (50ms delay between cards)
  ```css
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  ```
- **KPI numbers**: CountUp animation from 0 to value (800ms, ease-out)
- **Charts**: Draw-in animation on mount (1000ms)

### Hover States
- All interactive elements: 300ms ease-in-out transition
- Cards: tonal lift to next surface tier + subtle scale(1.01)
- Nav items: text color shift to `on-surface`

### Drag (Kanban — future reference)
- Card elevates with ambient shadow: `0 20px 40px rgba(0,0,0,0.4)`
- Origin column dims slightly
- Target column gets subtle emerald border glow

## 6. Layout

### App Shell
```
┌────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌───────────────────────────────────────┐ │
│ │          │ │ Search Bar          [Bell] [Settings]  │ │
│ │ SIDEBAR  │ ├───────────────────────────────────────┤ │
│ │ 240px    │ │                                       │ │
│ │ fixed    │ │          MAIN CONTENT                 │ │
│ │          │ │          (scrollable)                  │ │
│ │          │ │                                       │ │
│ │          │ │                                       │ │
│ └──────────┘ └───────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Dashboard Grid
- 4 KPI cards: CSS Grid `grid-template-columns: repeat(4, 1fr)`, gap 24px
- Charts row: 2 columns (70% AreaChart / 30% Donut), gap 24px
- Activity feed: full width below charts

### Responsive
- Desktop: full sidebar + content
- Tablet (≤1024px): collapsible sidebar (icon-only, 64px)
- Below 768px: sidebar overlay/drawer

## Do's and Don'ts

### ✅ Do
- Use tonal layering for depth (not shadows)
- Allow generous whitespace between sections (40px+)
- Use 300ms ease-in-out for ALL transitions
- Use glass stroke (1px white/10%) on premium cards
- Maintain backdrop-blur consistency across glass layers

### ❌ Don't
- Use `#FFFFFF` — use `on-surface` (#e2e2eb) instead
- Use standard `box-shadow: 0 2px 4px` — looks cheap
- Use divider lines — use whitespace and tonal shifts
- Crowd the sidebar — keep navigation sparse
- Use flat emerald fills — always gradient (135°)

---
*Generated from Google Stitch "Emerald Executive" design system*
*Stitch Project: 16468924275197107240*

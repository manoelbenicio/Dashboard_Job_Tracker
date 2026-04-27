# Stack Research — Job Application Tracker

## Recommended Stack (2025/2026)

### Frontend Framework
- **React 19.1+** — Latest stable with Suspense, use() hook, Actions API
- **Vite 6.x** — Fast HMR, ESBuild bundling, native ESM
- **Confidence**: High — industry standard, massive ecosystem

### UI Component Library
- **shadcn/ui 2.x** — Copy-paste components built on Radix UI primitives
- **Radix UI** — Accessible, unstyled primitives (underlying shadcn)
- **Why**: Per project skills — shadcn-first approach, `cn()` utility, semantic colors
- **Confidence**: High

### Styling
- **Tailwind CSS 4.x** — Utility-first, JIT compilation
- **CSS Variables** — For design tokens and theming
- **Why**: Native dark mode support, composable with shadcn
- **Confidence**: High

### Charts & Visualization
- **Recharts 2.x** — React-native charting, composable API
- **Alternatives considered**: Victory (heavier), Nivo (complex), Chart.js (imperative)
- **Why**: Best React integration, supports AreaChart, PieChart, RadarChart
- **Confidence**: High

### AI Integration
- **@google/genai 1.x** — Official Google GenAI JavaScript SDK
- **Models**: gemini-2.5-flash (speed), gemini-3-pro-preview (reasoning), gemini-3-pro-image-preview (multimodal)
- **Why**: Direct API access, streaming support, multimodal capabilities
- **Confidence**: High

### State Management
- **React Context + useReducer** — Built-in, no extra dependencies
- **LocalStorage** — Persistence layer via custom hook
- **Why**: Single-user app, no need for Redux/Zustand complexity
- **Confidence**: High

### Icons
- **Lucide React** — Fork of Feather Icons, tree-shakeable, consistent style
- **Confidence**: High

### Typography
- **Inter** (Google Fonts) — Primary UI font, excellent readability
- **JetBrains Mono** (Google Fonts) — Monospace for data/numbers
- **Confidence**: High

### Drag & Drop
- **@dnd-kit/core + @dnd-kit/sortable** — Modern React DnD, accessible, performant
- **Why**: Best React 18/19 compatibility, touch support, smooth animations
- **Confidence**: High

### What NOT to Use
- ❌ Next.js — Overkill for client-side SPA, adds SSR complexity
- ❌ Redux/MobX — Unnecessary for single-user local app
- ❌ Styled Components — Conflicts with Tailwind approach
- ❌ D3.js directly — Too low-level, Recharts wraps it nicely
- ❌ Material UI — Opinionated design conflicts with custom glassmorphism

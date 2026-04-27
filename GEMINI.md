<!-- GSD:project-start source:PROJECT.md -->
## Project

**JobFlow**

JobFlow is a premium, agentic job application tracker that combines an executive-grade dashboard, drag-and-drop Kanban board, and AI-powered career assistance into a single web application. It helps job seekers manage their entire job search pipeline — from application to offer — with the visual polish of a Fortune 500 boardroom tool and the intelligence of a personal career coach powered by Google Gemini.

**Core Value:** A user can track their job applications through a visually stunning, data-rich interface and receive AI-powered assistance (cover letters, resume analysis, interview prep, career coaching) at every stage of their job search.

### Constraints

- **Tech Stack**: React 19 + Vite + Tailwind CSS + shadcn/ui + Recharts + Lucide React + @google/genai
- **Typography**: Inter (primary) + JetBrains Mono (data/numbers)
- **Design**: Dark mode first (#0F1117 base), glassmorphism, gradient accents, staggered animations
- **Components**: shadcn/ui first (per SKILL.md — never custom buttons if shadcn exists), cn() utility, semantic colors
- **Framework**: GSD (Get Shit Done) — always all steps for every phase
- **Prototyping**: Google Stitch screens generated BEFORE writing React code
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

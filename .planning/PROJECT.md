# JobFlow

## What This Is

JobFlow is a premium, agentic job application tracker that combines an executive-grade dashboard, drag-and-drop Kanban board, and AI-powered career assistance into a single web application. It helps job seekers manage their entire job search pipeline — from application to offer — with the visual polish of a Fortune 500 boardroom tool and the intelligence of a personal career coach powered by Google Gemini.

## Core Value

A user can track their job applications through a visually stunning, data-rich interface and receive AI-powered assistance (cover letters, resume analysis, interview prep, career coaching) at every stage of their job search.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Executive dashboard with KPI cards, trend charts, and activity feed
- [ ] Job CRUD (create, read, update, delete) with modal forms
- [ ] Job list view with filtering by status and origin
- [ ] Next-gen Kanban board with drag-and-drop status updates
- [ ] AI cover letter generator using Gemini 2.5 Flash
- [ ] AI interview guide generator
- [ ] Intelligent resume builder with split-screen editor and live A4 preview
- [ ] Multimodal AI resume parsing (image/PDF → structured data) via Gemini 3 Pro
- [ ] AI avatar generator (selfie → corporate headshot)
- [ ] "Claire" AI career companion with context-aware chat
- [ ] Dark mode glassmorphism design system with premium animations
- [ ] Google Stitch MCP prototyping for all screens before implementation
- [ ] LocalStorage persistence for all application state
- [ ] Sticky sidebar navigation (Dashboard, Jobs, Kanban, Resume, Settings)
- [ ] Responsive layout (desktop-first, tablet support)

### Out of Scope

- Backend/server — fully client-side with LocalStorage (no database)
- User authentication — single-user local app
- Mobile-first design — executive dashboards are desktop-first per design skills
- Deployment/hosting — local dev only for v1

## Context

- **Design System**: 63 world-class expert skills in `data_expert_skills/` covering dashboards, UX/UI, data visualization, animations, layout patterns, chart selection, shadcn/ui, and Google Stitch integration
- **AI Models**: Google Gemini via `@google/genai` SDK — gemini-2.5-flash (speed), gemini-3-pro-preview (reasoning), gemini-3-pro-image-preview (multimodal)
- **MCP Servers**: Google Stitch (UI generation) + Google Developer Knowledge (API docs)
- **Design Philosophy**: Fortune 500 Boardroom Test — every screen must command respect and immediate comprehension when projected on a boardroom screen
- **Existing Files**: Utility scripts from GCP auth session (test_opus.py, delete_projects.py, etc.) — not part of JobFlow codebase
- **Idea Document**: Full enhanced prompt at `JOBFLOW_PROMPT.md` with detailed specs for both phases

## Constraints

- **Tech Stack**: React 19 + Vite + Tailwind CSS + shadcn/ui + Recharts + Lucide React + @google/genai
- **Typography**: Inter (primary) + JetBrains Mono (data/numbers)
- **Design**: Dark mode first (#0F1117 base), glassmorphism, gradient accents, staggered animations
- **Components**: shadcn/ui first (per SKILL.md — never custom buttons if shadcn exists), cn() utility, semantic colors
- **Framework**: GSD (Get Shit Done) — always all steps for every phase
- **Prototyping**: Google Stitch screens generated BEFORE writing React code

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React 19 + Vite over Next.js | Client-side SPA, no SSR needed, faster HMR | — Pending |
| shadcn/ui over custom components | Per expert skills — reusable, accessible, themeable | — Pending |
| LocalStorage over backend DB | v1 is local-only, minimize infrastructure complexity | — Pending |
| Dark mode first | Executive dashboard best practice per fortune500 skill | — Pending |
| Google Stitch for prototyping | AI-powered screen generation before coding — design drives implementation | — Pending |
| Two-phase delivery (A then B) | Foundation first, then AI suite — reduces coupling | — Pending |
| Gemini models over alternatives | Already integrated in GCP environment, multi-model approach by task | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-27 after initialization*

# JobFlow

## What This Is

JobFlow is a premium, agentic job application tracker that combines an executive-grade dashboard, drag-and-drop Kanban board, and AI-powered career assistance into a single web application. It helps job seekers manage their entire job search pipeline — from application to offer — with the visual polish of a Fortune 500 boardroom tool and the intelligence of a personal career coach powered by Google Gemini.

**🌐 Live at: https://jobflow-exec-tracker.web.app**

## Core Value

A user can track their job applications through a visually stunning, data-rich interface and receive AI-powered assistance (cover letters, resume analysis, interview prep, career coaching) at every stage of their job search — all behind secure Firebase Authentication and deployed to the cloud.

## Current Milestone: v4.0 Clean Architecture & Advanced Polish

**Goal:** Transition the codebase to a modular, domain-driven structure while implementing Fortune 500-grade advanced animations, tablet/desktop responsive adaptations, and native platform integrations.

**Target features:**
- Complete the Clean Architecture overhaul (Domain/Data/Presentation layers)
- Implement advanced Hero transitions, staggered lists, and micro-interactions
- Support seamless responsive breakpoints for Tablet and Desktop viewports
- Implement native platform channels (deep linking, native share sheets)

## Requirements

### Validated ✅

- [x] Executive dashboard with KPI cards, trend charts, and activity feed (Phase 2)
- [x] Job CRUD (create, read, update, delete) with modal forms (Phase 3)
- [x] Job list view with filtering by status and origin (Phase 3)
- [x] Next-gen Kanban board with drag-and-drop status updates (Phase 4)
- [x] AI cover letter generator using Gemini 2.5 Flash (Phase 5)
- [x] AI interview guide generator (Phase 5)
- [x] Intelligent resume builder with split-screen editor and live preview (Phase 6)
- [x] "Claire" AI career companion with context-aware chat (Phase 7)
- [x] Dark mode glassmorphism design system with premium animations (Phase 1)
- [x] LocalStorage persistence for all application state (Phase 3)
- [x] Sticky sidebar navigation (Dashboard, Jobs, Kanban, Resume, Settings) (Phase 1)
- [x] Firebase Authentication — Email/Password + Google Sign-In (Phase 9)
- [x] User data isolation — UID-scoped LocalStorage (Phase 9)
- [x] Firebase Hosting deployment — live at *.web.app (Phase 10)
- [x] Theme switching — Dark + Light mode (Phase 1)
- [x] PDF export from Resume Builder (Phase 6)
- [x] Interactive Radar/Spider charts for Market Positioning Score (Phase 14)
- [x] Visual Market Position Map vs Fortune 100/Big Tech (Phase 14)
- [x] Distinctiveness Heatmap / highlight cards (Phase 15)
- [x] Risk Matrix visualization with severity indicators (Phase 15)
- [x] Dominance Probability Gauge with global ranking (Phase 14)
- [x] Interactive Gap Analysis showing current vs target state (Phase 15)
- [x] Dynamic KPI cards integrated with expert skills metrics (Phase 16)

### Deferred to Backlog

- [ ] Multimodal AI resume parsing (image/PDF → structured data) via Gemini 3 Pro
- [ ] AI avatar generator (selfie → corporate headshot)
- [ ] LinkedIn URL auto-import for job data extraction (999.1)
- [ ] Interview calendar integration for Outlook/Gmail (999.2)

### Out of Scope

- Backend database — fully client-side with UID-scoped LocalStorage
- Job board scraping — legal complexity
- Mobile-first design — executive dashboards are desktop-first

## Context

- **Design System**: Emerald Executive with glassmorphism, gradient accents, CSS custom properties
- **AI Models**: Google Gemini 2.5 Flash via `@google/genai` SDK
- **Auth**: Firebase Auth (Email/Password + Google Sign-In) on `jobflow-exec-tracker`
- **Hosting**: Firebase Hosting at `jobflow-exec-tracker.web.app`
- **Account**: `mbenicios.filho82@gmail.com`
- **Design Philosophy**: Fortune 500 Boardroom Test — every screen must command respect

## Constraints

- **Tech Stack**: React 19 + Vite 6 + Tailwind CSS 4 + Recharts + Lucide React + @google/genai + Firebase
- **Typography**: Inter (primary) + JetBrains Mono (data/numbers)
- **Design**: Dark mode first (#0F1117 base), glassmorphism, gradient accents, staggered animations
- **Framework**: GSD (Get Shit Done) — all steps for every phase
- **Deployment**: Firebase Hosting with SPA rewrites

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React 19 + Vite over Next.js | Client-side SPA, no SSR needed | ✅ Correct — fast HMR, clean build |
| LocalStorage over backend DB | v1 is local-only per user | ✅ Correct — UID-scoping solved multi-user |
| Dark mode first | Executive dashboard best practice | ✅ Correct — stunning visual impact |
| Gemini 2.5 Flash for AI | Best speed/quality for real-time gen | ✅ Correct — sub-second responses |
| Firebase Auth over custom | Zero backend, industry standard | ✅ Correct — 15 min integration |
| Firebase Hosting | Free SSL, CDN, SPA rewrites | ✅ Correct — zero-config deploy |
| @dnd-kit for Kanban | Modern React DnD, touch support | ✅ Correct — smooth animations |
| UID-scoped LocalStorage | Data isolation without backend | ✅ Correct — per-user data works |

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
*Last updated: 2026-05-17 — Starting Milestone v4.0*

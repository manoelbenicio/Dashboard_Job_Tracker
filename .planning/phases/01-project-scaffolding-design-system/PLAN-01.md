---
phase: 1
plan: 1
name: Project Scaffolding & Design System
status: draft
wave: 1
tasks_total: 8
tasks_done: 0
created: 2026-04-27
---

# PLAN 01-01: Project Scaffolding & Design System

## Objective
Scaffold the React 19 + Vite application, install all dependencies, configure Tailwind CSS + shadcn/ui, implement the dark glassmorphism design system from UI-SPEC, and build the app shell with sidebar navigation.

## Context
- UI-SPEC: `.planning/phases/01-project-scaffolding-design-system/01-UI-SPEC.md`
- Design System: "Emerald Executive" from Google Stitch
- Requirements: DS-01, DS-02, DS-03, DS-04, DS-05

## Tasks

### Wave 1: Project Setup
- [ ] **T1**: Scaffold React 19 + Vite project with `npx create-vite@latest`
- [ ] **T2**: Install dependencies: tailwindcss, @radix-ui/*, lucide-react, recharts, @dnd-kit/core, @google/genai, clsx, tailwind-merge, class-variance-authority
- [ ] **T3**: Initialize Tailwind CSS 4 and configure `tailwind.config.js` with design tokens
- [ ] **T4**: Initialize shadcn/ui with `npx shadcn@latest init`

### Wave 2: Design System
- [ ] **T5**: Create CSS design system with all tokens from UI-SPEC (surfaces, accents, typography, spacing, animations)
- [ ] **T6**: Create `src/lib/utils.ts` with `cn()` utility and theme helpers

### Wave 3: App Shell
- [ ] **T7**: Build Layout component with sticky sidebar navigation (240px, glassmorphism)
- [ ] **T8**: Build placeholder page components and client-side routing

## Must Haves
- `npm run dev` starts without errors
- Dark mode renders with #111319 background
- Sidebar navigation is visible with all 5 routes
- Cards display glassmorphism styling
- Staggered entry animations play on load

## Files Changed
- `package.json` (new)
- `vite.config.ts` (new)
- `tailwind.config.js` (new)
- `src/index.css` (new)
- `src/main.tsx` (new)
- `src/App.tsx` (new)
- `src/lib/utils.ts` (new)
- `src/components/layout/Sidebar.tsx` (new)
- `src/components/layout/Layout.tsx` (new)
- `src/pages/*.tsx` (new)

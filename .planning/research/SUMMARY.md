# Research Summary — JobFlow

## Stack Decision
**React 19 + Vite 6 + Tailwind 4 + shadcn/ui** — Modern, performant, well-supported stack. @dnd-kit for Kanban drag-and-drop. Recharts for data visualization. @google/genai for all AI features.

## Table Stakes
- Job CRUD with status pipeline (Applied → Interview → Offer → Accepted/Rejected)
- Dashboard with KPI cards and trend charts
- Search and filter by status/origin
- Data persistence via LocalStorage
- Responsive desktop/tablet layout

## Key Differentiators
- Kanban board with drag-and-drop status updates
- AI cover letter and interview guide generation (Gemini 2.5 Flash)
- Multimodal resume parsing and AI avatar (Gemini 3 Pro)
- Context-aware AI career companion "Claire"
- Fortune 500 executive-grade dark glassmorphism design

## Watch Out For
1. **API key security** — Never hardcode, use Settings page + env vars
2. **LocalStorage limits** — Monitor 5MB cap, implement export
3. **DnD performance** — Use transforms, avoid layout thrashing
4. **AI prompt quality** — Iterate heavily, inject user context
5. **Dark mode contrast** — WCAG AA compliance mandatory

## Build Order
Design System → Job CRUD → Dashboard → Job List → Kanban → AI Cover Letter → Resume Builder → AI Parser/Avatar → Claire Chat

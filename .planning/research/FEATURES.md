# Features — JobFlow

## Implemented ✅

### Table Stakes (Must Have)
- ✅ **Job CRUD** — Add, edit, delete, view job applications
- ✅ **Status tracking** — Applied, Interview, Offer, Rejected, Accepted pipeline
- ✅ **Dashboard overview** — KPI cards with totals, conversion rates, trend arrows
- ✅ **Search & filter** — By status, company, role, origin
- ✅ **Data persistence** — LocalStorage (scoped per authenticated user UID)
- ✅ **Responsive layout** — Works on desktop and tablet

### Differentiators (Competitive Advantage)
- ✅ **Kanban board** — Drag-and-drop visual pipeline management (@dnd-kit)
- ✅ **AI cover letter generation** — One-click tailored cover letters via Gemini 2.5 Flash
- ✅ **AI interview guide** — Preparation tips based on job description
- ✅ **AI career companion ("Claire")** — Context-aware floating chatbot
- ✅ **Executive-grade design** — Fortune 500 boardroom quality, glassmorphism, animations
- ✅ **Resume builder** — Split-pane editor with live A4 preview + PDF export
- ✅ **Firebase Authentication** — Email/Password + Google Sign-In
- ✅ **Cloud deployment** — Firebase Hosting at jobflow-exec-tracker.web.app
- ✅ **Multi-user support** — UID-scoped data isolation via LocalStorage namespacing
- ✅ **Theme switching** — Dark mode (default) + Light mode

### Partially Implemented
- 🔶 **AI resume parser** — Manual entry implemented, AI extraction deferred to backlog
- 🔶 **AI avatar generator** — Not yet implemented (backlog candidate)

## Anti-Features (Deliberately NOT Building in v1)
- ❌ Backend/database — Client-side with LocalStorage per user UID
- ❌ Job board scraping — Legal complexity, maintenance burden
- ❌ Mobile-first design — Desktop-first per executive dashboard principles

## Moved to Active (Previously Out of Scope)
- ✅ **User authentication** — Implemented via Firebase Auth (Phase 9)
- ✅ **Deployment/hosting** — Deployed to Firebase Hosting (Phase 10)

## Backlog (Future Enhancements)
- 📋 **999.1 — LinkedIn URL Auto-Import** — Paste URL → auto-extract job details
- 📋 **999.2 — Interview Calendar Integration** — Auto-trigger calendar blocks on status change

## Feature Dependencies
```
Firebase Auth → AuthContext → JobProvider(uid)
Job CRUD → Dashboard (needs data)
Job CRUD → Kanban (needs job list)
Job CRUD → AI Cover Letter (needs job context)
Resume Builder → PDF Export
All features → Claire (reads all contexts)
```

## Complexity Assessment (Actual)
| Feature | Planned | Actual | Notes |
|---------|---------|--------|-------|
| Job CRUD | Low | Low | Clean implementation |
| Dashboard KPIs | Low | Low | Recharts integration smooth |
| Charts (Recharts) | Medium | Low | Composable API worked well |
| Kanban DnD | Medium | Medium | @dnd-kit learning curve minimal |
| AI Cover Letter | Low | Low | Gemini API straightforward |
| Resume Builder | High | Medium | Split-pane simpler than expected |
| Claire Chat | High | Medium | Context injection worked cleanly |
| Firebase Auth | N/A | Low | Firebase SDK excellent DX |
| Cloud Deploy | N/A | Low | Firebase Hosting zero-config |

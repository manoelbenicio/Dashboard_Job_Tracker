# Features Research — Job Application Tracker

## Table Stakes (Must Have)
- **Job CRUD** — Add, edit, delete, view job applications
- **Status tracking** — Applied, Interview, Offer, Rejected, Accepted pipeline
- **Dashboard overview** — KPI cards with totals, conversion rates
- **Search & filter** — By status, company, role, date
- **Data persistence** — LocalStorage so data survives browser refresh
- **Responsive layout** — Works on desktop and tablet

## Differentiators (Competitive Advantage)
- **Kanban board** — Drag-and-drop visual pipeline management
- **AI cover letter generation** — One-click tailored cover letters via Gemini
- **AI interview guide** — Preparation tips based on job description
- **AI resume builder** — Multimodal parsing (image/PDF → structured data)
- **AI avatar generator** — Selfie → professional headshot
- **AI career companion ("Claire")** — Context-aware chat with job stats awareness
- **Executive-grade design** — Fortune 500 boardroom quality, glassmorphism, animations
- **Google Stitch prototyping** — AI-generated screen designs before coding

## Anti-Features (Deliberately NOT Building)
- ❌ Backend/database — Keeps it simple, no server management
- ❌ Multi-user/auth — Single-user local app
- ❌ Job board scraping — Legal complexity, maintenance burden
- ❌ Email integration — Scope creep, privacy concerns
- ❌ Calendar sync — External dependency, limited value for v1
- ❌ Mobile app — Desktop-first per executive dashboard design principles

## Feature Dependencies
```
Job CRUD → Dashboard (needs data)
Job CRUD → Kanban (needs job list)
Job CRUD → AI Cover Letter (needs job context)
Resume Builder → AI Avatar (needs resume context)
All features → Claire (reads all contexts)
```

## Complexity Assessment
| Feature | Complexity | Risk |
|---------|-----------|------|
| Job CRUD | Low | None |
| Dashboard KPIs | Low | None |
| Charts (Recharts) | Medium | Chart config learning curve |
| Kanban DnD | Medium | DnD library integration |
| AI Cover Letter | Low | API key management |
| AI Resume Parser | High | Multimodal prompt engineering |
| AI Avatar | High | Image generation quality |
| Claire Chat | High | Context injection, conversation memory |

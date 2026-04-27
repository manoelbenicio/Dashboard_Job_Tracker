# JobFlow — v1 Requirements

## v1 Requirements

### Design System & Layout
- [ ] **DS-01**: App renders with dark mode glassmorphism design system (#0F1117 base, Inter font, 16px rounded cards)
- [ ] **DS-02**: Sticky sidebar navigation with routes: Dashboard, Jobs, Kanban, Resume, Settings
- [ ] **DS-03**: All cards use glassmorphism (backdrop-blur, semi-transparent backgrounds, subtle borders)
- [ ] **DS-04**: Entry animations: staggered fadeInUp for cards, countUp for KPI numbers
- [ ] **DS-05**: Hover effects on all interactive elements (cards elevate, rows highlight)

### Dashboard
- [ ] **DASH-01**: Dashboard displays KPI cards: Total Applied, Interviews, Offers, Acceptance Rate
- [ ] **DASH-02**: KPI cards show trend arrows (up/down) and hero numbers (48px/800 weight)
- [ ] **DASH-03**: AreaChart shows application frequency over last 30 days
- [ ] **DASH-04**: Donut chart shows job status distribution
- [ ] **DASH-05**: Recent activity feed displays latest job updates with timestamps

### Job Tracker
- [ ] **JOB-01**: User can add a new job application via modal form (company, role, status, salary, location, description)
- [ ] **JOB-02**: User can edit an existing job application
- [ ] **JOB-03**: User can delete a job application with confirmation
- [ ] **JOB-04**: Job list displays as premium data table with sortable columns
- [ ] **JOB-05**: User can filter jobs by status and origin (application/offer)
- [ ] **JOB-06**: User can search jobs by company name or role

### Kanban Board
- [ ] **KAN-01**: Kanban displays columns for each status: Applied, Interview, Offer, Accepted, Rejected
- [ ] **KAN-02**: User can drag job cards between columns to update status
- [ ] **KAN-03**: Kanban cards show company, role, salary badge, and date
- [ ] **KAN-04**: Drag interactions have smooth spring animations with shadow elevation

### AI Features (Phase A)
- [ ] **AI-01**: User can generate a cover letter for a job using Gemini 2.5 Flash
- [ ] **AI-02**: Cover letter uses job role, company name, and user skills as context
- [ ] **AI-03**: User can generate an interview preparation guide for a job
- [ ] **AI-04**: AI features show loading states with shimmer animations

### Resume Builder
- [ ] **RES-01**: Split-screen resume editor: form inputs left, live A4 preview right
- [ ] **RES-02**: Resume sections: summary, experience, education, projects, skills
- [ ] **RES-03**: User can upload image/PDF and AI extracts structured resume data (Gemini 3 Pro)
- [ ] **RES-04**: Live preview updates in real-time as user edits

### AI Avatar
- [ ] **AVA-01**: User can upload a selfie and generate a professional headshot
- [ ] **AVA-02**: Avatar generation shows processing animation (shimmer effect)
- [ ] **AVA-03**: Generated avatar displays in resume and profile

### Claire — AI Career Companion
- [ ] **CLA-01**: Floating chat bubble in bottom-right corner, expandable to chat panel
- [ ] **CLA-02**: Claire reads job stats context (conversion rates, recent updates)
- [ ] **CLA-03**: Claire suggests resume tweaks when conversion rate < 10%
- [ ] **CLA-04**: Claire offers interview roleplay when job status changes to Interview
- [ ] **CLA-05**: Chat interface supports message history with timestamps

### Settings & Persistence
- [ ] **SET-01**: Settings page for API key configuration
- [ ] **SET-02**: User can set their name and skills (used by AI features)
- [ ] **SET-03**: All application state persists via LocalStorage
- [ ] **SET-04**: User can export/import data as JSON

## v2 Requirements (Deferred)
- Calendar integration for interview scheduling
- Email notifications for follow-ups
- Job board API integration (LinkedIn, Indeed)
- Multi-device sync via cloud backend
- PDF export for resumes
- Analytics — time-to-hire metrics, salary benchmarking

## Out of Scope
- Backend server/database — v1 is fully client-side
- User authentication — single-user local app
- Mobile-first responsive — desktop-first per executive dashboard principles
- Job board scraping — legal complexity
- Email integration — privacy concerns, scope creep

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| DS-01 to DS-05 | Phase 1 | Planned |
| DASH-01 to DASH-05 | Phase 2 | Planned |
| JOB-01 to JOB-06 | Phase 3 | Planned |
| KAN-01 to KAN-04 | Phase 4 | Planned |
| AI-01 to AI-04 | Phase 5 | Planned |
| RES-01 to RES-04 | Phase 6 | Planned |
| AVA-01 to AVA-03 | Phase 6 | Planned |
| CLA-01 to CLA-05 | Phase 7 | Planned |
| SET-01 to SET-04 | Phase 3 | Planned |

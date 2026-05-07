# JobFlow — v1 Requirements

## v1 Requirements

### Design System & Layout
- [x] **DS-01**: App renders with dark mode glassmorphism design system (#0F1117 base, Inter font, 16px rounded cards)
- [x] **DS-02**: Sticky sidebar navigation with routes: Dashboard, Jobs, Kanban, Resume, Settings
- [x] **DS-03**: All cards use glassmorphism (backdrop-blur, semi-transparent backgrounds, subtle borders)
- [x] **DS-04**: Entry animations: staggered fadeInUp for cards, countUp for KPI numbers
- [x] **DS-05**: Hover effects on all interactive elements (cards elevate, rows highlight)

### Dashboard
- [x] **DASH-01**: Dashboard displays KPI cards: Total Applied, Interviews, Offers, Acceptance Rate
- [x] **DASH-02**: KPI cards show trend arrows (up/down) and hero numbers (48px/800 weight)
- [x] **DASH-03**: AreaChart shows application frequency over last 30 days
- [x] **DASH-04**: Donut chart shows job status distribution
- [x] **DASH-05**: Recent activity feed displays latest job updates with timestamps

### Job Tracker
- [x] **JOB-01**: User can add a new job application via modal form (company, role, status, salary, location, description)
- [x] **JOB-02**: User can edit an existing job application
- [x] **JOB-03**: User can delete a job application with confirmation
- [x] **JOB-04**: Job list displays as premium data table with sortable columns
- [x] **JOB-05**: User can filter jobs by status and origin (application/offer)
- [x] **JOB-06**: User can search jobs by company name or role

### Kanban Board
- [x] **KAN-01**: Kanban displays columns for each status: Applied, Interview, Offer, Accepted, Rejected
- [x] **KAN-02**: User can drag job cards between columns to update status
- [x] **KAN-03**: Kanban cards show company, role, salary badge, and date
- [x] **KAN-04**: Drag interactions have smooth spring animations with shadow elevation

### AI Features
- [x] **AI-01**: User can generate a cover letter for a job using Gemini 2.5 Flash
- [x] **AI-02**: Cover letter uses job role, company name, and user skills as context
- [x] **AI-03**: User can generate an interview preparation guide for a job
- [x] **AI-04**: AI features show loading states with shimmer animations

### Resume Builder
- [x] **RES-01**: Split-screen resume editor: form inputs left, live preview right
- [x] **RES-02**: Resume sections: summary, experience, education, skills
- [ ] **RES-03**: User can upload image/PDF and AI extracts structured resume data (Gemini 3 Pro) → **Deferred to backlog**
- [x] **RES-04**: Live preview updates in real-time as user edits

### AI Avatar
- [ ] **AVA-01**: User can upload a selfie and generate a professional headshot → **Deferred to backlog**
- [ ] **AVA-02**: Avatar generation shows processing animation → **Deferred to backlog**
- [ ] **AVA-03**: Generated avatar displays in resume and profile → **Deferred to backlog**

### Claire — AI Career Companion
- [x] **CLA-01**: Floating chat bubble in bottom-right corner, expandable to chat panel
- [x] **CLA-02**: Claire reads job stats context (conversion rates, recent updates)
- [x] **CLA-03**: Claire suggests resume tweaks when conversion rate < 10%
- [x] **CLA-04**: Claire offers interview roleplay when job status changes to Interview
- [x] **CLA-05**: Chat interface supports message history with timestamps

### Settings & Persistence
- [x] **SET-01**: Settings page for API key configuration
- [x] **SET-02**: User can set their name and skills (used by AI features)
- [x] **SET-03**: All application state persists via LocalStorage (UID-scoped)
- [x] **SET-04**: User can export/import data as JSON

### Firebase Auth (Phase 8-9)
- [x] **FB-01**: Firebase project created and web app registered
- [x] **FB-02**: Firebase SDK initialized with environment variables
- [x] **FB-03**: Auth providers enabled (Email/Password + Google Sign-In)
- [x] **AUTH-01**: Login page renders with email/password form and Google Sign-In
- [x] **AUTH-02**: User can create account with email/password
- [x] **AUTH-03**: User can sign in with Google
- [x] **AUTH-04**: Unauthenticated users see only the login page
- [x] **AUTH-05**: Sidebar shows Firebase user data (name, avatar, email) + Sign Out

### Deployment (Phase 10)
- [x] **DEPLOY-01**: Production build succeeds (npm run build → dist/)
- [x] **DEPLOY-02**: Firebase Hosting configured with SPA rewrites
- [x] **DEPLOY-03**: App deployed and accessible at jobflow-exec-tracker.web.app

## Backlog Requirements (Deferred)
- [ ] **BL-01**: LinkedIn URL auto-import — paste URL → auto-extract job details (999.1)
- [ ] **BL-02**: Interview calendar integration — auto-block time on Outlook/Gmail (999.2)
- [ ] **RES-03**: AI resume parser — image/PDF → structured data
- [ ] **AVA-01-03**: AI avatar generator — selfie → professional headshot

## Out of Scope
- Backend server/database — v1 is fully client-side (UID-scoped LocalStorage)
- Job board scraping — legal complexity
- Mobile-first responsive — desktop-first per executive dashboard principles

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| DS-01 to DS-05 | Phase 1 | ✅ Done |
| DASH-01 to DASH-05 | Phase 2 | ✅ Done |
| JOB-01 to JOB-06 | Phase 3 | ✅ Done |
| KAN-01 to KAN-04 | Phase 4 | ✅ Done |
| AI-01 to AI-04 | Phase 5 | ✅ Done |
| RES-01, RES-02, RES-04 | Phase 6 | ✅ Done |
| RES-03 | Phase 6 | 🔶 Deferred |
| AVA-01 to AVA-03 | Phase 6 | 🔶 Deferred |
| CLA-01 to CLA-05 | Phase 7 | ✅ Done |
| SET-01 to SET-04 | Phase 3 | ✅ Done |
| FB-01 to FB-03 | Phase 8 | ✅ Done |
| AUTH-01 to AUTH-05 | Phase 9 | ✅ Done |
| DEPLOY-01 to DEPLOY-03 | Phase 10 | ✅ Done |
| BL-01, BL-02 | Backlog | 📋 Planned |

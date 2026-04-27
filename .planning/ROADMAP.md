# JobFlow — Roadmap

## Milestone: v1.0 — Full Application

### Phase 1: Project Scaffolding & Design System
**Goal**: Set up the React project with Vite, install all dependencies, create the design system with dark glassmorphism tokens, and build the layout shell (sidebar + main content).
**Requirements**: DS-01, DS-02, DS-03, DS-04, DS-05
**UI hint**: yes
**Depends on**: None

**Success Criteria**:
1. `npm run dev` starts and renders the app shell with dark mode
2. Sidebar navigation is visible and sticky with all route links
3. Cards display glassmorphism styling (blur, transparency, rounded corners)
4. Entry animations play on page load (staggered cards, smooth transitions)

---

### Phase 2: Executive Dashboard
**Goal**: Build the dashboard home page with KPI cards, trend charts (AreaChart + Donut), and a recent activity feed. Data comes from JobContext.
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**UI hint**: yes
**Depends on**: Phase 1, Phase 3 (JobContext)

**Success Criteria**:
1. Dashboard shows 4+ KPI cards with hero numbers and trend arrows
2. AreaChart renders 30-day application frequency
3. Donut chart shows status distribution with color-coded segments
4. Activity feed displays recent job updates with relative timestamps

---

### Phase 3: Job Context & CRUD
**Goal**: Implement JobContext with LocalStorage persistence, build the job list view with premium table, modal form for add/edit, and delete confirmation. Include Settings page for API key and user profile.
**Requirements**: JOB-01, JOB-02, JOB-03, JOB-04, JOB-05, JOB-06, SET-01, SET-02, SET-03, SET-04
**UI hint**: yes
**Depends on**: Phase 1

**Success Criteria**:
1. User can add a job via modal form and see it in the list
2. User can edit and delete existing jobs
3. Filter dropdowns filter jobs by status and origin
4. Data persists across browser refresh (LocalStorage)
5. Settings page saves API key and user profile

---

### Phase 4: Kanban Board
**Goal**: Build the drag-and-drop Kanban board with status columns, glassmorphism cards, and smooth animations. Dragging a card between columns updates the job status.
**Requirements**: KAN-01, KAN-02, KAN-03, KAN-04
**UI hint**: yes
**Depends on**: Phase 3 (JobContext)

**Success Criteria**:
1. Kanban displays 5 columns (Applied, Interview, Offer, Accepted, Rejected)
2. User can drag a job card from one column to another
3. Dropping updates the job status in context and LocalStorage
4. Drag animation includes card elevation and column highlighting

---

### Phase 5: AI Cover Letter & Interview Guide
**Goal**: Integrate Google GenAI SDK for cover letter generation and interview preparation guides. Include loading states with shimmer animations.
**Requirements**: AI-01, AI-02, AI-03, AI-04
**UI hint**: yes
**Depends on**: Phase 3 (JobContext, Settings/API key)

**Success Criteria**:
1. "Generate Cover Letter" button produces a tailored letter using job + user context
2. "Generate Interview Guide" produces preparation tips
3. Loading states show shimmer animation during generation
4. Generated content is saved to the job record

---

### Phase 6: Resume Builder & AI Avatar
**Goal**: Build the split-screen resume editor with live A4 preview, multimodal resume parsing (upload image/PDF → structured data), and AI avatar generation (selfie → headshot).
**Requirements**: RES-01, RES-02, RES-03, RES-04, AVA-01, AVA-02, AVA-03
**UI hint**: yes
**Depends on**: Phase 1, Phase 3 (Settings/API key)

**Success Criteria**:
1. Split-screen layout: form left, A4 preview right
2. Preview updates live as user types
3. Upload button triggers AI resume parsing and populates form
4. Avatar upload generates a professional headshot

---

### Phase 7: Claire — AI Career Companion
**Goal**: Build the floating chat interface with context-aware AI career coaching. Claire reads job stats and provides actionable advice based on the user's pipeline.
**Requirements**: CLA-01, CLA-02, CLA-03, CLA-04, CLA-05
**UI hint**: yes
**Depends on**: Phase 3 (JobContext), Phase 5 (AI integration pattern)

**Success Criteria**:
1. Chat bubble appears in bottom-right corner
2. Clicking opens expandable chat panel with message history
3. Claire references user's actual job stats in responses
4. Low conversion rate triggers proactive resume improvement suggestions
5. Interview status update triggers roleplay offer

---

## Progress

| Phase | Name | Plans | Status |
|-------|------|-------|--------|
| 1 | Project Scaffolding & Design System | — | Planned |
| 2 | Executive Dashboard | — | Planned |
| 3 | Job Context & CRUD | — | Planned |
| 4 | Kanban Board | — | Planned |
| 5 | AI Cover Letter & Interview Guide | — | Planned |
| 6 | Resume Builder & AI Avatar | — | Planned |
| 7 | Claire — AI Career Companion | — | Planned |

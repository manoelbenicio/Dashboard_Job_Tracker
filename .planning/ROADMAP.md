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

### Phase 8: Firebase Project Setup & SDK Configuration
**Goal**: Create a Firebase project, register a web app, enable Auth providers (Email/Password + Google Sign-In), and integrate the Firebase SDK into the Vite project with environment-based configuration.
**Requirements**: FB-01, FB-02, FB-03
**UI hint**: no
**Depends on**: Phase 1 (project structure)

**Success Criteria**:
1. Firebase project created and web app registered
2. Firebase SDK installed and `src/lib/firebase.ts` initializes correctly
3. Auth providers (Email/Password + Google) enabled in Firebase Console
4. Environment variables configured in `.env.local` (gitignored)
5. `npm run build` succeeds with Firebase dependency

---

### Phase 9: Authentication UI & Auth Guards
**Goal**: Build the login/register page with Email/Password + Google Sign-In, create AuthContext with `onAuthStateChanged`, add auth guards to the app shell, and scope data storage per user UID.
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**UI hint**: yes
**Depends on**: Phase 8 (Firebase SDK), Phase 3 (JobContext)

**Success Criteria**:
1. Login page renders with email/password form and Google Sign-In button
2. User can create an account with email/password
3. User can sign in with Google
4. Unauthenticated users see only the login page
5. Sidebar shows Firebase user data (name, avatar, email)
6. Sign Out button works and returns to login
7. Job data is scoped per user UID in LocalStorage

---

### Phase 10: Firebase Hosting Deployment
**Goal**: Build the production bundle, configure Firebase Hosting with SPA rewrites, deploy to Firebase Hosting, and validate the live URL.
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03
**UI hint**: no
**Depends on**: Phase 9 (Auth complete), Phase 8 (Firebase project)

**Success Criteria**:
1. `npm run build` produces clean `dist/` folder
2. `firebase.json` configured with SPA rewrites
3. Deploy succeeds to `*.web.app` or `*.firebaseapp.com`
4. Live URL loads login page
5. Full auth flow works on deployed version
6. Lighthouse audit passes accessibility + best practices

---

## Progress

| Phase | Name | Plans | Status |
|-------|------|-------|--------|
| 1 | Project Scaffolding & Design System | — | ✅ Done |
| 2 | Executive Dashboard | — | ✅ Done |
| 3 | Job Context & CRUD | — | ✅ Done |
| 4 | Kanban Board | — | ✅ Done |
| 5 | AI Cover Letter & Interview Guide | — | ✅ Done |
| 6 | Resume Builder & AI Avatar | — | ✅ Done |
| 7 | Claire — AI Career Companion | — | ✅ Done |
| 8 | Firebase Project Setup & SDK | — | ✅ Done |
| 9 | Authentication UI & Auth Guards | — | ✅ Done |
| 10 | Firebase Hosting Deployment | — | ✅ Done |

---

## Backlog (999.x — Future Enhancements)

### 999.1 — LinkedIn URL Auto-Import
**Description**: Allow users to paste a LinkedIn job URL (mobile or desktop) and automatically extract all job details (company, role, location, salary range, description) using web scraping or AI-powered extraction. Eliminates manual data entry.
**Value**: High — saves significant time during active job hunting sessions
**Complexity**: Medium — requires URL parsing, data extraction (Gemini multimodal or scraping proxy), and mapping to Job schema

### 999.2 — Interview Calendar Integration
**Description**: When a job's status changes to "Interview", automatically trigger an email with all job details formatted to create a calendar block in Outlook and Gmail. Could use `.ics` file attachment or Google Calendar API / Microsoft Graph API integration.
**Value**: High — prevents scheduling conflicts and ensures preparation time is blocked
**Complexity**: Medium-High — requires email sending service (Firebase Functions or SendGrid) and calendar API integration

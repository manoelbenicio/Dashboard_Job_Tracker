# Architecture — JobFlow

## Component Architecture
```
┌─────────────────────────────────────────────────────────┐
│                   AuthProvider                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  AuthGate (loading → login → app shell)            │  │
│  │                                                    │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │              JobProvider (uid-scoped)        │   │  │
│  │  │                                             │   │  │
│  │  │  ┌──────────┐  ┌────────────────────────┐   │   │  │
│  │  │  │ Sidebar  │  │   Main Content Area     │   │   │  │
│  │  │  │ (Nav)    │  │  ┌──────────────────┐   │   │   │  │
│  │  │  │          │  │  │  Page Router      │   │   │   │  │
│  │  │  │ Dashboard│  │  │  - Dashboard      │   │   │   │  │
│  │  │  │ Jobs     │  │  │  - Jobs List      │   │   │   │  │
│  │  │  │ Kanban   │  │  │  - Kanban Board   │   │   │   │  │
│  │  │  │ Resume   │  │  │  - Resume Builder │   │   │   │  │
│  │  │  │ Settings │  │  │  - Settings       │   │   │   │  │
│  │  │  │          │  │  └──────────────────┘   │   │   │  │
│  │  │  │ ─────── │  └────────────────────────┘   │   │  │
│  │  │  │ Profile │                                │   │  │
│  │  │  │ Sign Out│                                │   │  │
│  │  │  └──────────┘                                │   │  │
│  │  │  ┌──────────────────────────────────────────┐│   │  │
│  │  │  │  Claire Chat (Floating)                  ││   │  │
│  │  │  └──────────────────────────────────────────┘│   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Data Flow
```
Firebase Auth → onAuthStateChanged → AuthContext (user state)
    ↓
User Input → Context Dispatch → State Update → LocalStorage[uid] Sync → UI Re-render
                                       ↓
                               Gemini AI API (on-demand)
```

## State Architecture
```
AuthContext (Firebase Auth)
├── user: User | null
├── loading: boolean
├── login(), signup(), googleLogin(), logout()
│
└── JobContext (scoped per user.uid)
    ├── jobs[] (CRUD operations)
    ├── profile (UserProfile)
    ├── searchQuery, statusFilter, originFilter
    └── filteredJobs (computed)
```

## File Structure (Actual)
```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx         # Main layout shell + theme toggle
│   │   └── Sidebar.tsx        # Navigation + user profile + sign out
│   └── ai/
│       ├── AIToolsPanel.tsx   # Cover letter & interview guide generator
│       └── ClaireChat.tsx     # Floating AI career companion
├── context/
│   ├── AuthContext.tsx        # Firebase Auth state management
│   └── JobContext.tsx         # Job state management (uid-scoped)
├── lib/
│   ├── ai.ts                 # Gemini API service layer
│   ├── firebase.ts           # Firebase SDK initialization
│   ├── storage.ts            # LocalStorage persistence (uid-scoped)
│   └── utils.ts              # Utility functions (cn, generateId)
├── pages/
│   ├── DashboardPage.tsx      # KPI cards + charts
│   ├── JobsPage.tsx           # Job CRUD table + filters
│   ├── KanbanPage.tsx         # Drag-and-drop status board
│   ├── LoginPage.tsx          # Firebase Auth login/register
│   ├── ResumePage.tsx         # Resume builder + PDF export
│   └── SettingsPage.tsx       # Theme, API key, data import/export
├── types/
│   └── index.ts               # TypeScript interfaces
├── App.tsx                    # Root: AuthProvider → AuthGate → AppShell
├── main.tsx                   # Entry point
└── index.css                  # Design tokens + global styles
```

## External Services
```
Firebase Auth (jobflow-exec-tracker)
├── Email/Password provider
└── Google Sign-In provider

Firebase Hosting
└── https://jobflow-exec-tracker.web.app

Google Gemini API (@google/genai)
├── gemini-2.5-flash (cover letters, interview guides)
└── gemini-2.5-flash (Claire career companion)
```

## Build & Deploy
```
npm run build → tsc → vite build → dist/
firebase deploy --only hosting → jobflow-exec-tracker.web.app
```

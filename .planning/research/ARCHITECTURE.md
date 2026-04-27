# Architecture Research — Job Application Tracker

## Component Architecture
```
┌─────────────────────────────────────────────────────┐
│                    App Shell                         │
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │ Sidebar  │  │        Main Content Area          │ │
│  │ (Nav)    │  │  ┌──────────────────────────────┐ │ │
│  │          │  │  │  Page Router                 │ │ │
│  │ Dashboard│  │  │  - Dashboard                 │ │ │
│  │ Jobs     │  │  │  - Jobs List                 │ │ │
│  │ Kanban   │  │  │  - Kanban Board              │ │ │
│  │ Resume   │  │  │  - Resume Builder            │ │ │
│  │ Settings │  │  │  - Settings                  │ │ │
│  │          │  │  └──────────────────────────────┘ │ │
│  └──────────┘  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │  Claire Chat (Floating)                          ││
│  └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## Data Flow
```
User Input → Context Dispatch → State Update → LocalStorage Sync → UI Re-render
                                      ↓
                              Gemini AI API (on-demand)
```

## State Architecture
```
AppContext
├── JobContext (jobs[], CRUD operations)
├── ResumeContext (resume data, avatar)
├── SettingsContext (theme, API key, user prefs)
└── ChatContext (Claire messages, conversation history)
```

## File Structure (Proposed)
```
src/
├── components/
│   ├── layout/          # Sidebar, Header, Layout shell
│   ├── dashboard/       # KPI cards, Charts, Activity feed
│   ├── jobs/            # Job list, Job modal, Job card
│   ├── kanban/          # Kanban board, Kanban column, Kanban card
│   ├── resume/          # Resume form, Resume preview, Avatar
│   ├── chat/            # Claire chat bubble, Chat panel
│   ├── settings/        # Settings form
│   └── ui/              # shadcn/ui components
├── contexts/            # React Context providers
├── hooks/               # Custom hooks (useLocalStorage, useAI)
├── lib/                 # Utilities (cn, genai client, date helpers)
├── styles/              # Global CSS, design tokens
└── types/               # TypeScript interfaces
```

## Build Order (Dependencies)
1. **Design System + Layout Shell** — Foundation everything else builds on
2. **Job Context + CRUD** — Core data model everything references
3. **Dashboard** — Consumes job data, validates context works
4. **Job List View** — CRUD UI with filters
5. **Kanban Board** — Alternate view of same job data
6. **AI Cover Letter** — First AI integration, simpler use case
7. **Resume Context + Builder** — New data model, complex UI
8. **AI Resume Parser + Avatar** — Multimodal AI features
9. **Claire Chat** — Reads all contexts, most complex integration

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { Job, UserProfile, DEFAULT_PROFILE } from '@/types'
import { loadJobs, saveJobs, loadProfile, saveProfile } from '@/lib/storage'
import { generateId } from '@/lib/utils'

/* ─── State ────────────────────────────────────────────── */

interface JobState {
  jobs: Job[]
  profile: UserProfile
  searchQuery: string
  statusFilter: string
  originFilter: string
}

/* ─── Actions ──────────────────────────────────────────── */

type JobAction =
  | { type: 'ADD_JOB'; payload: Omit<Job, 'id' | 'createdAt' | 'lastUpdated'> }
  | { type: 'UPDATE_JOB'; payload: Job }
  | { type: 'DELETE_JOB'; payload: string }
  | { type: 'UPDATE_STATUS'; payload: { id: string; status: Job['status'] } }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: string }
  | { type: 'SET_ORIGIN_FILTER'; payload: string }
  | { type: 'IMPORT_DATA'; payload: { jobs: Job[]; profile: UserProfile } }

/* ─── Reducer ──────────────────────────────────────────── */

function jobReducer(state: JobState, action: JobAction): JobState {
  switch (action.type) {
    case 'ADD_JOB': {
      const now = new Date().toISOString()
      const newJob: Job = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
        lastUpdated: now,
      }
      return { ...state, jobs: [newJob, ...state.jobs] }
    }
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id === action.payload.id
            ? { ...action.payload, lastUpdated: new Date().toISOString() }
            : j
        ),
      }
    case 'DELETE_JOB':
      return { ...state, jobs: state.jobs.filter(j => j.id !== action.payload) }
    case 'UPDATE_STATUS':
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id === action.payload.id
            ? { ...j, status: action.payload.status, lastUpdated: new Date().toISOString() }
            : j
        ),
      }
    case 'SET_PROFILE':
      return { ...state, profile: action.payload }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload }
    case 'SET_ORIGIN_FILTER':
      return { ...state, originFilter: action.payload }
    case 'IMPORT_DATA':
      return { ...state, jobs: action.payload.jobs, profile: action.payload.profile }
    default:
      return state
  }
}

/* ─── Context ──────────────────────────────────────────── */

interface JobContextType {
  state: JobState
  dispatch: React.Dispatch<JobAction>
  filteredJobs: Job[]
  userUid: string
}

const JobContext = createContext<JobContextType | null>(null)

export function useJobs() {
  const ctx = useContext(JobContext)
  if (!ctx) throw new Error('useJobs must be used within JobProvider')
  return ctx
}

/* ─── Provider ─────────────────────────────────────────── */

export function JobProvider({ children, userUid }: { children: ReactNode; userUid: string }) {
  const [state, dispatch] = useReducer(jobReducer, {
    jobs: loadJobs(userUid),
    profile: loadProfile(userUid),
    searchQuery: '',
    statusFilter: 'all',
    originFilter: 'all',
  })

  // Persist on change — scoped to user UID
  useEffect(() => { saveJobs(state.jobs, userUid) }, [state.jobs, userUid])
  useEffect(() => { saveProfile(state.profile, userUid) }, [state.profile, userUid])

  // Compute filtered jobs
  const filteredJobs = state.jobs.filter(job => {
    const matchesSearch =
      state.searchQuery === '' ||
      job.company.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(state.searchQuery.toLowerCase())

    const matchesStatus =
      state.statusFilter === 'all' || job.status === state.statusFilter

    const matchesOrigin =
      state.originFilter === 'all' || job.origin === state.originFilter

    return matchesSearch && matchesStatus && matchesOrigin
  })

  return (
    <JobContext.Provider value={{ state, dispatch, filteredJobs, userUid }}>
      {children}
    </JobContext.Provider>
  )
}

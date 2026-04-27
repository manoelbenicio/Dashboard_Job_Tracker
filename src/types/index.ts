export type JobStatus = 'applied' | 'interview' | 'offer' | 'accepted' | 'rejected'

export interface Job {
  id: string
  company: string
  role: string
  status: JobStatus
  salary: string
  location: string
  description: string
  url: string
  origin: 'application' | 'referral' | 'recruiter' | 'other'
  notes: string
  coverLetter: string
  interviewGuide: string
  appliedDate: string      // ISO string
  lastUpdated: string      // ISO string
  createdAt: string        // ISO string
}

export interface UserProfile {
  name: string
  email: string
  skills: string[]
  summary: string
  apiKey: string
}

export interface AppState {
  jobs: Job[]
  profile: UserProfile
  theme: 'dark' | 'light'
  palette: string
}

export const JOB_STATUSES: { value: JobStatus; label: string; color: string }[] = [
  { value: 'applied', label: 'Applied', color: '#3B82F6' },
  { value: 'interview', label: 'Interview', color: '#F59E0B' },
  { value: 'offer', label: 'Offer', color: '#10B981' },
  { value: 'accepted', label: 'Accepted', color: '#4edea3' },
  { value: 'rejected', label: 'Rejected', color: '#EF4444' },
]

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  skills: [],
  summary: '',
  apiKey: '',
}

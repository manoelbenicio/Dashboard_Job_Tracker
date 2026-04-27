import { Job, UserProfile, DEFAULT_PROFILE } from '@/types'
import { generateId } from '@/lib/utils'

const STORAGE_KEYS = {
  jobs: 'jobflow-jobs',
  profile: 'jobflow-profile',
  theme: 'jobflow-theme',
  palette: 'jobflow-palette',
} as const

/** Load jobs from LocalStorage */
export function loadJobs(): Job[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.jobs)
    return raw ? JSON.parse(raw) : getSeedJobs()
  } catch {
    return getSeedJobs()
  }
}

/** Save jobs to LocalStorage */
export function saveJobs(jobs: Job[]): void {
  localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(jobs))
}

/** Load user profile */
export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.profile)
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

/** Save user profile */
export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile))
}

/** Export all data as JSON string */
export function exportData(jobs: Job[], profile: UserProfile): string {
  return JSON.stringify({ jobs, profile, exportedAt: new Date().toISOString() }, null, 2)
}

/** Import data from JSON string, returns parsed data or null */
export function importData(json: string): { jobs: Job[]; profile: UserProfile } | null {
  try {
    const data = JSON.parse(json)
    if (Array.isArray(data.jobs)) {
      return { jobs: data.jobs, profile: data.profile || DEFAULT_PROFILE }
    }
    return null
  } catch {
    return null
  }
}

/** Seed data for first-time users */
function getSeedJobs(): Job[] {
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()

  return [
    {
      id: generateId(),
      company: 'Meta',
      role: 'Product Strategy Lead',
      status: 'interview',
      salary: '$185,000 - $240,000',
      location: 'Menlo Park, CA (Hybrid)',
      description: 'Lead product strategy for Reality Labs division.',
      url: 'https://careers.meta.com',
      origin: 'application',
      notes: 'Second round technical interview scheduled for Thursday.',
      coverLetter: '',
      interviewGuide: '',
      appliedDate: daysAgo(12),
      lastUpdated: daysAgo(0),
      createdAt: daysAgo(12),
    },
    {
      id: generateId(),
      company: 'Spotify',
      role: 'Senior Director of Engineering',
      status: 'applied',
      salary: '$210,000 - $280,000',
      location: 'New York, NY (Remote)',
      description: 'Lead engineering teams across podcast infrastructure.',
      url: 'https://jobs.spotify.com',
      origin: 'referral',
      notes: 'Customized resume. Transcript of PDF attached to application.',
      coverLetter: '',
      interviewGuide: '',
      appliedDate: daysAgo(5),
      lastUpdated: daysAgo(0),
      createdAt: daysAgo(5),
    },
    {
      id: generateId(),
      company: 'Goldman Sachs',
      role: 'VP of Operations',
      status: 'offer',
      salary: '$195,000 - $260,000',
      location: 'New York, NY',
      description: 'Vice President of Technology Operations for Marcus division.',
      url: 'https://careers.goldmansachs.com',
      origin: 'recruiter',
      notes: 'Final round confirmation received. Waiting for digital contract.',
      coverLetter: '',
      interviewGuide: '',
      appliedDate: daysAgo(21),
      lastUpdated: daysAgo(1),
      createdAt: daysAgo(21),
    },
    {
      id: generateId(),
      company: 'Stripe',
      role: 'Staff Software Engineer',
      status: 'interview',
      salary: '$200,000 - $300,000',
      location: 'San Francisco, CA',
      description: 'Build next-gen payment infrastructure.',
      url: 'https://stripe.com/jobs',
      origin: 'application',
      notes: 'System design round scheduled next week.',
      coverLetter: '',
      interviewGuide: '',
      appliedDate: daysAgo(8),
      lastUpdated: daysAgo(2),
      createdAt: daysAgo(8),
    },
    {
      id: generateId(),
      company: 'Apple',
      role: 'Engineering Manager — ML Platform',
      status: 'applied',
      salary: '$220,000 - $340,000',
      location: 'Cupertino, CA',
      description: 'Manage ML infrastructure for Siri and Apple Intelligence.',
      url: 'https://jobs.apple.com',
      origin: 'application',
      notes: 'Applied via website. Strong match for background.',
      coverLetter: '',
      interviewGuide: '',
      appliedDate: daysAgo(3),
      lastUpdated: daysAgo(3),
      createdAt: daysAgo(3),
    },
    {
      id: generateId(),
      company: 'Netflix',
      role: 'Director of Data Engineering',
      status: 'rejected',
      salary: '$250,000 - $380,000',
      location: 'Los Gatos, CA',
      description: 'Lead real-time data pipeline for content recommendations.',
      url: 'https://jobs.netflix.com',
      origin: 'application',
      notes: 'Received rejection after phone screen. Position filled internally.',
      coverLetter: '',
      interviewGuide: '',
      appliedDate: daysAgo(30),
      lastUpdated: daysAgo(15),
      createdAt: daysAgo(30),
    },
    {
      id: generateId(),
      company: 'Google',
      role: 'Senior Product Manager — Cloud AI',
      status: 'interview',
      salary: '$190,000 - $285,000',
      location: 'Mountain View, CA (Hybrid)',
      description: 'Drive product strategy for Vertex AI platform.',
      url: 'https://careers.google.com',
      origin: 'recruiter',
      notes: 'Recruiter reached out. First interview completed.',
      coverLetter: '',
      interviewGuide: '',
      appliedDate: daysAgo(10),
      lastUpdated: daysAgo(4),
      createdAt: daysAgo(10),
    },
    {
      id: generateId(),
      company: 'Microsoft',
      role: 'Principal Engineer — Azure',
      status: 'applied',
      salary: '$205,000 - $310,000',
      location: 'Redmond, WA (Hybrid)',
      description: 'Architecture for Azure Kubernetes Service next-gen.',
      url: 'https://careers.microsoft.com',
      origin: 'application',
      notes: 'Applied last week. Awaiting response.',
      coverLetter: '',
      interviewGuide: '',
      appliedDate: daysAgo(7),
      lastUpdated: daysAgo(7),
      createdAt: daysAgo(7),
    },
    {
      id: generateId(),
      company: 'Airbnb',
      role: 'Head of Trust & Safety Engineering',
      status: 'accepted',
      salary: '$240,000 - $350,000',
      location: 'San Francisco, CA',
      description: 'Lead the Trust & Safety engineering organization.',
      url: 'https://careers.airbnb.com',
      origin: 'referral',
      notes: 'Offer accepted! Start date confirmed for next month.',
      coverLetter: '',
      interviewGuide: '',
      appliedDate: daysAgo(45),
      lastUpdated: daysAgo(3),
      createdAt: daysAgo(45),
    },
  ]
}

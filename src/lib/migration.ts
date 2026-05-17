import { loadJobs, saveJobs, loadProfile, saveProfile, loadResume, saveResume } from '@/lib/storage'
import { analytics } from '@/lib/analytics'
import { DEFAULT_PROFILE } from '@/types'

export async function migrateDataToFirestore(uid: string) {
  try {
    // 1. Migrate Profile
    const localProfileRaw = localStorage.getItem(`jobflow-${uid}-profile`) || localStorage.getItem('jobflow-profile')
    if (localProfileRaw) {
      const localProfile = JSON.parse(localProfileRaw)
      const existingProfile = await loadProfile(uid)
      // If we only have the default profile in Firestore, let's migrate the local one
      if (existingProfile.name === DEFAULT_PROFILE.name && existingProfile.email === DEFAULT_PROFILE.email) {
        await saveProfile(localProfile, uid)
      }
    }

    // 2. Migrate Jobs
    const localJobsRaw = localStorage.getItem(`jobflow-${uid}-jobs`) || localStorage.getItem('jobflow-jobs')
    if (localJobsRaw) {
      const localJobs = JSON.parse(localJobsRaw)
      if (Array.isArray(localJobs) && localJobs.length > 0) {
        const existingJobs = await loadJobs(uid)
        // Simple logic: if firestore has less than or equal to seed jobs, we replace with local
        if (existingJobs.length <= 4) {
          await saveJobs(localJobs, uid)
        }
      }
    }

    // 3. Migrate Resume
    const localResumeRaw = localStorage.getItem('jobflow-resume')
    if (localResumeRaw) {
      const localResume = JSON.parse(localResumeRaw)
      const existingResume = await loadResume(uid)
      if (!existingResume) {
        await saveResume(localResume, uid)
      }
    }

    // 4. Migrate Analytics
    const localAnalyticsRaw = localStorage.getItem(`jobflow-${uid}-analytics`) || localStorage.getItem('jobflow-analytics')
    if (localAnalyticsRaw) {
      const localEvents = JSON.parse(localAnalyticsRaw)
      if (Array.isArray(localEvents) && localEvents.length > 0) {
        const existingEvents = await analytics.getEvents()
        if (existingEvents.length === 0) {
          for (const ev of localEvents) {
            await analytics.track(ev.category, ev.action, ev.label, ev.value, ev.metadata)
          }
        }
      }
    }

    // Mark as migrated
    localStorage.setItem(`jobflow-${uid}-migrated`, 'true')
    console.log('Migration to Firestore complete.')
    return true
  } catch (error) {
    console.error('Error during migration:', error)
    return false
  }
}

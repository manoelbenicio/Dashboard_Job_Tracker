/* ─── JobFlow Product Analytics Service ─── */
/* Tracks user interactions for SaaS admin insights */
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore'

export interface AnalyticsEvent {
  id?: string
  uid: string
  category: 'auth' | 'navigation' | 'jobs' | 'kanban' | 'ai' | 'resume' | 'settings' | 'search'
  action: string
  label?: string
  value?: number
  metadata?: Record<string, any>
  timestamp: number
}

export interface AnalyticsMetrics {
  totalEvents: number
  aiRequests: number
  jobsCreated: number
  sessionsCount: number
  featureAdoption: number
  eventsByCategory: Record<string, number>
  eventsByAction: Record<string, number>
  dailyEvents: { date: string; auth: number; jobs: number; ai: number; resume: number; kanban: number; settings: number }[]
  topActions: { action: string; count: number; lastUsed: number; category: string }[]
  recentEvents: AnalyticsEvent[]
}

const RECENT_LIMIT = 50

class Analytics {
  private uid: string | null = null

  setUser(uid: string) {
    this.uid = uid
  }

  clearUser() {
    this.uid = null
  }

  async track(
    category: AnalyticsEvent['category'],
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!this.uid) return
    const event: AnalyticsEvent = {
      uid: this.uid,
      category,
      action,
      label,
      value,
      metadata,
      timestamp: Date.now(),
    }
    try {
      const analyticsRef = collection(db, 'analytics')
      await addDoc(analyticsRef, event)
    } catch (e) {
      console.error('Failed to log analytics event', e)
    }
  }

  async getEvents(category?: string, days?: number): Promise<AnalyticsEvent[]> {
    if (!this.uid) return []
    try {
      let q = query(collection(db, 'analytics'), where('uid', '==', this.uid))
      const snapshot = await getDocs(q)
      let events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalyticsEvent))
      
      if (category) events = events.filter(e => e.category === category)
      if (days) {
        const cutoff = Date.now() - days * 86400000
        events = events.filter(e => e.timestamp >= cutoff)
      }
      return events.sort((a, b) => a.timestamp - b.timestamp)
    } catch (e) {
      console.error('Failed to get events', e)
      return []
    }
  }

  async getMetrics(days: number = 30): Promise<AnalyticsMetrics> {
    if (!this.uid) return emptyMetrics()
    try {
      const allEvents = await this.getEvents(undefined, days)
      const events = allEvents

      // Events by category
      const eventsByCategory: Record<string, number> = {}
      const eventsByAction: Record<string, number> = {}
      const actionMap: Map<string, { count: number; lastUsed: number; category: string }> = new Map()

      for (const e of events) {
        eventsByCategory[e.category] = (eventsByCategory[e.category] || 0) + 1
        eventsByAction[e.action] = (eventsByAction[e.action] || 0) + 1
        const existing = actionMap.get(e.action)
        if (existing) {
          existing.count++
          existing.lastUsed = Math.max(existing.lastUsed, e.timestamp)
        } else {
          actionMap.set(e.action, { count: 1, lastUsed: e.timestamp, category: e.category })
        }
      }

      // Daily breakdown
      const dailyMap: Map<string, Record<string, number>> = new Map()
      for (const e of events) {
        const d = new Date(e.timestamp).toISOString().slice(0, 10)
        if (!dailyMap.has(d)) dailyMap.set(d, { auth: 0, jobs: 0, ai: 0, resume: 0, kanban: 0, settings: 0 })
        const day = dailyMap.get(d)!
        if (e.category in day) day[e.category as keyof typeof day]++
      }
      const dailyEvents = Array.from(dailyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, cats]) => ({ date, ...cats })) as AnalyticsMetrics['dailyEvents']

      // Top actions
      const topActions = Array.from(actionMap.entries())
        .map(([action, data]) => ({ action, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)

      // Unique categories used (for feature adoption)
      const allCategories = ['jobs', 'ai', 'resume', 'kanban', 'settings', 'search']
      const usedCategories = allCategories.filter(c => eventsByCategory[c] > 0)
      const featureAdoption = Math.round((usedCategories.length / allCategories.length) * 100)

      // AI requests
      const aiRequests = events.filter(e => e.category === 'ai').length

      // Jobs created
      const jobsCreated = events.filter(e => e.action === 'job_created').length

      // Session count (unique login events)
      const sessionsCount = events.filter(e => e.action === 'login' || e.action === 'google_login').length || 1

      return {
        totalEvents: events.length,
        aiRequests,
        jobsCreated,
        sessionsCount,
        featureAdoption,
        eventsByCategory,
        eventsByAction,
        dailyEvents,
        topActions,
        recentEvents: events.slice(-RECENT_LIMIT).reverse(),
      }
    } catch (e) {
      return emptyMetrics()
    }
  }

  async clearAll(): Promise<void> {
    // In Firestore, deleting all documents for a user should ideally be done via a cloud function,
    // but for now we'll just leave it as a no-op or we could fetch and delete one by one.
    console.warn('clearAll not fully implemented for Firestore directly from client')
  }
}

export function emptyMetrics(): AnalyticsMetrics {
  return {
    totalEvents: 0, aiRequests: 0, jobsCreated: 0, sessionsCount: 0,
    featureAdoption: 0, eventsByCategory: {}, eventsByAction: {},
    dailyEvents: [], topActions: [], recentEvents: [],
  }
}

export const analytics = new Analytics()

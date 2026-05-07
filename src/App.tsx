import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { JobProvider } from '@/context/JobContext'
import { Layout } from '@/components/layout/Layout'
import { DashboardPage } from '@/pages/DashboardPage'
import { JobsPage } from '@/pages/JobsPage'
import { KanbanPage } from '@/pages/KanbanPage'
import { ResumePage } from '@/pages/ResumePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { LoginPage } from '@/pages/LoginPage'
import { ClaireChat } from '@/components/ai/ClaireChat'
import { analytics } from '@/lib/analytics'
import { Loader2 } from 'lucide-react'

/* ─── Auth Gate ───────────────────────────────────────── */

function AuthGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1117' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: '#10B981' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading JobFlow...</p>
        </div>
      </div>
    )
  }

  // Set analytics user context
  useEffect(() => {
    if (user) {
      analytics.setUser(user.uid)
      analytics.track('auth', 'session_start')
    } else {
      analytics.clearUser()
    }
  }, [user])

  if (!user) return <LoginPage />

  return (
    <JobProvider userUid={user.uid}>
      <AppShell user={user} />
    </JobProvider>
  )
}

/* ─── App Shell ───────────────────────────────────────── */

function AppShell({ user }: { user: any }) {
  const [activePage, setActivePage] = useState('dashboard')

  const handleNavigate = (page: string) => {
    setActivePage(page)
    analytics.track('navigation', 'page_view', page)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />
      case 'jobs': return <JobsPage />
      case 'kanban': return <KanbanPage />
      case 'resume': return <ResumePage />
      case 'analytics': return <AnalyticsPage />
      case 'settings': return <SettingsPage />
      default: return <DashboardPage />
    }
  }

  return (
    <>
      <Layout activePage={activePage} onNavigate={handleNavigate} user={user}>
        {renderPage()}
      </Layout>
      <ClaireChat />
    </>
  )
}

/* ─── Root ────────────────────────────────────────────── */

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

export default App

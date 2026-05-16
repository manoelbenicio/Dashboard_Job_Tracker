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
import { BenchmarkPage } from '@/pages/BenchmarkPage'
import { LoginPage } from '@/pages/LoginPage'
import { ClaireChat } from '@/components/ai/ClaireChat'
import { analytics } from '@/lib/analytics'
import { Loader2 } from 'lucide-react'

/* ─── Auth Gate ───────────────────────────────────────── */

function AuthGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '24px',
        background: '#0F1117',
      }}>
        {/* Logo */}
        <div style={{
          width: '64px', height: '64px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #003E50, #00B0BD)',
          borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,176,189,0.25)',
        }}>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>JF</span>
        </div>

        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', fontFamily: "'Inter', sans-serif", margin: '0 0 4px 0' }}>
            JobFlow
          </h1>
          <p style={{ fontSize: '12px', color: '#7A9CAE', fontFamily: "'Inter', sans-serif", margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Executive Job Tracker
          </p>
        </div>

        {/* Animated loading bar */}
        <div style={{ width: '200px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            width: '40%', height: '100%',
            background: 'linear-gradient(90deg, transparent, #00B0BD, transparent)',
            borderRadius: '2px',
            animation: 'indra-loading-bar 1.5s ease-in-out infinite',
          }} />
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
      case 'benchmark': return <BenchmarkPage />
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

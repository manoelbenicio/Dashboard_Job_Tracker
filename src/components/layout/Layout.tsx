import { Sidebar } from './Sidebar'
import { Bell } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  activePage: string
  onNavigate: (page: string) => void
  user?: any
}

const pageNames: Record<string, string> = {
  dashboard: 'Executive Dashboard',
  jobs: 'Job Applications',
  kanban: 'Kanban Board',
  resume: 'Resume Builder',
  benchmark: 'Executive Benchmark',
  analytics: 'Analytics',
  settings: 'Settings',
}

export function Layout({ children, activePage, onNavigate, user }: LayoutProps) {
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()
  const userPhoto = user?.photoURL

  return (
    <div className="indra-dash-shell">
      <Sidebar activePage={activePage} onNavigate={onNavigate} user={user} />

      <div className="indra-dash-main">
        {/* Top Bar */}
        <header className="indra-topbar">
          <h1 className="indra-topbar-title">
            JobFlow — {pageNames[activePage] || 'Dashboard'}
          </h1>
          <div className="indra-topbar-right">
            {/* Notification */}
            <div className="indra-notif-badge" title="Notifications">
              <Bell size={18} />
              <span className="indra-notif-dot" />
            </div>
            {/* Avatar */}
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                className="indra-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="indra-avatar" title={userName}>
                {userInitial}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="indra-dash-content">
          {children}
        </main>
      </div>
    </div>
  )
}

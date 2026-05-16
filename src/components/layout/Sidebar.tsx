import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  Trophy,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  path: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, path: 'jobs' },
  { id: 'kanban', label: 'Kanban', icon: Kanban, path: 'kanban' },
  { id: 'resume', label: 'Resume', icon: FileText, path: 'resume' },
  { id: 'benchmark', label: 'Benchmark', icon: Trophy, path: 'benchmark' },
  { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
]

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  user?: any
}

export function Sidebar({ activePage, onNavigate, user }: SidebarProps) {
  const { logout } = useAuth()

  return (
    <nav className="indra-sidebar" aria-label="Main navigation">
      {/* Logo Mark */}
      <div className="indra-sidebar-logo" aria-label="JobFlow">JF</div>

      {/* Nav Icons */}
      <div className="indra-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.path
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`indra-nav-icon ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <Icon size={22} />
            </button>
          )
        })}
      </div>

      {/* Bottom: Logout */}
      <div className="indra-sidebar-bottom">
        <button
          onClick={logout}
          className="indra-nav-icon"
          title="Sign Out"
        >
          <LogOut size={22} />
        </button>
      </div>
    </nav>
  )
}

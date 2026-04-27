import { useState } from 'react'
import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  FileText,
  Settings,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  path: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, path: 'jobs' },
  { id: 'kanban', label: 'Kanban Board', icon: Kanban, path: 'kanban' },
  { id: 'resume', label: 'Resume Builder', icon: FileText, path: 'resume' },
  { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
]

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'sidebar animate-slide-in-left',
        collapsed && 'w-16 px-2'
      )}
      style={collapsed ? { width: 'var(--sidebar-collapsed)' } : undefined}
    >
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Sparkles size={18} style={{ color: 'var(--color-on-primary)' }} />
          </div>
          {!collapsed && (
            <div>
              <h1
                className="text-lg font-bold"
                style={{ color: 'var(--color-on-surface)' }}
              >
                JobFlow
              </h1>
              <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '9px' }}>
                EXECUTIVE SUITE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Group */}
      <div className="flex-1">
        <span
          className="text-label-sm block mb-3 px-3"
          style={{
            color: 'var(--color-on-surface-variant)',
            fontSize: '10px',
            letterSpacing: '0.1em',
          }}
        >
          {!collapsed && 'MAIN MENU'}
        </span>

        <nav className="flex flex-col gap-1">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activePage === item.path

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  'sidebar-nav-item',
                  `animate-fade-in-up delay-${index + 1}`,
                  isActive && 'active',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="sidebar-nav-item mt-auto justify-center"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft
          size={18}
          style={{
            transform: collapsed ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--transition-base)',
          }}
        />
        {!collapsed && <span className="text-label-md">Collapse</span>}
      </button>

      {/* User Avatar */}
      <div
        className="mt-4 pt-4 flex items-center gap-3"
        style={{ borderTop: '1px solid var(--color-surface-container)' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{
            background: 'var(--gradient-primary)',
            color: 'var(--color-on-primary)',
          }}
        >
          U
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
              User
            </p>
            <p className="text-label-md">Free Plan</p>
          </div>
        )}
      </div>
    </aside>
  )
}

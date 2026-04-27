import { Sidebar } from './Sidebar'
import { Search, Bell, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

interface LayoutProps {
  children: React.ReactNode
  activePage: string
  onNavigate: (page: string) => void
}

export function Layout({ children, activePage, onNavigate }: LayoutProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('jobflow-theme')
    return (saved as 'dark' | 'light') || 'dark'
  })

  useEffect(() => {
    document.documentElement.className = theme
    localStorage.setItem('jobflow-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="main-content flex-1">
        {/* Top Bar */}
        <header
          className="flex items-center justify-between mb-8 animate-fade-in"
        >
          {/* Search */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 max-w-md"
            style={{
              background: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-surface-container)',
            }}
          >
            <Search size={16} style={{ color: 'var(--color-on-surface-variant)' }} />
            <input
              type="text"
              placeholder="Search applications, companies, or contacts..."
              className="bg-transparent border-none outline-none flex-1 text-sm"
              style={{
                color: 'var(--color-on-surface)',
                fontFamily: 'var(--font-primary)',
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all hover:opacity-80"
              style={{
                background: 'var(--color-surface-container)',
                color: 'var(--color-on-surface-variant)',
              }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="p-2 rounded-lg relative transition-all hover:opacity-80"
              style={{
                background: 'var(--color-surface-container)',
                color: 'var(--color-on-surface-variant)',
              }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--color-primary)' }}
              />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}

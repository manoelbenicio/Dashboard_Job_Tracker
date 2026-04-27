import { Sun, Moon, Monitor, Palette } from 'lucide-react'
import { useState, useEffect } from 'react'

const palettes = [
  { id: 'emerald', name: 'Emerald Executive', colors: ['#10B981', '#4edea3', '#3B82F6'] },
  { id: 'sapphire', name: 'Sapphire Corporate', colors: ['#2563EB', '#60A5FA', '#6366F1'] },
  { id: 'obsidian', name: 'Obsidian Slate', colors: ['#64748B', '#94A3B8', '#475569'] },
  { id: 'navy', name: 'Royal Navy', colors: ['#1E3A5F', '#3B82F6', '#0EA5E9'] },
  { id: 'burgundy', name: 'Burgundy & Gold', colors: ['#991B1B', '#DC2626', '#D97706'] },
]

export function SettingsPage() {
  const [currentPalette, setCurrentPalette] = useState(() =>
    localStorage.getItem('jobflow-palette') || 'emerald'
  )

  const theme = document.documentElement.className as 'dark' | 'light'

  useEffect(() => {
    if (currentPalette === 'emerald') {
      document.documentElement.removeAttribute('data-palette')
    } else {
      document.documentElement.setAttribute('data-palette', currentPalette)
    }
    localStorage.setItem('jobflow-palette', currentPalette)
  }, [currentPalette])

  return (
    <div>
      <div className="mb-8 animate-fade-in-up delay-1">
        <h1 className="text-headline" style={{ color: 'var(--color-on-surface)' }}>Settings</h1>
        <p className="text-body mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          Customize your JobFlow experience.
        </p>
      </div>

      {/* Appearance Section */}
      <div className="glass-card-elevated animate-fade-in-up delay-2 mb-6" style={{ border: '1px solid var(--glass-stroke)' }}>
        <div className="flex items-center gap-2 mb-6">
          {theme === 'dark' ? <Moon size={20} style={{ color: 'var(--color-primary)' }} /> : <Sun size={20} style={{ color: 'var(--color-primary)' }} />}
          <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Appearance</h2>
        </div>

        <div className="flex gap-3 mb-6">
          {[
            { mode: 'dark' as const, icon: Moon, label: 'Dark' },
            { mode: 'light' as const, icon: Sun, label: 'Light' },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => {
                document.documentElement.className = mode
                localStorage.setItem('jobflow-theme', mode)
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: theme === mode ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)',
                color: theme === mode ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                border: theme === mode ? '1px solid var(--color-primary)' : '1px solid transparent',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Corporate Palette Section */}
      <div className="glass-card-elevated animate-fade-in-up delay-3" style={{ border: '1px solid var(--glass-stroke)' }}>
        <div className="flex items-center gap-2 mb-6">
          <Palette size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Corporate Palette</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {palettes.map((palette) => (
            <button
              key={palette.id}
              onClick={() => setCurrentPalette(palette.id)}
              className="flex items-center gap-3 p-4 rounded-xl transition-all text-left"
              style={{
                background: currentPalette === palette.id ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)',
                border: currentPalette === palette.id ? '1px solid var(--color-primary)' : '1px solid var(--color-surface-container-high)',
              }}
            >
              <div className="flex -space-x-1">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: 'var(--color-surface-container)',
                    }}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>{palette.name}</p>
                <p className="text-label-md">{palette.id === 'emerald' ? 'Default' : 'Fortune 500'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

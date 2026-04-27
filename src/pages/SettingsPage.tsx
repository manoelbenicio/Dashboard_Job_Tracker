import { Sun, Moon, Palette, User, Key, Download, Upload } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useJobs } from '@/context/JobContext'
import { exportData, importData } from '@/lib/storage'

const palettes = [
  { id: 'emerald', name: 'Emerald Executive', colors: ['#10B981', '#4edea3', '#3B82F6'] },
  { id: 'sapphire', name: 'Sapphire Corporate', colors: ['#2563EB', '#60A5FA', '#6366F1'] },
  { id: 'obsidian', name: 'Obsidian Slate', colors: ['#64748B', '#94A3B8', '#475569'] },
  { id: 'navy', name: 'Royal Navy', colors: ['#1E3A5F', '#3B82F6', '#0EA5E9'] },
  { id: 'burgundy', name: 'Burgundy & Gold', colors: ['#991B1B', '#DC2626', '#D97706'] },
]

export function SettingsPage() {
  const { state, dispatch } = useJobs()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentPalette, setCurrentPalette] = useState(() => localStorage.getItem('jobflow-palette') || 'emerald')
  const [theme, setTheme] = useState(() => (localStorage.getItem('jobflow-theme') || 'dark') as 'dark' | 'light')
  const [toast, setToast] = useState('')

  const [name, setName] = useState(state.profile.name)
  const [email, setEmail] = useState(state.profile.email)
  const [skills, setSkills] = useState(state.profile.skills.join(', '))
  const [summary, setSummary] = useState(state.profile.summary)
  const [apiKey, setApiKey] = useState(state.profile.apiKey)

  useEffect(() => {
    document.documentElement.className = theme
    localStorage.setItem('jobflow-theme', theme)
  }, [theme])

  useEffect(() => {
    if (currentPalette === 'emerald') {
      document.documentElement.removeAttribute('data-palette')
    } else {
      document.documentElement.setAttribute('data-palette', currentPalette)
    }
    localStorage.setItem('jobflow-palette', currentPalette)
  }, [currentPalette])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const saveProfile = () => {
    dispatch({
      type: 'SET_PROFILE',
      payload: { name, email, skills: skills.split(',').map(s => s.trim()).filter(Boolean), summary, apiKey },
    })
    showToast('Profile saved!')
  }

  const handleExport = () => {
    const json = exportData(state.jobs, state.profile)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobflow-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported!')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importData(reader.result as string)
      if (result) {
        dispatch({ type: 'IMPORT_DATA', payload: result })
        showToast(`Imported ${result.jobs.length} jobs!`)
      } else {
        showToast('Invalid file format')
      }
    }
    reader.readAsText(file)
  }

  const fieldStyle = {
    background: 'var(--color-surface-container-lowest)',
    color: 'var(--color-on-surface)',
    border: '1px solid var(--color-surface-container-high)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: 'var(--font-primary)',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties

  return (
    <div className="max-w-3xl">
      <div className="mb-8 animate-fade-in-up delay-1">
        <h1 className="text-headline" style={{ color: 'var(--color-on-surface)' }}>Settings</h1>
        <p className="text-body mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>Customize your JobFlow experience.</p>
      </div>

      {/* Appearance */}
      <div className="glass-card-elevated animate-fade-in-up delay-2 mb-6" style={{ border: '1px solid var(--glass-stroke)' }}>
        <div className="flex items-center gap-2 mb-6">
          {theme === 'dark' ? <Moon size={20} style={{ color: 'var(--color-primary)' }} /> : <Sun size={20} style={{ color: 'var(--color-primary)' }} />}
          <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Appearance</h2>
        </div>
        <div className="flex gap-3 mb-6">
          {(['dark', 'light'] as const).map(m => (
            <button key={m} onClick={() => setTheme(m)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: theme === m ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)',
                color: theme === m ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                border: theme === m ? '1px solid var(--color-primary)' : '1px solid transparent',
              }}>
              {m === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Corporate Palette */}
      <div className="glass-card-elevated animate-fade-in-up delay-3 mb-6" style={{ border: '1px solid var(--glass-stroke)' }}>
        <div className="flex items-center gap-2 mb-6">
          <Palette size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Corporate Palette</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {palettes.map(p => (
            <button key={p.id} onClick={() => setCurrentPalette(p.id)}
              className="flex items-center gap-3 p-4 rounded-xl transition-all text-left"
              style={{
                background: currentPalette === p.id ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)',
                border: currentPalette === p.id ? '1px solid var(--color-primary)' : '1px solid var(--color-surface-container-high)',
              }}>
              <div className="flex -space-x-1">
                {p.colors.map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2" style={{ backgroundColor: c, borderColor: 'var(--color-surface-container)' }} />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>{p.name}</p>
                <p className="text-label-md">{p.id === 'emerald' ? 'Default' : 'Fortune 500'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile */}
      <div className="glass-card-elevated animate-fade-in-up delay-4 mb-6" style={{ border: '1px solid var(--glass-stroke)' }}>
        <div className="flex items-center gap-2 mb-6">
          <User size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Profile</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-label-md block mb-1.5">Name</label>
            <input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="text-label-md block mb-1.5">Email</label>
            <input style={fieldStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div className="col-span-2">
            <label className="text-label-md block mb-1.5">Skills (comma-separated)</label>
            <input style={fieldStyle} value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Leadership..." />
          </div>
          <div className="col-span-2">
            <label className="text-label-md block mb-1.5">Summary</label>
            <textarea style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief professional summary..." />
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="glass-card-elevated animate-fade-in-up delay-5 mb-6" style={{ border: '1px solid var(--glass-stroke)' }}>
        <div className="flex items-center gap-2 mb-6">
          <Key size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>AI Configuration</h2>
        </div>
        <label className="text-label-md block mb-1.5">Google Gemini API Key</label>
        <input style={fieldStyle} type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIza..." />
        <p className="text-label-md mt-2">Used for cover letter generation, interview guides, and Claire AI companion.</p>
      </div>

      {/* Save Button */}
      <button onClick={saveProfile}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 mb-6 animate-fade-in-up delay-6"
        style={{ background: 'var(--gradient-primary)', color: 'var(--color-on-primary)' }}>
        Save All Settings
      </button>

      {/* Data Management */}
      <div className="glass-card-elevated animate-fade-in-up delay-7 mb-6" style={{ border: '1px solid var(--glass-stroke)' }}>
        <div className="flex items-center gap-2 mb-6">
          <Download size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Data Management</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>
            <Download size={16} /> Export JSON
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>
            <Upload size={16} /> Import JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-medium animate-fade-in-up z-50"
          style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

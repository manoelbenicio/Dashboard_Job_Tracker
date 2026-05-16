import { Palette, User, Key, Download, Upload, BarChart3, Shield } from 'lucide-react'
import { useState, useRef } from 'react'
import { useJobs } from '@/context/JobContext'
import { exportData, importData } from '@/lib/storage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'

const fieldStyle: React.CSSProperties = {
  background: 'transparent', color: '#FFFFFF',
  border: 'none', borderBottom: '1px solid #B0B4BD',
  padding: '12px 14px', fontSize: '14px',
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  width: '100%', outline: 'none',
  transition: 'border-color 0.25s ease',
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'admin', label: 'Admin', icon: Shield },
]

export function SettingsPage() {
  const { state, dispatch } = useJobs()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  const [name, setName] = useState(state.profile.name)
  const [email, setEmail] = useState(state.profile.email)
  const [skills, setSkills] = useState(state.profile.skills.join(', '))
  const [summary, setSummary] = useState(state.profile.summary)
  const [apiKey, setApiKey] = useState(state.profile.apiKey)
  const [openaiApiKey, setOpenaiApiKey] = useState(state.profile.openaiApiKey || '')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const saveProfile = () => {
    dispatch({
      type: 'SET_PROFILE',
      payload: { name, email, skills: skills.split(',').map(s => s.trim()).filter(Boolean), summary, apiKey, openaiApiKey },
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

  return (
    <div>
      {/* Header */}
      <div className="indra-section-header">
        <p className="indra-section-eyebrow">Configuration</p>
        <h2 className="indra-section-title">Settings</h2>
        <p className="indra-panel-subtitle" style={{ marginTop: '4px' }}>Customize your JobFlow experience.</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0' }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', fontSize: '13px', fontWeight: isActive ? 600 : 400,
              color: isActive ? '#00B0BD' : '#7A9CAE',
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: isActive ? '2px solid #00B0BD' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '720px' }}>
          {/* Profile Section */}
          <div className="indra-panel" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <User size={20} style={{ color: '#00B0BD' }} />
              <h3 className="indra-panel-title">Profile</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="indra-form-label">Name</label>
                <input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="indra-form-label">Email</label>
                <input style={fieldStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
              <div className="col-span-2">
                <label className="indra-form-label">Skills (comma-separated)</label>
                <input style={fieldStyle} value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Leadership..." />
              </div>
              <div className="col-span-2">
                <label className="indra-form-label">Summary</label>
                <textarea style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief professional summary..." />
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div className="indra-panel" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Key size={20} style={{ color: '#00B0BD' }} />
              <h3 className="indra-panel-title">AI Configuration</h3>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="indra-form-label">Google Gemini API Key</label>
              <input style={fieldStyle} type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIza..." />
              <p style={{ fontSize: '12px', color: '#7A9CAE', marginTop: '8px' }}>
                Used for Benchmark Engine, cover letter generation, interview guides, and Claire AI.
              </p>
            </div>
            <div>
              <label className="indra-form-label">OpenAI / ChatGPT API Key</label>
              <input style={fieldStyle} type="password" value={openaiApiKey} onChange={e => setOpenaiApiKey(e.target.value)} placeholder="sk-..." />
              <p style={{ fontSize: '12px', color: '#7A9CAE', marginTop: '8px' }}>
                Optional. Used as fallback provider for AI features. Get yours at platform.openai.com.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button onClick={saveProfile} className="indra-btn-cyan" style={{ width: '100%', marginBottom: '24px' }}>
            Save All Settings
          </button>

          {/* Appearance */}
          <div className="indra-panel" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Palette size={20} style={{ color: '#00B0BD' }} />
              <h3 className="indra-panel-title">Appearance</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#7A9CAE', marginBottom: '8px' }}>
              The Indra Corporate Design System (DSS v3.0) is active as the default theme.
            </p>
          </div>

          {/* Data Management */}
          <div className="indra-panel" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Download size={20} style={{ color: '#00B0BD' }} />
              <h3 className="indra-panel-title">Data Management</h3>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleExport} className="indra-btn-secondary" style={{ gap: '8px' }}>
                <Download size={16} /> Export JSON
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="indra-btn-secondary" style={{ gap: '8px' }}>
                <Upload size={16} /> Import JSON
              </button>
              <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            </div>
          </div>
        </div>
      )}

      {/* Admin Tab — Embedded Analytics */}
      {activeTab === 'admin' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart3 size={20} style={{ color: '#00B0BD' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>Analytics & Reports</h3>
          </div>
          <AnalyticsPage />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          padding: '12px 20px', background: '#00B0BD', color: '#002B3A',
          fontSize: '14px', fontWeight: 600, zIndex: 50,
          animation: 'indra-slide-up 0.3s ease-out',
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}

import { Palette, User, Key, Download, Upload, BarChart3, Shield, Trash2, AlertTriangle } from 'lucide-react'
import { useState, useRef } from 'react'
import { useJobs } from '@/context/JobContext'
import { exportData, importData } from '@/lib/storage'
import { softDeleteAccount } from '@/lib/governance'
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

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

          {/* Danger Zone — Account Deletion */}
          <div className="indra-panel" style={{ marginBottom: '24px', borderColor: 'rgba(233,30,99,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle size={20} style={{ color: '#E91E63' }} />
              <h3 className="indra-panel-title" style={{ color: '#E91E63' }}>Danger Zone</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#7A9CAE', marginBottom: '16px', lineHeight: 1.6 }}>
              Requesting account deletion will soft-delete your profile. Your data will be retained for <strong style={{ color: '#FFFFFF' }}>5 years</strong> for legal compliance, but will be inaccessible. This action is irreversible.
            </p>
            <button onClick={() => setShowDeleteDialog(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', background: 'rgba(233,30,99,0.08)',
                border: '1px solid rgba(233,30,99,0.25)', borderRadius: '6px',
                color: '#E91E63', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(233,30,99,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(233,30,99,0.08)')}
            >
              <Trash2 size={14} /> Excluir Minha Conta
            </button>
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

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDeleteDialog(false) }}>
          <div className="w-full max-w-md indra-panel" style={{ animation: 'indra-slide-up 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <AlertTriangle size={24} style={{ color: '#E91E63' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 300, color: '#FFFFFF' }}>Confirmar Exclusão</h2>
            </div>
            <p style={{ fontSize: '14px', color: '#B3C1DA', marginBottom: '16px', lineHeight: 1.6 }}>
              Esta ação irá desativar sua conta. Seus dados serão retidos por <strong style={{ color: '#FFFFFF' }}>5 anos</strong> para conformidade legal, mas você não poderá acessá-los.
            </p>
            <p style={{ fontSize: '13px', color: '#7A9CAE', marginBottom: '8px' }}>
              Digite <strong style={{ color: '#E91E63' }}>EXCLUIR</strong> para confirmar:
            </p>
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="EXCLUIR"
              style={{ ...fieldStyle, marginBottom: '16px', borderBottomColor: deleteConfirm === 'EXCLUIR' ? '#E91E63' : '#B0B4BD' }}
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteDialog(false); setDeleteConfirm('') }} className="indra-btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button
                disabled={deleteConfirm !== 'EXCLUIR' || deleting}
                onClick={async () => {
                  setDeleting(true)
                  try {
                    await softDeleteAccount()
                    // Auth sign-out already handled by governance service
                    // Page will redirect to login via auth listener
                  } catch (err: any) {
                    showToast('Erro: ' + (err.message || 'Falha ao excluir conta'))
                    setDeleting(false)
                  }
                }}
                className="indra-btn-cyan"
                style={{
                  flex: 1,
                  background: deleteConfirm === 'EXCLUIR' ? '#E91E63' : '#555',
                  opacity: deleteConfirm === 'EXCLUIR' && !deleting ? 1 : 0.5,
                  cursor: deleteConfirm === 'EXCLUIR' && !deleting ? 'pointer' : 'not-allowed',
                }}
              >
                {deleting ? 'Processando...' : 'Excluir Conta'}
              </button>
            </div>
          </div>
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

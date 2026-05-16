import { useState } from 'react'
import { Sparkles, FileText, GraduationCap, Copy, Check, X, AlertCircle } from 'lucide-react'
import { Job } from '@/types'
import { useJobs } from '@/context/JobContext'
import { generateCoverLetter, generateInterviewGuide } from '@/lib/ai'

function ShimmerBlock({ lines = 4 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: '14px', width: i === lines - 1 ? '60%' : '100%',
          background: 'rgba(0,176,189,0.08)', animation: 'pulse 1.4s infinite ease-in-out',
        }} />
      ))}
    </div>
  )
}

interface AIToolsPanelProps { job: Job; onClose: () => void }

export function AIToolsPanel({ job, onClose }: AIToolsPanelProps) {
  const { state, dispatch } = useJobs()
  const [activeTab, setActiveTab] = useState<'cover' | 'interview'>('cover')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const apiKey = state.profile.apiKey
  const hasKey = !!apiKey
  const content = activeTab === 'cover' ? job.coverLetter : job.interviewGuide

  const handleGenerate = async () => {
    if (!hasKey) { setError('Please set your Gemini API key in Settings first.'); return }
    setLoading(true); setError('')
    try {
      let result: string
      if (activeTab === 'cover') {
        result = await generateCoverLetter({ apiKey, company: job.company, role: job.role, description: job.description, userName: state.profile.name, userSkills: state.profile.skills, userSummary: state.profile.summary })
        dispatch({ type: 'UPDATE_JOB', payload: { ...job, coverLetter: result } })
      } else {
        result = await generateInterviewGuide({ apiKey, company: job.company, role: job.role, description: job.description, status: job.status })
        dispatch({ type: 'UPDATE_JOB', payload: { ...job, interviewGuide: result } })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Check your API key.')
    } finally { setLoading(false) }
  }

  const handleCopy = async () => {
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px', fontSize: '13px', fontWeight: 500,
    background: active ? 'rgba(0,176,189,0.12)' : 'transparent',
    color: active ? '#00B0BD' : '#7A9CAE',
    border: active ? '1px solid #00B0BD' : '1px solid transparent',
    cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: "'Inter', sans-serif",
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: '100%', maxWidth: '720px', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        background: '#002B3A', border: '1px solid rgba(255,255,255,0.08)',
        animation: 'indra-slide-up 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #003E50, #00B0BD)' }}>
              <Sparkles size={20} style={{ color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>AI Assistant</h2>
              <p style={{ fontSize: '12px', color: '#7A9CAE', margin: 0 }}>{job.role} at {job.company}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7A9CAE', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '16px 24px 0' }}>
          <button onClick={() => { setActiveTab('cover'); setError('') }} style={tabStyle(activeTab === 'cover')}>
            <FileText size={16} /> Cover Letter
          </button>
          <button onClick={() => { setActiveTab('interview'); setError('') }} style={tabStyle(activeTab === 'interview')}>
            <GraduationCap size={16} /> Interview Guide
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px', background: 'rgba(233,30,99,0.1)', color: '#E91E63' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div>
              <p style={{ fontSize: '13px', color: '#7A9CAE', marginBottom: '8px' }}>
                <Sparkles size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px', color: '#00B0BD' }} />
                Generating {activeTab === 'cover' ? 'cover letter' : 'interview guide'}...
              </p>
              <ShimmerBlock lines={activeTab === 'cover' ? 8 : 12} />
            </div>
          ) : content ? (
            <div style={{
              fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-wrap',
              padding: '16px', background: '#003E50', color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: "'Inter', sans-serif",
            }}>
              {content}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#7A9CAE' }}>
              {activeTab === 'cover' ? <FileText size={40} style={{ opacity: 0.3, marginBottom: '12px' }} /> : <GraduationCap size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />}
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                {activeTab === 'cover' ? 'No cover letter yet' : 'No interview guide yet'}
              </p>
              <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '300px' }}>
                Click generate to create a {activeTab === 'cover' ? 'tailored cover letter' : 'comprehensive interview prep guide'} powered by Gemini AI.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleGenerate} disabled={loading} className="indra-btn-cyan" style={{ gap: '8px', opacity: loading ? 0.5 : 1 }}>
            <Sparkles size={16} />
            {loading ? 'Generating...' : content ? 'Regenerate' : 'Generate'}
          </button>
          {content && (
            <button onClick={handleCopy} className="indra-btn-secondary" style={{ gap: '8px' }}>
              {copied ? <Check size={16} style={{ color: '#00B0BD' }} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

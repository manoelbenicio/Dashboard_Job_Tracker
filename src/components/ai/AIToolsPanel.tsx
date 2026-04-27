import { useState } from 'react'
import { Sparkles, FileText, GraduationCap, Copy, Check, X, AlertCircle } from 'lucide-react'
import { Job } from '@/types'
import { useJobs } from '@/context/JobContext'
import { generateCoverLetter, generateInterviewGuide } from '@/lib/ai'

interface AIToolsPanelProps {
  job: Job
  onClose: () => void
}

/* ─── Shimmer Loading ────────────────────────────────── */

function ShimmerBlock({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="rounded-md animate-pulse"
          style={{
            height: '14px',
            width: i === lines - 1 ? '60%' : '100%',
            background: 'var(--color-surface-container-high)',
          }}
        />
      ))}
    </div>
  )
}

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
    if (!hasKey) {
      setError('Please set your Gemini API key in Settings first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      let result: string

      if (activeTab === 'cover') {
        result = await generateCoverLetter({
          apiKey,
          company: job.company,
          role: job.role,
          description: job.description,
          userName: state.profile.name,
          userSkills: state.profile.skills,
          userSummary: state.profile.summary,
        })
        dispatch({ type: 'UPDATE_JOB', payload: { ...job, coverLetter: result } })
      } else {
        result = await generateInterviewGuide({
          apiKey,
          company: job.company,
          role: job.role,
          description: job.description,
          status: job.status,
        })
        dispatch({ type: 'UPDATE_JOB', payload: { ...job, interviewGuide: result } })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col animate-fade-in-up rounded-2xl"
        style={{
          background: 'var(--color-surface-container)',
          border: '1px solid var(--glass-stroke)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Sparkles size={20} style={{ color: 'var(--color-on-primary)' }} />
            </div>
            <div>
              <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>
                AI Assistant
              </h2>
              <p className="text-label-md">
                {job.role} at {job.company}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70" style={{ color: 'var(--color-on-surface-variant)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4">
          <button
            onClick={() => { setActiveTab('cover'); setError('') }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeTab === 'cover' ? 'var(--color-surface-container-high)' : 'transparent',
              color: activeTab === 'cover' ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
              border: activeTab === 'cover' ? '1px solid var(--color-primary)' : '1px solid transparent',
            }}
          >
            <FileText size={16} /> Cover Letter
          </button>
          <button
            onClick={() => { setActiveTab('interview'); setError('') }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeTab === 'interview' ? 'var(--color-surface-container-high)' : 'transparent',
              color: activeTab === 'interview' ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
              border: activeTab === 'interview' ? '1px solid var(--color-primary)' : '1px solid transparent',
            }}
          >
            <GraduationCap size={16} /> Interview Guide
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {loading ? (
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>
                <Sparkles size={14} className="inline mr-1" style={{ color: 'var(--color-primary)' }} />
                Generating {activeTab === 'cover' ? 'cover letter' : 'interview guide'}...
              </p>
              <ShimmerBlock lines={activeTab === 'cover' ? 8 : 12} />
            </div>
          ) : content ? (
            <div
              className="text-sm leading-relaxed whitespace-pre-wrap rounded-xl p-4"
              style={{
                background: 'var(--color-surface-container-lowest)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-surface-container-high)',
                fontFamily: activeTab === 'interview' ? 'var(--font-primary)' : 'var(--font-primary)',
              }}
            >
              {content}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--color-on-surface-variant)' }}>
              {activeTab === 'cover' ? <FileText size={40} className="opacity-30 mb-3" /> : <GraduationCap size={40} className="opacity-30 mb-3" />}
              <p className="text-title-sm mb-1" style={{ color: 'var(--color-on-surface)' }}>
                {activeTab === 'cover' ? 'No cover letter yet' : 'No interview guide yet'}
              </p>
              <p className="text-label-md text-center max-w-xs">
                Click generate to create a {activeTab === 'cover' ? 'tailored cover letter' : 'comprehensive interview prep guide'} powered by Gemini AI.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 pt-4" style={{ borderTop: '1px solid var(--color-surface-container-high)' }}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--gradient-primary)', color: 'var(--color-on-primary)' }}
          >
            <Sparkles size={16} />
            {loading ? 'Generating...' : content ? 'Regenerate' : 'Generate'}
          </button>

          {content && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
            >
              {copied ? <Check size={16} style={{ color: 'var(--color-primary)' }} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

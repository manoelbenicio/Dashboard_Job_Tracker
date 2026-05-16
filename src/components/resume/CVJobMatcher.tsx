import { useState, useRef } from 'react'
import { FileUp, Link2, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { parseUploadedCV, generateTailoredCV, type ParsedResume } from '@/lib/resumeService'
import { useJobs } from '@/context/JobContext'

interface Props {
  onGenerate: (data: ParsedResume) => void
}

export function CVJobMatcher({ onGenerate }: Props) {
  const { state } = useJobs()
  const apiKey = state.profile.apiKey
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvData, setCvData] = useState<ParsedResume | null>(null)
  const [jobUrl, setJobUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'job' | 'generating'>('upload')
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvFile(file)
    setLoading(true)
    setError('')

    const result = await parseUploadedCV(file)
    setLoading(false)

    if (result.success && result.data) {
      setCvData(result.data)
      setStep('job')
    } else {
      setError(result.error || 'Failed to parse CV')
    }
  }

  const handleGenerate = async () => {
    if (!cvData) return
    if (!apiKey) {
      setError('Please set your Gemini API key in Settings first')
      return
    }

    const desc = jobDescription || `Job posting URL: ${jobUrl}`
    if (!desc.trim()) {
      setError('Please provide a job URL or description')
      return
    }

    setStep('generating')
    setLoading(true)
    setError('')

    const result = await generateTailoredCV(cvData, desc, apiKey)
    setLoading(false)

    if (result.success && result.data) {
      onGenerate(result.data)
    } else {
      setError(result.error || 'AI generation failed')
      setStep('job')
    }
  }

  return (
    <div className="indra-panel" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '36px', height: '36px', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
          <Sparkles size={20} style={{ color: '#8B5CF6' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>CV + Job Matcher</h3>
          <p style={{ fontSize: '12px', color: '#7A9CAE' }}>Upload your CV and a job posting — AI creates a tailored version</p>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['Upload CV', 'Job Details', 'Generate'].map((label, i) => {
          const stepIdx = ['upload', 'job', 'generating'].indexOf(step)
          const isActive = i === stepIdx
          const isDone = i < stepIdx
          return (
            <div key={label} style={{
              flex: 1, padding: '8px', textAlign: 'center', fontSize: '11px',
              fontWeight: isActive ? 600 : 400, letterSpacing: '0.04em',
              color: isActive ? '#8B5CF6' : isDone ? '#10B981' : '#7A9CAE',
              borderBottom: `2px solid ${isActive ? '#8B5CF6' : isDone ? '#10B981' : 'rgba(255,255,255,0.08)'}`,
              textTransform: 'uppercase',
            }}>
              {isDone ? '✓ ' : ''}{label}
            </div>
          )
        })}
      </div>

      {/* Step 1: Upload CV */}
      {step === 'upload' && (
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          padding: '32px', border: '2px dashed rgba(139,92,246,0.3)', borderRadius: '8px',
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}>
          {loading ? (
            <Loader2 size={32} className="animate-spin" style={{ color: '#8B5CF6' }} />
          ) : (
            <FileUp size={32} style={{ color: '#8B5CF6' }} />
          )}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>
              {cvFile ? cvFile.name : 'Drop your CV here or click to upload'}
            </p>
            <p style={{ fontSize: '11px', color: '#7A9CAE', marginTop: '4px' }}>PDF, DOCX, TXT, MD, JSON</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md,.json" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
      )}

      {/* Step 2: Job Details */}
      {step === 'job' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#7A9CAE', marginBottom: '6px', display: 'block' }}>Job Posting URL</label>
            <div style={{ position: 'relative' }}>
              <Link2 size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7A9CAE' }} />
              <input
                value={jobUrl}
                onChange={e => setJobUrl(e.target.value)}
                placeholder="https://careers.company.com/job/..."
                style={{
                  width: '100%', padding: '10px 12px 10px 34px', fontSize: '13px',
                  background: '#003E50', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px', color: '#FFFFFF', outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '11px', color: '#7A9CAE' }}>or paste description</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            style={{
              width: '100%', minHeight: '120px', padding: '12px', fontSize: '13px',
              background: '#003E50', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px', color: '#FFFFFF', outline: 'none', resize: 'vertical',
              fontFamily: "'Inter', sans-serif",
            }}
          />

          <button onClick={handleGenerate} className="indra-btn-cyan" style={{ width: '100%', marginTop: '16px', gap: '8px' }}>
            <Sparkles size={16} /> Generate Tailored CV
          </button>
        </div>
      )}

      {/* Step 3: Generating */}
      {step === 'generating' && loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '32px' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#8B5CF6' }} />
          <p style={{ fontSize: '14px', color: '#FFFFFF' }}>AI is tailoring your CV...</p>
          <p style={{ fontSize: '12px', color: '#7A9CAE' }}>Analyzing job requirements and optimizing your experience</p>
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px', background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px',
          display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px',
        }}>
          <AlertCircle size={14} style={{ color: '#EF4444' }} />
          <span style={{ fontSize: '12px', color: '#EF4444' }}>{error}</span>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Target, Loader2, MapPin, DollarSign, Sparkles, AlertCircle } from 'lucide-react'
import { useJobs } from '@/context/JobContext'
import { generateTailoredCV, type ParsedResume } from '@/lib/resumeService'

interface Props {
  currentResume: ParsedResume
  onGenerate: (data: ParsedResume) => void
}

export function PositionMatcher({ currentResume, onGenerate }: Props) {
  const { state } = useJobs()
  const apiKey = state.profile.apiKey
  const [loading, setLoading] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Get only "Under Review" jobs
  const underReviewJobs = state.jobs.filter(j => j.status === 'under_review')

  const handleGenerate = async (jobId: string) => {
    const job = state.jobs.find(j => j.id === jobId)
    if (!job) return
    if (!apiKey) {
      setError('Please set your Gemini API key in Settings first')
      return
    }

    setSelectedJobId(jobId)
    setLoading(true)
    setError('')

    const jobDesc = `
Position: ${job.role}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Salary: ${job.salary || 'Not specified'}
Description: ${job.description || 'No description available'}
URL: ${job.url || ''}
    `.trim()

    const result = await generateTailoredCV(currentResume, jobDesc, apiKey)
    setLoading(false)

    if (result.success && result.data) {
      onGenerate(result.data)
    } else {
      setError(result.error || 'Failed to generate CV')
    }
  }

  return (
    <div className="indra-panel" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '36px', height: '36px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
          <Target size={20} style={{ color: '#10B981' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>Position Matcher</h3>
          <p style={{ fontSize: '12px', color: '#7A9CAE' }}>Generate a CV optimized for your "Under Review" positions</p>
        </div>
      </div>

      {underReviewJobs.length === 0 ? (
        <div style={{
          padding: '24px', textAlign: 'center',
          border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '8px',
        }}>
          <Target size={24} style={{ color: '#7A9CAE', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '13px', color: '#7A9CAE' }}>No positions under review</p>
          <p style={{ fontSize: '11px', color: '#7A9CAE', marginTop: '4px' }}>
            Drag job cards to "Under Review" in the Kanban board to see them here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {underReviewJobs.map(job => (
            <div key={job.id} style={{
              background: '#003E50', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', padding: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {job.role}
                </p>
                <p style={{ fontSize: '12px', color: '#7A9CAE' }}>{job.company}</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  {job.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#7A9CAE' }}>
                      <MapPin size={10} /> {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#7A9CAE' }}>
                      <DollarSign size={10} /> {job.salary}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleGenerate(job.id)}
                disabled={loading}
                className="indra-btn-cyan"
                style={{ padding: '8px 16px', fontSize: '12px', flexShrink: 0, opacity: loading && selectedJobId === job.id ? 0.5 : 1 }}
              >
                {loading && selectedJobId === job.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <><Sparkles size={14} /> Generate</>
                )}
              </button>
            </div>
          ))}
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

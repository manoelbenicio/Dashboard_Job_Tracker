import { useState } from 'react'
import { Plus, Search, Filter, Pencil, Trash2, ExternalLink, X, Sparkles, Link2, Loader2, AlertCircle } from 'lucide-react'
import { useJobs } from '@/context/JobContext'
import { Job, JOB_STATUSES, type JobStatus } from '@/types'
import { AIToolsPanel } from '@/components/ai/AIToolsPanel'

const DOCLING_API = 'http://localhost:8001' // TODO: replace with Gemini-based scraper in Phase 32

/* ─── Indra Form Input Style ─── */
const fieldStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#FFFFFF',
  border: 'none',
  borderBottom: '1px solid #B0B4BD',
  padding: '12px 14px',
  fontSize: '14px',
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.25s ease',
}

/* ─── Prefill type from URL scraper ─── */
interface PrefillData { company?: string; role?: string; description?: string; salary?: string; location?: string; url?: string }

/* ─── Job Form Modal ──────────────────────────────────── */
function JobFormModal({ job, onClose, prefill }: { job?: Job; onClose: () => void; prefill?: PrefillData }) {
  const { dispatch } = useJobs()
  const isEdit = !!job

  const [form, setForm] = useState({
    company: prefill?.company || job?.company || '',
    role: prefill?.role || job?.role || '',
    status: job?.status || 'applied' as JobStatus,
    salary: prefill?.salary || job?.salary || '',
    location: prefill?.location || job?.location || '',
    description: prefill?.description || job?.description || '',
    url: prefill?.url || job?.url || '',
    origin: job?.origin || 'application' as Job['origin'],
    notes: job?.notes || '',
    coverLetter: job?.coverLetter || '',
    interviewGuide: job?.interviewGuide || '',
    appliedDate: job?.appliedDate ? new Date(job.appliedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company || !form.role) return
    if (isEdit && job) {
      dispatch({ type: 'UPDATE_JOB', payload: { ...job, ...form, appliedDate: new Date(form.appliedDate).toISOString() } })
    } else {
      dispatch({ type: 'ADD_JOB', payload: { ...form, comments: [], appliedDate: new Date(form.appliedDate).toISOString() } })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto indra-panel" style={{ animation: 'indra-slide-up 0.3s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 300, color: '#FFFFFF' }}>
            {isEdit ? 'Edit Application' : 'New Application'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7A9CAE', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="indra-form-label">Company *</label>
            <input style={fieldStyle} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Google" required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="indra-form-label">Role *</label>
            <input style={fieldStyle} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Senior Engineer" required />
          </div>
          <div>
            <label className="indra-form-label">Status</label>
            <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as JobStatus }))}>
              {JOB_STATUSES.map(s => <option key={s.value} value={s.value} style={{ background: '#003E50' }}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="indra-form-label">Origin</label>
            <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value as Job['origin'] }))}>
              {['application','referral','recruiter','other'].map(o => <option key={o} value={o} style={{ background: '#003E50' }}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="indra-form-label">Salary Range</label>
            <input style={fieldStyle} value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="$120k - $180k" />
          </div>
          <div>
            <label className="indra-form-label">Location</label>
            <input style={fieldStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="San Francisco, CA" />
          </div>
          <div>
            <label className="indra-form-label">Applied Date</label>
            <input style={fieldStyle} type="date" value={form.appliedDate} onChange={e => setForm(f => ({ ...f, appliedDate: e.target.value }))} />
          </div>
          <div>
            <label className="indra-form-label">Job URL</label>
            <input style={fieldStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="col-span-2">
            <label className="indra-form-label">Description</label>
            <textarea style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief job description..." />
          </div>
          <div className="col-span-2">
            <label className="indra-form-label">Notes</label>
            <textarea style={{ ...fieldStyle, minHeight: '60px', resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Personal notes..." />
          </div>
          <div className="col-span-2 flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="indra-btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="indra-btn-cyan" style={{ flex: 1 }}>{isEdit ? 'Save Changes' : 'Add Application'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Delete Confirmation Modal ───────────────────────── */
function DeleteModal({ job, onConfirm, onClose }: { job: Job; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md indra-panel" style={{ animation: 'indra-slide-up 0.3s ease-out' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 300, color: '#FFFFFF', marginBottom: '8px' }}>Delete Application</h2>
        <p style={{ fontSize: '14px', color: '#B3C1DA', marginBottom: '24px', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: '#FFFFFF' }}>{job.role}</strong> at <strong style={{ color: '#FFFFFF' }}>{job.company}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="indra-btn-secondary" style={{ flex: 1 }}>Cancel</button>
          <button onClick={onConfirm} className="indra-btn-cyan" style={{ flex: 1, background: '#E91E63' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Jobs Page ───────────────────────────────────────── */
export function JobsPage() {
  const { state, dispatch, filteredJobs } = useJobs()
  const [showForm, setShowForm] = useState(false)
  const [editJob, setEditJob] = useState<Job | undefined>()
  const [deleteJob, setDeleteJob] = useState<Job | undefined>()
  const [aiJob, setAiJob] = useState<Job | undefined>()
  const [jobUrl, setJobUrl] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [prefillData, setPrefillData] = useState<PrefillData | undefined>()

  const handleEdit = (job: Job) => { setEditJob(job); setShowForm(true) }
  const handleDelete = (job: Job) => { setDeleteJob(job) }
  const confirmDelete = () => { if (deleteJob) { dispatch({ type: 'DELETE_JOB', payload: deleteJob.id }); setDeleteJob(undefined) } }

  const fetchJobFromUrl = async () => {
    if (!jobUrl.trim()) return
    setUrlLoading(true); setUrlError('')
    try {
      const res = await fetch(`${DOCLING_API}/api/scrape-job`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Server error' }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      const result = await res.json()
      const data = result.data || result
      setPrefillData({ company: data.company, role: data.role, description: data.description, salary: data.salary, location: data.location, url: jobUrl.trim() })
      setEditJob(undefined)
      setShowForm(true)
      setJobUrl('')
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : 'Could not extract job details. Please fill manually.')
    } finally {
      setUrlLoading(false)
    }
  }

  const statusToCss = (status: string) => {
    const map: Record<string, string> = {
      applied: 'applied', saved: 'saved', interview: 'interview',
      offer: 'offer', accepted: 'offer', rejected: 'rejected',
    }
    return map[status] || 'applied'
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="indra-section-header" style={{ marginBottom: 0 }}>
          <p className="indra-section-eyebrow">Registry</p>
          <h2 className="indra-section-title">Job Applications</h2>
          <p className="indra-panel-subtitle" style={{ marginTop: '4px' }}>
            {filteredJobs.length} of {state.jobs.length} applications
          </p>
        </div>
        <button onClick={() => { setEditJob(undefined); setShowForm(true) }} className="indra-btn-cyan" style={{ gap: '8px' }}>
          <Plus size={16} /> Add Application
        </button>
      </div>

      {/* URL Scraper Bar */}
      <div className="indra-panel" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link2 size={20} style={{ color: '#00B0BD', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <input
              value={jobUrl}
              onChange={e => { setJobUrl(e.target.value); setUrlError('') }}
              onKeyDown={e => { if (e.key === 'Enter') fetchJobFromUrl() }}
              placeholder="Paste a job URL (LinkedIn, Indeed, Glassdoor...) and auto-fill your application"
              style={{ ...fieldStyle, padding: '8px 0', fontSize: '14px' }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = '#00B0BD')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = '#B0B4BD')}
            />
          </div>
          <button
            onClick={fetchJobFromUrl}
            disabled={!jobUrl.trim() || urlLoading}
            className="indra-btn-cyan"
            style={{ gap: '8px', opacity: (!jobUrl.trim() || urlLoading) ? 0.5 : 1, whiteSpace: 'nowrap' }}
          >
            {urlLoading ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
            {urlLoading ? 'Fetching...' : 'Fetch Job'}
          </button>
        </div>
        {urlError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '13px', color: '#E91E63' }}>
            <AlertCircle size={14} /> {urlError}
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '360px', borderBottom: '1px solid #B0B4BD', padding: '8px 0' }}>
          <Search size={16} style={{ color: '#7A9CAE' }} />
          <input
            type="text"
            placeholder="Search company or role..."
            style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
            value={state.searchQuery}
            onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: '#7A9CAE' }} />
          <select
            style={{ ...fieldStyle, width: 'auto', padding: '8px 12px', fontSize: '13px' }}
            value={state.statusFilter}
            onChange={e => dispatch({ type: 'SET_STATUS_FILTER', payload: e.target.value })}
          >
            <option value="all" style={{ background: '#003E50' }}>All Status</option>
            {JOB_STATUSES.map(s => <option key={s.value} value={s.value} style={{ background: '#003E50' }}>{s.label}</option>)}
          </select>
          <select
            style={{ ...fieldStyle, width: 'auto', padding: '8px 12px', fontSize: '13px' }}
            value={state.originFilter}
            onChange={e => dispatch({ type: 'SET_ORIGIN_FILTER', payload: e.target.value })}
          >
            <option value="all" style={{ background: '#003E50' }}>All Origins</option>
            {['application','referral','recruiter','other'].map(o => <option key={o} value={o} style={{ background: '#003E50' }}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="indra-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="indra-table-wrap">
          <table className="indra-table">
            <thead>
              <tr>
                {['Company', 'Role', 'Status', 'Salary', 'Location', 'Applied', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id} style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => (window as any).__jobflow_viewJob?.(job.id)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,176,189,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px', height: '32px', background: 'rgba(0,176,189,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700, color: '#00B0BD',
                      }}>
                        {job.company[0]}
                      </div>
                      <strong>{job.company}</strong>
                    </div>
                  </td>
                  <td><strong>{job.role}</strong></td>
                  <td>
                    <span className={`indra-status-badge ${statusToCss(job.status)}`}>
                      {JOB_STATUSES.find(s => s.value === job.status)?.label}
                    </span>
                  </td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{job.salary || '—'}</td>
                  <td>{job.location || '—'}</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => setAiJob(job)} style={{ background: 'none', border: 'none', color: '#00B0BD', cursor: 'pointer', padding: '6px' }} title="AI Assistant"><Sparkles size={14} /></button>
                      <button onClick={() => handleEdit(job)} style={{ background: 'none', border: 'none', color: '#7A9CAE', cursor: 'pointer', padding: '6px' }} title="Edit"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(job)} style={{ background: 'none', border: 'none', color: '#E91E63', cursor: 'pointer', padding: '6px' }} title="Delete"><Trash2 size={14} /></button>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: '#7A9CAE', padding: '6px' }} title="Open URL"><ExternalLink size={14} /></a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: '#7A9CAE' }}>
            <Search size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No applications found</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your filters or add a new application</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && <JobFormModal job={editJob} prefill={prefillData} onClose={() => { setShowForm(false); setEditJob(undefined); setPrefillData(undefined) }} />}
      {deleteJob && <DeleteModal job={deleteJob} onConfirm={confirmDelete} onClose={() => setDeleteJob(undefined)} />}
      {aiJob && <AIToolsPanel job={aiJob} onClose={() => setAiJob(undefined)} />}
    </div>
  )
}

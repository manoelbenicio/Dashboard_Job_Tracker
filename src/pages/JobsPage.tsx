import { useState } from 'react'
import { Plus, Search, Filter, Pencil, Trash2, ExternalLink, X, Sparkles } from 'lucide-react'
import { useJobs } from '@/context/JobContext'
import { Job, JOB_STATUSES, type JobStatus } from '@/types'
import { AIToolsPanel } from '@/components/ai/AIToolsPanel'

/* ─── Job Form Modal ──────────────────────────────────── */

interface JobFormProps {
  job?: Job
  onClose: () => void
}

function JobFormModal({ job, onClose }: JobFormProps) {
  const { dispatch } = useJobs()
  const isEdit = !!job

  const [form, setForm] = useState({
    company: job?.company || '',
    role: job?.role || '',
    status: job?.status || 'applied' as JobStatus,
    salary: job?.salary || '',
    location: job?.location || '',
    description: job?.description || '',
    url: job?.url || '',
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
      dispatch({
        type: 'UPDATE_JOB',
        payload: { ...job, ...form, appliedDate: new Date(form.appliedDate).toISOString() },
      })
    } else {
      dispatch({
        type: 'ADD_JOB',
        payload: { ...form, appliedDate: new Date(form.appliedDate).toISOString() },
      })
    }
    onClose()
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
    transition: 'border-color var(--transition-fast)',
  } as React.CSSProperties

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up rounded-2xl"
        style={{
          background: 'var(--color-surface-container)',
          border: '1px solid var(--glass-stroke)',
          padding: 'var(--space-xl)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title" style={{ color: 'var(--color-on-surface)' }}>
            {isEdit ? 'Edit Application' : 'New Application'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70" style={{ color: 'var(--color-on-surface-variant)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-label-md block mb-1.5">Company *</label>
            <input style={fieldStyle} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Google" required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-label-md block mb-1.5">Role *</label>
            <input style={fieldStyle} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Senior Engineer" required />
          </div>
          <div>
            <label className="text-label-md block mb-1.5">Status</label>
            <select style={fieldStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as JobStatus }))}>
              {JOB_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label-md block mb-1.5">Origin</label>
            <select style={fieldStyle} value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value as Job['origin'] }))}>
              <option value="application">Application</option>
              <option value="referral">Referral</option>
              <option value="recruiter">Recruiter</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-label-md block mb-1.5">Salary Range</label>
            <input style={fieldStyle} value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="$120k - $180k" />
          </div>
          <div>
            <label className="text-label-md block mb-1.5">Location</label>
            <input style={fieldStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="San Francisco, CA" />
          </div>
          <div>
            <label className="text-label-md block mb-1.5">Applied Date</label>
            <input style={fieldStyle} type="date" value={form.appliedDate} onChange={e => setForm(f => ({ ...f, appliedDate: e.target.value }))} />
          </div>
          <div>
            <label className="text-label-md block mb-1.5">Job URL</label>
            <input style={fieldStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="col-span-2">
            <label className="text-label-md block mb-1.5">Description</label>
            <textarea style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief job description..." />
          </div>
          <div className="col-span-2">
            <label className="text-label-md block mb-1.5">Notes</label>
            <textarea style={{ ...fieldStyle, minHeight: '60px', resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Personal notes..." />
          </div>

          <div className="col-span-2 flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}>
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--gradient-primary)', color: 'var(--color-on-primary)' }}>
              {isEdit ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Delete Confirmation Modal ───────────────────────── */

function DeleteModal({ job, onConfirm, onClose }: { job: Job; onConfirm: () => void; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md animate-fade-in-up rounded-2xl"
        style={{ background: 'var(--color-surface-container)', border: '1px solid var(--glass-stroke)', padding: 'var(--space-xl)' }}
      >
        <h2 className="text-title mb-2" style={{ color: 'var(--color-on-surface)' }}>Delete Application</h2>
        <p className="text-body mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
          Are you sure you want to delete <strong>{job.role}</strong> at <strong>{job.company}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#EF4444', color: '#fff' }}>Delete</button>
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

  const handleEdit = (job: Job) => {
    setEditJob(job)
    setShowForm(true)
  }

  const handleDelete = (job: Job) => {
    setDeleteJob(job)
  }

  const confirmDelete = () => {
    if (deleteJob) {
      dispatch({ type: 'DELETE_JOB', payload: deleteJob.id })
      setDeleteJob(undefined)
    }
  }

  const statusColor = (status: string) => JOB_STATUSES.find(s => s.value === status)?.color || '#86948a'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up delay-1">
        <div>
          <h1 className="text-headline" style={{ color: 'var(--color-on-surface)' }}>Job Applications</h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
            {filteredJobs.length} of {state.jobs.length} applications
          </p>
        </div>
        <button
          onClick={() => { setEditJob(undefined); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--gradient-primary)', color: 'var(--color-on-primary)' }}
        >
          <Plus size={16} /> Add Application
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 mb-6 animate-fade-in-up delay-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl flex-1 max-w-sm" style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-surface-container)' }}>
          <Search size={16} style={{ color: 'var(--color-on-surface-variant)' }} />
          <input
            type="text"
            placeholder="Search company or role..."
            className="bg-transparent border-none outline-none flex-1 text-sm"
            style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-primary)' }}
            value={state.searchQuery}
            onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--color-on-surface-variant)' }} />
          <select
            className="text-sm rounded-lg px-3 py-2 outline-none"
            style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', border: '1px solid var(--color-surface-container-high)' }}
            value={state.statusFilter}
            onChange={e => dispatch({ type: 'SET_STATUS_FILTER', payload: e.target.value })}
          >
            <option value="all">All Status</option>
            {JOB_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select
            className="text-sm rounded-lg px-3 py-2 outline-none"
            style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', border: '1px solid var(--color-surface-container-high)' }}
            value={state.originFilter}
            onChange={e => dispatch({ type: 'SET_ORIGIN_FILTER', payload: e.target.value })}
          >
            <option value="all">All Origins</option>
            <option value="application">Application</option>
            <option value="referral">Referral</option>
            <option value="recruiter">Recruiter</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Job Table */}
      <div className="glass-card-elevated animate-fade-in-up delay-3 overflow-hidden" style={{ border: '1px solid var(--glass-stroke)', padding: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-surface-container-high)' }}>
                {['Company', 'Role', 'Status', 'Salary', 'Location', 'Applied', 'Actions'].map(h => (
                  <th key={h} className="text-left text-label-sm px-5 py-3.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr
                  key={job.id}
                  className="transition-all cursor-pointer"
                  style={{ borderBottom: '1px solid var(--color-surface-container)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-container-low)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'var(--gradient-primary-subtle)', color: 'var(--color-primary)' }}>
                        {job.company[0]}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>{job.company}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--color-on-surface)' }}>{job.role}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5"
                      style={{ background: `${statusColor(job.status)}20`, color: statusColor(job.status) }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor(job.status) }} />
                      {JOB_STATUSES.find(s => s.value === job.status)?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-data" style={{ color: 'var(--color-on-surface-variant)' }}>{job.salary || '—'}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{job.location || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-data" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setAiJob(job)} className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: 'var(--color-primary)' }} title="AI Assistant">
                        <Sparkles size={14} />
                      </button>
                      <button onClick={() => handleEdit(job)} className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: 'var(--color-on-surface-variant)' }} title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(job)} className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: 'var(--color-tertiary)' }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: 'var(--color-on-surface-variant)' }} title="Open URL">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--color-on-surface-variant)' }}>
            <Search size={40} className="mb-3 opacity-30" />
            <p className="text-title-sm">No applications found</p>
            <p className="text-label-md mt-1">Try adjusting your filters or add a new application</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && <JobFormModal job={editJob} onClose={() => { setShowForm(false); setEditJob(undefined) }} />}
      {deleteJob && <DeleteModal job={deleteJob} onConfirm={confirmDelete} onClose={() => setDeleteJob(undefined)} />}
      {aiJob && <AIToolsPanel job={aiJob} onClose={() => setAiJob(undefined)} />}
    </div>
  )
}

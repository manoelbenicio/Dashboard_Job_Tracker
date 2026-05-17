import { useState } from 'react'
import { ArrowLeft, Pencil, Check, X, Trash2, ExternalLink, MessageSquarePlus, Calendar, MapPin, DollarSign, Building2, Briefcase, Clock, Send, MoreVertical } from 'lucide-react'
import { useJobs } from '@/context/JobContext'
import { Job, JobComment, JOB_STATUSES, type JobStatus } from '@/types'
import { AIToolsPanel } from '@/components/ai/AIToolsPanel'

/* ─── Indra Form Style ─── */
const fieldStyle: React.CSSProperties = {
  background: 'transparent', color: '#FFFFFF', border: 'none',
  borderBottom: '1px solid #B0B4BD', padding: '10px 0', fontSize: '14px',
  fontFamily: "'Inter', sans-serif", width: '100%', outline: 'none',
  transition: 'border-color 0.25s ease',
}

/* ─── Status Badge ─── */
function StatusBadge({ status, onChange }: { status: JobStatus; onChange: (s: JobStatus) => void }) {
  const [open, setOpen] = useState(false)
  const current = JOB_STATUSES.find(s => s.value === status)!
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: `${current.color}18`, border: `1px solid ${current.color}40`,
        borderRadius: '20px', padding: '8px 16px', cursor: 'pointer', color: current.color,
        fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: current.color }} />
        {current.label}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 10,
          background: '#002B3A', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '4px', minWidth: '160px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
        }}>
          {JOB_STATUSES.map(s => (
            <button key={s.value} onClick={() => { onChange(s.value); setOpen(false) }} style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              background: s.value === status ? 'rgba(0,176,189,0.1)' : 'transparent',
              border: 'none', padding: '8px 12px', color: '#FFFFFF', cursor: 'pointer',
              fontSize: '13px', borderRadius: '4px', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,176,189,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = s.value === status ? 'rgba(0,176,189,0.1)' : 'transparent')}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Editable Field ─── */
function EditableField({ label, value, icon, mono, multiline, onSave }: {
  label: string; value: string; icon: React.ReactNode; mono?: boolean; multiline?: boolean
  onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const save = () => { onSave(draft); setEditing(false) }
  const cancel = () => { setDraft(value); setEditing(false) }

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7A9CAE', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {icon}{label}
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: '#7A9CAE', cursor: 'pointer', padding: '4px', opacity: 0.6, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
          ><Pencil size={12} /></button>
        )}
      </div>
      {editing ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: multiline ? 'flex-start' : 'center' }}>
          {multiline ? (
            <textarea value={draft} onChange={e => setDraft(e.target.value)}
              style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical', flex: 1 }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = '#00B0BD')}
              autoFocus />
          ) : (
            <input value={draft} onChange={e => setDraft(e.target.value)}
              style={{ ...fieldStyle, flex: 1 }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = '#00B0BD')}
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
              autoFocus />
          )}
          <button onClick={save} style={{ background: '#00B0BD', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: '#fff' }}><Check size={14} /></button>
          <button onClick={cancel} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: '#7A9CAE' }}><X size={14} /></button>
        </div>
      ) : (
        <p style={{
          color: value ? '#FFFFFF' : '#7A9CAE', fontSize: '14px', margin: 0, lineHeight: 1.6,
          fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
          whiteSpace: multiline ? 'pre-wrap' : 'normal',
        }}>
          {value || '—'}
        </p>
      )}
    </div>
  )
}

/* ─── Comment Item ─── */
function CommentItem({ comment, onEdit, onDelete }: {
  comment: JobComment; onEdit: (id: string, text: string) => void; onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.text)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{
      padding: '14px 16px', background: 'rgba(0,176,189,0.04)', borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.04)', marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: '#7A9CAE', fontFamily: "'JetBrains Mono', monospace" }}>
          {new Date(comment.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {comment.updatedAt !== comment.createdAt && ' (editado)'}
        </span>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: '#7A9CAE', cursor: 'pointer', padding: '2px' }}>
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', background: '#002B3A',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden',
              zIndex: 5, minWidth: '100px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              <button onClick={() => { setEditing(true); setMenuOpen(false) }}
                style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '8px 14px', color: '#FFFFFF', cursor: 'pointer', fontSize: '12px', textAlign: 'left' }}>Editar</button>
              <button onClick={() => { onDelete(comment.id); setMenuOpen(false) }}
                style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '8px 14px', color: '#E91E63', cursor: 'pointer', fontSize: '12px', textAlign: 'left' }}>Excluir</button>
            </div>
          )}
        </div>
      </div>
      {editing ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea value={draft} onChange={e => setDraft(e.target.value)}
            style={{ ...fieldStyle, minHeight: '50px', resize: 'vertical', flex: 1 }} autoFocus />
          <button onClick={() => { onEdit(comment.id, draft); setEditing(false) }}
            style={{ background: '#00B0BD', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: '#fff', alignSelf: 'flex-start' }}><Check size={14} /></button>
          <button onClick={() => { setDraft(comment.text); setEditing(false) }}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: '#7A9CAE', alignSelf: 'flex-start' }}><X size={14} /></button>
        </div>
      ) : (
        <p style={{ color: '#FFFFFF', fontSize: '13px', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{comment.text}</p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   JOB DETAIL PAGE
   ═══════════════════════════════════════════════════════════ */
export function JobDetailPage({ jobId, onBack }: { jobId: string; onBack: () => void }) {
  const { state, dispatch } = useJobs()
  const job = state.jobs.find(j => j.id === jobId)
  const [showAI, setShowAI] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  if (!job) {
    return (
      <div style={{ padding: '64px', textAlign: 'center' }}>
        <p style={{ color: '#7A9CAE', fontSize: '16px' }}>Vaga não encontrada.</p>
        <button onClick={onBack} className="indra-btn-secondary" style={{ marginTop: '16px' }}>Voltar</button>
      </div>
    )
  }

  const updateField = (field: keyof Job, value: any) => {
    dispatch({ type: 'UPDATE_JOB', payload: { ...job, [field]: value, lastUpdated: new Date().toISOString() } })
  }

  const addComment = () => {
    if (!newComment.trim()) return
    const comment: JobComment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const comments = [...(job.comments || []), comment]
    dispatch({ type: 'UPDATE_JOB', payload: { ...job, comments, lastUpdated: new Date().toISOString() } })
    setNewComment('')
  }

  const editComment = (id: string, text: string) => {
    const comments = (job.comments || []).map(c => c.id === id ? { ...c, text, updatedAt: new Date().toISOString() } : c)
    dispatch({ type: 'UPDATE_JOB', payload: { ...job, comments, lastUpdated: new Date().toISOString() } })
  }

  const deleteComment = (id: string) => {
    const comments = (job.comments || []).filter(c => c.id !== id)
    dispatch({ type: 'UPDATE_JOB', payload: { ...job, comments, lastUpdated: new Date().toISOString() } })
  }

  const handleDelete = () => {
    dispatch({ type: 'DELETE_JOB', payload: job.id })
    onBack()
  }

  const statusInfo = JOB_STATUSES.find(s => s.value === job.status)!

  return (
    <div style={{ animation: 'indra-slide-up 0.3s ease-out' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px',
          padding: '10px', cursor: 'pointer', color: '#7A9CAE', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,176,189,0.12)'; e.currentTarget.style.color = '#00B0BD' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#7A9CAE' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <p className="indra-section-eyebrow" style={{ margin: 0 }}>Detalhes da Candidatura</p>
          <h2 style={{ fontSize: '22px', fontWeight: 300, color: '#FFFFFF', margin: '4px 0 0' }}>{job.role}</h2>
        </div>
        <StatusBadge status={job.status} onChange={(s) => updateField('status', s)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* ─── Left: Details ─── */}
        <div>
          {/* Company Card */}
          <div className="indra-panel" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '56px', height: '56px', background: `${statusInfo.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px', fontSize: '22px', fontWeight: 700, color: statusInfo.color,
              }}>
                {job.company[0]?.toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{job.company}</h3>
                <p style={{ fontSize: '13px', color: '#7A9CAE', margin: '2px 0 0' }}>{job.role}</p>
              </div>
            </div>

            <EditableField label="Empresa" value={job.company} icon={<Building2 size={12} />} onSave={v => updateField('company', v)} />
            <EditableField label="Cargo" value={job.role} icon={<Briefcase size={12} />} onSave={v => updateField('role', v)} />
            <EditableField label="Salário" value={job.salary} icon={<DollarSign size={12} />} mono onSave={v => updateField('salary', v)} />
            <EditableField label="Localização" value={job.location} icon={<MapPin size={12} />} onSave={v => updateField('location', v)} />
            <EditableField label="Data de Candidatura" value={job.appliedDate ? new Date(job.appliedDate).toLocaleDateString('pt-BR') : ''} icon={<Calendar size={12} />} mono onSave={v => updateField('appliedDate', new Date(v).toISOString())} />
          </div>

          {/* Description */}
          <div className="indra-panel" style={{ marginBottom: '20px' }}>
            <EditableField label="Descrição da Vaga" value={job.description} icon={<Briefcase size={12} />} multiline onSave={v => updateField('description', v)} />
            <EditableField label="Notas Pessoais" value={job.notes} icon={<MessageSquarePlus size={12} />} multiline onSave={v => updateField('notes', v)} />
          </div>

          {/* URL & Meta */}
          <div className="indra-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontSize: '11px', color: '#7A9CAE', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>URL da Vaga</span>
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00B0BD', fontSize: '12px', textDecoration: 'none' }}>
                  Abrir <ExternalLink size={12} />
                </a>
              )}
            </div>
            <p style={{ color: job.url ? '#FFFFFF' : '#7A9CAE', fontSize: '13px', margin: '0 0 16px', wordBreak: 'break-all' }}>{job.url || '—'}</p>

            <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#7A9CAE', textTransform: 'uppercase' }}>Origem</span>
                <p style={{ color: '#FFFFFF', fontSize: '13px', margin: '2px 0 0', textTransform: 'capitalize' }}>{job.origin}</p>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#7A9CAE', textTransform: 'uppercase' }}>Última Atualização</span>
                <p style={{ color: '#FFFFFF', fontSize: '13px', margin: '2px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
                  {new Date(job.lastUpdated).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right: Comments + Actions ─── */}
        <div>
          {/* Comments Section */}
          <div className="indra-panel" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Comentários ({(job.comments || []).length})
              </h4>
            </div>

            {/* Comment list */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '12px' }}>
              {(job.comments || []).length === 0 ? (
                <p style={{ color: '#7A9CAE', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                  Nenhum comentário ainda. Adicione notas sobre esta candidatura.
                </p>
              ) : (
                (job.comments || []).map(c => (
                  <CommentItem key={c.id} comment={c} onEdit={editComment} onDelete={deleteComment} />
                ))
              )}
            </div>

            {/* Add comment */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                style={{ ...fieldStyle, minHeight: '44px', resize: 'vertical', flex: 1, fontSize: '13px' }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment() } }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = '#00B0BD')}
                onBlur={e => (e.currentTarget.style.borderBottomColor = '#B0B4BD')}
              />
              <button onClick={addComment} disabled={!newComment.trim()}
                style={{
                  background: '#00B0BD', border: 'none', borderRadius: '6px', padding: '0 14px',
                  cursor: 'pointer', color: '#002B3A', opacity: newComment.trim() ? 1 : 0.4,
                  transition: 'opacity 0.2s', alignSelf: 'flex-end',
                }}>
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* AI & Cover Letter */}
          {(job.coverLetter || job.interviewGuide) && (
            <div className="indra-panel" style={{ marginBottom: '20px' }}>
              {job.coverLetter && (
                <EditableField label="Carta de Apresentação" value={job.coverLetter} icon={<Briefcase size={12} />} multiline
                  onSave={v => updateField('coverLetter', v)} />
              )}
              {job.interviewGuide && (
                <EditableField label="Guia de Entrevista" value={job.interviewGuide} icon={<MessageSquarePlus size={12} />} multiline
                  onSave={v => updateField('interviewGuide', v)} />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="indra-panel">
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ações</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => setShowAI(true)} className="indra-btn-cyan" style={{ width: '100%', justifyContent: 'center' }}>
                ✨ AI Assistant
              </button>
              <button onClick={() => setShowDelete(true)}
                style={{
                  width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'rgba(233,30,99,0.08)', border: '1px solid rgba(233,30,99,0.2)',
                  borderRadius: '6px', color: '#E91E63', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(233,30,99,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(233,30,99,0.08)')}
              >
                <Trash2 size={14} /> Excluir Candidatura
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDelete(false) }}>
          <div className="w-full max-w-md indra-panel" style={{ animation: 'indra-slide-up 0.3s ease-out' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 300, color: '#FFFFFF', marginBottom: '8px' }}>Excluir Candidatura</h2>
            <p style={{ fontSize: '14px', color: '#B3C1DA', marginBottom: '24px', lineHeight: 1.5 }}>
              Tem certeza que deseja excluir <strong style={{ color: '#FFFFFF' }}>{job.role}</strong> na <strong style={{ color: '#FFFFFF' }}>{job.company}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="indra-btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={handleDelete} className="indra-btn-cyan" style={{ flex: 1, background: '#E91E63' }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Panel */}
      {showAI && <AIToolsPanel job={job} onClose={() => setShowAI(false)} />}
    </div>
  )
}

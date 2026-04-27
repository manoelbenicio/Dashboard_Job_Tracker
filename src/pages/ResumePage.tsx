import { useState } from 'react'
import { FileText, Download, Sparkles, User, Briefcase, GraduationCap, Award, Plus, X, AlertCircle } from 'lucide-react'
import { useJobs } from '@/context/JobContext'

/* ─── Types ──────────────────────────────────────────── */

interface ResumeData {
  fullName: string
  title: string
  email: string
  phone: string
  location: string
  summary: string
  experience: Array<{ company: string; role: string; period: string; bullets: string[] }>
  education: Array<{ institution: string; degree: string; year: string }>
  skills: string[]
  certifications: string[]
}

/* ─── Resume Preview ─────────────────────────────────── */

function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div
      className="rounded-2xl p-8 overflow-y-auto"
      style={{
        background: '#fff',
        color: '#1a1a2e',
        fontFamily: 'var(--font-primary)',
        maxHeight: 'calc(100vh - 200px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div className="text-center border-b-2 pb-5 mb-5" style={{ borderColor: '#10B981' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#0f1117' }}>
          {data.fullName || 'Your Name'}
        </h1>
        <p className="text-sm font-medium mb-2" style={{ color: '#10B981' }}>
          {data.title || 'Professional Title'}
        </p>
        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: '#555' }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>• {data.phone}</span>}
          {data.location && <span>• {data.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#10B981' }}>
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#333' }}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && data.experience[0].company && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#10B981' }}>
            Experience
          </h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-semibold" style={{ color: '#0f1117' }}>{exp.role}</span>
                  {exp.company && <span className="text-sm" style={{ color: '#555' }}> — {exp.company}</span>}
                </div>
                {exp.period && <span className="text-xs" style={{ color: '#888' }}>{exp.period}</span>}
              </div>
              <ul className="mt-1.5 space-y-1">
                {exp.bullets.filter(b => b).map((b, j) => (
                  <li key={j} className="text-xs pl-3 relative before:content-['•'] before:absolute before:left-0" style={{ color: '#444' }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && data.education[0].institution && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#10B981' }}>
            Education
          </h2>
          {data.education.map((edu, i) => (
            <div key={i} className="flex justify-between mb-2">
              <div>
                <span className="text-sm font-semibold" style={{ color: '#0f1117' }}>{edu.degree}</span>
                <span className="text-sm" style={{ color: '#555' }}> — {edu.institution}</span>
              </div>
              {edu.year && <span className="text-xs" style={{ color: '#888' }}>{edu.year}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.filter(s => s).length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#10B981' }}>
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.filter(s => s).map((s, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#f0fdf4', color: '#059669' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.filter(c => c).length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#10B981' }}>
            Certifications
          </h2>
          <ul className="space-y-1">
            {data.certifications.filter(c => c).map((c, i) => (
              <li key={i} className="text-xs" style={{ color: '#444' }}>• {c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ─── Resume Builder Page ────────────────────────────── */

export function ResumePage() {
  const { state } = useJobs()

  const [resume, setResume] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('jobflow-resume')
    if (saved) return JSON.parse(saved)
    return {
      fullName: state.profile.name || '',
      title: '',
      email: state.profile.email || '',
      phone: '',
      location: '',
      summary: state.profile.summary || '',
      experience: [{ company: '', role: '', period: '', bullets: [''] }],
      education: [{ institution: '', degree: '', year: '' }],
      skills: state.profile.skills.length > 0 ? state.profile.skills : [''],
      certifications: [''],
    }
  })

  const saveResume = (updated: ResumeData) => {
    setResume(updated)
    localStorage.setItem('jobflow-resume', JSON.stringify(updated))
  }

  const updateField = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    saveResume({ ...resume, [key]: value })
  }

  const fieldStyle = {
    background: 'var(--color-surface-container-lowest)',
    color: 'var(--color-on-surface)',
    border: '1px solid var(--color-surface-container-high)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
    fontSize: '13px',
    fontFamily: 'var(--font-primary)',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties

  return (
    <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Left: Editor */}
      <div className="flex-1 max-w-lg overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <div className="mb-6 animate-fade-in-up delay-1">
          <h1 className="text-headline" style={{ color: 'var(--color-on-surface)' }}>Resume Builder</h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
            Build your executive resume. Changes auto-save.
          </p>
        </div>

        {/* Contact */}
        <div className="glass-card-elevated mb-4 animate-fade-in-up delay-2" style={{ border: '1px solid var(--glass-stroke)' }}>
          <div className="flex items-center gap-2 mb-4">
            <User size={16} style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>Contact Info</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input style={fieldStyle} value={resume.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="Full Name" />
            <input style={fieldStyle} value={resume.title} onChange={e => updateField('title', e.target.value)} placeholder="Professional Title" />
            <input style={fieldStyle} value={resume.email} onChange={e => updateField('email', e.target.value)} placeholder="Email" />
            <input style={fieldStyle} value={resume.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Phone" />
            <input style={fieldStyle} className="col-span-2" value={resume.location} onChange={e => updateField('location', e.target.value)} placeholder="Location" />
          </div>
        </div>

        {/* Summary */}
        <div className="glass-card-elevated mb-4 animate-fade-in-up delay-3" style={{ border: '1px solid var(--glass-stroke)' }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>Summary</h3>
          </div>
          <textarea
            style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }}
            value={resume.summary}
            onChange={e => updateField('summary', e.target.value)}
            placeholder="Professional summary..."
          />
        </div>

        {/* Experience */}
        <div className="glass-card-elevated mb-4 animate-fade-in-up delay-4" style={{ border: '1px solid var(--glass-stroke)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase size={16} style={{ color: 'var(--color-primary)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>Experience</h3>
            </div>
            <button
              onClick={() => updateField('experience', [...resume.experience, { company: '', role: '', period: '', bullets: [''] }])}
              className="p-1 rounded-lg hover:opacity-70"
              style={{ color: 'var(--color-primary)' }}
            >
              <Plus size={16} />
            </button>
          </div>
          {resume.experience.map((exp, i) => (
            <div key={i} className="mb-4 pb-4" style={{ borderBottom: i < resume.experience.length - 1 ? '1px solid var(--color-surface-container-high)' : 'none' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-label-md">Position {i + 1}</span>
                {resume.experience.length > 1 && (
                  <button onClick={() => updateField('experience', resume.experience.filter((_, j) => j !== i))} className="text-xs hover:opacity-70" style={{ color: 'var(--color-tertiary)' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input style={fieldStyle} value={exp.role} onChange={e => {
                  const updated = [...resume.experience]; updated[i].role = e.target.value; updateField('experience', updated)
                }} placeholder="Role" />
                <input style={fieldStyle} value={exp.company} onChange={e => {
                  const updated = [...resume.experience]; updated[i].company = e.target.value; updateField('experience', updated)
                }} placeholder="Company" />
                <input style={fieldStyle} className="col-span-2" value={exp.period} onChange={e => {
                  const updated = [...resume.experience]; updated[i].period = e.target.value; updateField('experience', updated)
                }} placeholder="e.g. Jan 2022 – Present" />
              </div>
              {exp.bullets.map((b, j) => (
                <div key={j} className="flex items-center gap-1 mb-1">
                  <span className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>•</span>
                  <input style={{ ...fieldStyle, fontSize: '12px' }} value={b} onChange={e => {
                    const updated = [...resume.experience]; updated[i].bullets[j] = e.target.value; updateField('experience', updated)
                  }} placeholder="Achievement..." />
                  {exp.bullets.length > 1 && (
                    <button onClick={() => {
                      const updated = [...resume.experience]; updated[i].bullets = updated[i].bullets.filter((_, k) => k !== j); updateField('experience', updated)
                    }} className="shrink-0 hover:opacity-70" style={{ color: 'var(--color-tertiary)' }}><X size={12} /></button>
                  )}
                </div>
              ))}
              <button onClick={() => {
                const updated = [...resume.experience]; updated[i].bullets.push(''); updateField('experience', updated)
              }} className="text-xs mt-1 hover:opacity-70" style={{ color: 'var(--color-primary)' }}>
                + Add bullet
              </button>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="glass-card-elevated mb-4 animate-fade-in-up delay-5" style={{ border: '1px solid var(--glass-stroke)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap size={16} style={{ color: 'var(--color-primary)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>Education</h3>
            </div>
            <button onClick={() => updateField('education', [...resume.education, { institution: '', degree: '', year: '' }])} className="p-1 rounded-lg hover:opacity-70" style={{ color: 'var(--color-primary)' }}>
              <Plus size={16} />
            </button>
          </div>
          {resume.education.map((edu, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <input style={fieldStyle} value={edu.degree} onChange={e => {
                const updated = [...resume.education]; updated[i].degree = e.target.value; updateField('education', updated)
              }} placeholder="Degree" />
              <input style={fieldStyle} value={edu.institution} onChange={e => {
                const updated = [...resume.education]; updated[i].institution = e.target.value; updateField('education', updated)
              }} placeholder="Institution" />
              <div className="flex items-center gap-1">
                <input style={fieldStyle} value={edu.year} onChange={e => {
                  const updated = [...resume.education]; updated[i].year = e.target.value; updateField('education', updated)
                }} placeholder="Year" />
                {resume.education.length > 1 && (
                  <button onClick={() => updateField('education', resume.education.filter((_, j) => j !== i))} className="shrink-0 hover:opacity-70" style={{ color: 'var(--color-tertiary)' }}><X size={12} /></button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="glass-card-elevated mb-4 animate-fade-in-up delay-6" style={{ border: '1px solid var(--glass-stroke)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award size={16} style={{ color: 'var(--color-primary)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>Skills</h3>
            </div>
            <button onClick={() => updateField('skills', [...resume.skills, ''])} className="p-1 rounded-lg hover:opacity-70" style={{ color: 'var(--color-primary)' }}>
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <input style={{ ...fieldStyle, width: '120px' }} value={s} onChange={e => {
                  const updated = [...resume.skills]; updated[i] = e.target.value; updateField('skills', updated)
                }} placeholder="Skill" />
                {resume.skills.length > 1 && (
                  <button onClick={() => updateField('skills', resume.skills.filter((_, j) => j !== i))} className="shrink-0 hover:opacity-70" style={{ color: 'var(--color-tertiary)' }}><X size={12} /></button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="flex-1 animate-fade-in-up delay-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Live Preview</h2>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--gradient-primary)', color: 'var(--color-on-primary)' }}
          >
            <Download size={14} /> Export PDF
          </button>
        </div>
        <ResumePreview data={resume} />
      </div>
    </div>
  )
}

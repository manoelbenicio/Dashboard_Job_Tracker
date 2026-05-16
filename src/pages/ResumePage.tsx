import { useState } from 'react'
import { FileText, Download, User, Briefcase, GraduationCap, Award, Plus, X, Linkedin, Sparkles, Target, PenTool, Wand2 } from 'lucide-react'
import { useJobs } from '@/context/JobContext'
import { LinkedInImport } from '@/components/resume/LinkedInImport'
import { CVJobMatcher } from '@/components/resume/CVJobMatcher'
import { PositionMatcher } from '@/components/resume/PositionMatcher'
import { ResumeExporter } from '@/components/resume/ResumeExporter'
import { enhanceSection, type ParsedResume } from '@/lib/resumeService'

/* ─── Types ─── */
interface ResumeData {
  fullName: string; title: string; email: string; phone: string; location: string; summary: string
  experience: Array<{ company: string; role: string; period: string; bullets: string[] }>
  education: Array<{ institution: string; degree: string; year: string }>
  skills: string[]; certifications: string[]
  linkedinUrl?: string
}

const fieldStyle: React.CSSProperties = {
  background: 'transparent', color: '#FFFFFF', border: 'none',
  borderBottom: '1px solid #B0B4BD', padding: '8px 12px',
  fontSize: '13px', fontFamily: "'Inter', sans-serif",
  width: '100%', outline: 'none', transition: 'border-color 0.25s ease',
}

/* ─── Mode Tabs ─── */
const modes = [
  { id: 'linkedin', label: 'LinkedIn Import', icon: Linkedin, color: '#00B0BD' },
  { id: 'cvjob', label: 'CV + Job Match', icon: Sparkles, color: '#8B5CF6' },
  { id: 'position', label: 'Position Match', icon: Target, color: '#10B981' },
  { id: 'manual', label: 'Manual Editor', icon: PenTool, color: '#F59E0B' },
]

/* ─── Resume Preview (print-ready white page) ─── */
function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div id="resume-preview" style={{
      background: '#fff', color: '#1a1a2e', fontFamily: "'Inter', sans-serif",
      borderRadius: '8px', padding: '40px', maxHeight: 'calc(100vh - 200px)',
      overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #00B0BD', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f1117', marginBottom: '4px' }}>
          {data.fullName || 'Your Name'}
        </h1>
        <p style={{ fontSize: '14px', fontWeight: 500, color: '#00B0BD', marginBottom: '8px' }}>
          {data.title || 'Professional Title'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '12px', color: '#555' }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>• {data.phone}</span>}
          {data.location && <span>• {data.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00B0BD', marginBottom: '8px' }}>
            Professional Summary
          </h2>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#333' }}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && data.experience[0].company && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00B0BD', marginBottom: '12px' }}>
            Experience
          </h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f1117' }}>{exp.role}</span>
                  {exp.company && <span style={{ fontSize: '14px', color: '#555' }}> — {exp.company}</span>}
                </div>
                {exp.period && <span style={{ fontSize: '12px', color: '#888' }}>{exp.period}</span>}
              </div>
              <ul style={{ marginTop: '6px', paddingLeft: '16px' }}>
                {exp.bullets.filter(b => b).map((b, j) => (
                  <li key={j} style={{ fontSize: '12px', color: '#444', marginBottom: '4px', lineHeight: 1.5 }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && data.education[0].institution && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00B0BD', marginBottom: '12px' }}>
            Education
          </h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f1117' }}>{edu.degree}</span>
                <span style={{ fontSize: '14px', color: '#555' }}> — {edu.institution}</span>
              </div>
              {edu.year && <span style={{ fontSize: '12px', color: '#888' }}>{edu.year}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.filter(s => s).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00B0BD', marginBottom: '8px' }}>
            Skills
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.skills.filter(s => s).map((s, i) => (
              <span key={i} style={{ fontSize: '12px', padding: '4px 10px', background: '#e6f7f8', color: '#00838f' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.filter(c => c).length > 0 && (
        <div>
          <h2 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00B0BD', marginBottom: '8px' }}>
            Certifications
          </h2>
          <ul style={{ paddingLeft: '16px' }}>
            {data.certifications.filter(c => c).map((c, i) => (
              <li key={i} style={{ fontSize: '12px', color: '#444', marginBottom: '4px' }}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ─── AI Section Enhance Button ─── */
function EnhanceButton({ section, content, context, apiKey, onEnhance }: {
  section: string; content: string; context: string; apiKey: string; onEnhance: (text: string) => void
}) {
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!apiKey) return
    setLoading(true)
    const result = await enhanceSection(section, content, context, apiKey)
    setLoading(false)
    if (result.success && result.enhanced) onEnhance(result.enhanced)
  }

  return (
    <button onClick={handle} disabled={loading || !apiKey || !content} title={!apiKey ? 'Set API key in Settings' : 'Enhance with AI'}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px',
        fontSize: '11px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: '4px', color: '#8B5CF6', cursor: loading ? 'wait' : 'pointer',
        opacity: loading || !apiKey || !content ? 0.5 : 1, transition: 'all 0.2s',
      }}>
      <Wand2 size={12} /> {loading ? 'Enhancing...' : 'AI Enhance'}
    </button>
  )
}

/* ─── Resume Builder Page ─── */
export function ResumePage() {
  const { state } = useJobs()
  const apiKey = state.profile.apiKey
  const [activeMode, setActiveMode] = useState('manual')

  const [resume, setResume] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('jobflow-resume')
    if (saved) return JSON.parse(saved)
    return {
      fullName: state.profile.name || '', title: '', email: state.profile.email || '',
      phone: '', location: '', summary: state.profile.summary || '',
      experience: [{ company: '', role: '', period: '', bullets: [''] }],
      education: [{ institution: '', degree: '', year: '' }],
      skills: state.profile.skills.length > 0 ? state.profile.skills : [''],
      certifications: [''],
    }
  })

  const saveResume = (updated: ResumeData) => { setResume(updated); localStorage.setItem('jobflow-resume', JSON.stringify(updated)) }
  const updateField = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => { saveResume({ ...resume, [key]: value }) }

  const handleImportData = (data: ParsedResume) => {
    const merged: ResumeData = {
      fullName: data.fullName || resume.fullName,
      title: data.title || resume.title,
      email: data.email || resume.email,
      phone: data.phone || resume.phone,
      location: data.location || resume.location,
      summary: data.summary || resume.summary,
      experience: data.experience.length > 0 ? data.experience : resume.experience,
      education: data.education.length > 0 ? data.education : resume.education,
      skills: data.skills.length > 0 ? data.skills : resume.skills,
      certifications: data.certifications.length > 0 ? data.certifications : resume.certifications,
    }
    saveResume(merged)
    setActiveMode('manual')
  }

  const SectionHeader = ({ icon: Icon, title, onAdd, enhanceProps }: {
    icon: any; title: string; onAdd?: () => void
    enhanceProps?: { section: string; content: string; onEnhance: (text: string) => void }
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={16} style={{ color: '#00B0BD' }} />
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {enhanceProps && (
          <EnhanceButton
            section={enhanceProps.section}
            content={enhanceProps.content}
            context={`Name: ${resume.fullName}, Title: ${resume.title}`}
            apiKey={apiKey}
            onEnhance={enhanceProps.onEnhance}
          />
        )}
        {onAdd && (
          <button onClick={onAdd} style={{ background: 'none', border: 'none', color: '#00B0BD', cursor: 'pointer' }}>
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="indra-section-header">
        <p className="indra-section-eyebrow">Builder</p>
        <h2 className="indra-section-title">Resume Builder</h2>
        <p className="indra-panel-subtitle" style={{ marginTop: '4px' }}>
          Import, generate, or manually craft your executive resume.
        </p>
      </div>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {modes.map(mode => {
          const Icon = mode.icon
          const isActive = activeMode === mode.id
          return (
            <button key={mode.id} onClick={() => setActiveMode(mode.id)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', fontSize: '13px', fontWeight: isActive ? 600 : 400,
              background: isActive ? `${mode.color}15` : 'transparent',
              border: `1px solid ${isActive ? mode.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '8px', color: isActive ? mode.color : '#7A9CAE',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <Icon size={16} />
              {mode.label}
            </button>
          )
        })}
      </div>

      {/* LinkedIn Import Mode */}
      {activeMode === 'linkedin' && (
        <LinkedInImport onImport={handleImportData} />
      )}

      {/* CV + Job Matcher Mode */}
      {activeMode === 'cvjob' && (
        <CVJobMatcher onGenerate={handleImportData} />
      )}

      {/* Position Matcher Mode */}
      {activeMode === 'position' && (
        <PositionMatcher currentResume={resume as ParsedResume} onGenerate={handleImportData} />
      )}

      {/* Manual Editor + Preview (always visible in manual mode, preview always visible) */}
      <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(100vh - 320px)' }}>
        {/* Left: Editor (manual mode only) */}
        {activeMode === 'manual' && (
          <div style={{ flex: 1, maxWidth: '480px', overflowY: 'auto', paddingRight: '8px', maxHeight: 'calc(100vh - 320px)' }}>
            {/* Contact */}
            <div className="indra-panel" style={{ marginBottom: '16px' }}>
              <SectionHeader icon={User} title="Contact Info" />
              <div className="grid grid-cols-2 gap-3">
                <input style={fieldStyle} value={resume.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="Full Name" />
                <input style={fieldStyle} value={resume.title} onChange={e => updateField('title', e.target.value)} placeholder="Professional Title" />
                <input style={fieldStyle} value={resume.email} onChange={e => updateField('email', e.target.value)} placeholder="Email" />
                <input style={fieldStyle} value={resume.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Phone" />
                <input style={fieldStyle} className="col-span-2" value={resume.location} onChange={e => updateField('location', e.target.value)} placeholder="Location" />
              </div>
            </div>

            {/* Summary */}
            <div className="indra-panel" style={{ marginBottom: '16px' }}>
              <SectionHeader icon={FileText} title="Summary" enhanceProps={{
                section: 'Professional Summary', content: resume.summary,
                onEnhance: (text) => updateField('summary', text),
              }} />
              <textarea style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }} value={resume.summary} onChange={e => updateField('summary', e.target.value)} placeholder="Professional summary..." />
            </div>

            {/* Experience */}
            <div className="indra-panel" style={{ marginBottom: '16px' }}>
              <SectionHeader icon={Briefcase} title="Experience" onAdd={() => updateField('experience', [...resume.experience, { company: '', role: '', period: '', bullets: [''] }])} />
              {resume.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: i < resume.experience.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#7A9CAE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Position {i + 1}</span>
                    {resume.experience.length > 1 && (
                      <button onClick={() => updateField('experience', resume.experience.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#E91E63', cursor: 'pointer' }}><X size={14} /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '8px' }}>
                    <input style={fieldStyle} value={exp.role} onChange={e => { const u = [...resume.experience]; u[i].role = e.target.value; updateField('experience', u) }} placeholder="Role" />
                    <input style={fieldStyle} value={exp.company} onChange={e => { const u = [...resume.experience]; u[i].company = e.target.value; updateField('experience', u) }} placeholder="Company" />
                    <input style={fieldStyle} className="col-span-2" value={exp.period} onChange={e => { const u = [...resume.experience]; u[i].period = e.target.value; updateField('experience', u) }} placeholder="e.g. Jan 2022 – Present" />
                  </div>
                  {exp.bullets.map((b, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#7A9CAE' }}>•</span>
                      <input style={{ ...fieldStyle, fontSize: '12px' }} value={b} onChange={e => { const u = [...resume.experience]; u[i].bullets[j] = e.target.value; updateField('experience', u) }} placeholder="Achievement..." />
                      {exp.bullets.length > 1 && (
                        <button onClick={() => { const u = [...resume.experience]; u[i].bullets = u[i].bullets.filter((_, k) => k !== j); updateField('experience', u) }} style={{ background: 'none', border: 'none', color: '#E91E63', cursor: 'pointer', flexShrink: 0 }}><X size={12} /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => { const u = [...resume.experience]; u[i].bullets.push(''); updateField('experience', u) }}
                    style={{ fontSize: '12px', color: '#00B0BD', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
                    + Add bullet
                  </button>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="indra-panel" style={{ marginBottom: '16px' }}>
              <SectionHeader icon={GraduationCap} title="Education" onAdd={() => updateField('education', [...resume.education, { institution: '', degree: '', year: '' }])} />
              {resume.education.map((edu, i) => (
                <div key={i} className="grid grid-cols-3 gap-2" style={{ marginBottom: '8px' }}>
                  <input style={fieldStyle} value={edu.degree} onChange={e => { const u = [...resume.education]; u[i].degree = e.target.value; updateField('education', u) }} placeholder="Degree" />
                  <input style={fieldStyle} value={edu.institution} onChange={e => { const u = [...resume.education]; u[i].institution = e.target.value; updateField('education', u) }} placeholder="Institution" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input style={fieldStyle} value={edu.year} onChange={e => { const u = [...resume.education]; u[i].year = e.target.value; updateField('education', u) }} placeholder="Year" />
                    {resume.education.length > 1 && (
                      <button onClick={() => updateField('education', resume.education.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#E91E63', cursor: 'pointer', flexShrink: 0 }}><X size={12} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="indra-panel" style={{ marginBottom: '16px' }}>
              <SectionHeader icon={Award} title="Skills" onAdd={() => updateField('skills', [...resume.skills, ''])} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {resume.skills.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input style={{ ...fieldStyle, width: '120px' }} value={s} onChange={e => { const u = [...resume.skills]; u[i] = e.target.value; updateField('skills', u) }} placeholder="Skill" />
                    {resume.skills.length > 1 && (
                      <button onClick={() => updateField('skills', resume.skills.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#E91E63', cursor: 'pointer', flexShrink: 0 }}><X size={12} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right: Live Preview + Export */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>Live Preview</h2>
            <ResumeExporter data={resume as ParsedResume} />
          </div>
          <ResumePreview data={resume} />
        </div>
      </div>
    </div>
  )
}

import { useRef, useState } from 'react'
import { Upload, Link2, Zap, FileText } from 'lucide-react'
import { parseUploadedCV } from '@/lib/resumeService'

interface Props {
  jobUrl: string
  setJobUrl: (v: string) => void
  jobDescription: string
  setJobDescription: (v: string) => void
  cvText: string
  setCvText: (v: string) => void
  cvFileName: string
  setCvFileName: (v: string) => void
  setError: (v: string) => void
}

export function BenchmarkInputPanel(props: Props) {
  const { jobUrl, setJobUrl, jobDescription, setJobDescription, cvText, setCvText, cvFileName, setCvFileName, setError } = props
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvFileName(file.name)
    const parsed = await parseUploadedCV(file)
    if (parsed.success && parsed.data) {
      const r = parsed.data
      const text = [
        `# ${r.fullName}`, r.title, `${r.email} | ${r.phone} | ${r.location}`,
        '', r.summary, '',
        '## Experience', ...r.experience.map(x => `### ${x.role} — ${x.company}\n${x.period}\n${x.bullets.join('\n')}`),
        '', '## Education', ...r.education.map(x => `${x.degree} — ${x.institution} (${x.year})`),
        '', '## Skills', r.skills.join(', '),
      ].join('\n')
      setCvText(text)
    } else {
      setError(parsed.error || 'Falha ao processar CV')
    }
  }

  const useResumeBuilder = () => {
    const saved = localStorage.getItem('jobflow-resume')
    if (!saved) return
    const r = JSON.parse(saved)
    const text = [
      `# ${r.fullName}`, r.title, `${r.email} | ${r.phone} | ${r.location}`,
      '', r.summary, '',
      '## Experience', ...(r.experience || []).map((x: any) => `### ${x.role} — ${x.company}\n${x.period}\n${(x.bullets || []).join('\n')}`),
      '', '## Education', ...(r.education || []).map((x: any) => `${x.degree} — ${x.institution} (${x.year})`),
      '', '## Skills', (r.skills || []).join(', '),
    ].join('\n')
    setCvText(text)
    setCvFileName('Resume Builder')
  }

  const S = {
    panel: { background: '#1A1D2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', marginBottom: '16px' } as React.CSSProperties,
    label: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' } as React.CSSProperties,
    labelIcon: { color: '#60A5FA' } as React.CSSProperties,
    labelText: { fontSize: '13px', fontWeight: 600, color: '#F0F1F5', fontFamily: "'Inter', sans-serif" } as React.CSSProperties,
    btnRow: { display: 'flex', gap: '8px', marginBottom: '10px' } as React.CSSProperties,
    btn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: '#242840', color: '#F0F1F5', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Inter', sans-serif" } as React.CSSProperties,
    fileName: { fontSize: '11px', color: '#10B981', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '100%', display: 'block' },
    input: { width: '100%', padding: '10px 12px', fontSize: '13px', background: '#242840', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F0F1F5', outline: 'none', fontFamily: "'Inter', sans-serif", marginBottom: '10px', boxSizing: 'border-box' as const },
    textarea: { width: '100%', minHeight: '120px', padding: '10px 12px', fontSize: '13px', background: '#242840', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F0F1F5', outline: 'none', resize: 'vertical' as const, fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' as const, lineHeight: 1.6 },
  }

  return (
    <>
      {/* CV Upload */}
      <div style={S.panel}>
        <div style={S.label}>
          <FileText size={16} style={S.labelIcon} />
          <span style={S.labelText}>Seu CV</span>
        </div>
        <div style={S.btnRow}>
          <button style={S.btn} onClick={() => fileRef.current?.click()}>
            <Upload size={14} /> Upload CV
          </button>
          <button style={S.btn} onClick={useResumeBuilder}>
            <Zap size={14} /> Do Builder
          </button>
        </div>
        {cvFileName && <span style={S.fileName} title={cvFileName}>✓ {cvFileName}</span>}
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" style={{ display: 'none' }} onChange={handleFileUpload} />
      </div>

      {/* Job Target */}
      <div style={S.panel}>
        <div style={S.label}>
          <Link2 size={16} style={S.labelIcon} />
          <span style={S.labelText}>Vaga Alvo</span>
        </div>
        <input value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="https://linkedin.com/jobs/view/..." style={S.input} />
        <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Cole a descrição completa da vaga aqui..." style={S.textarea} />
      </div>
    </>
  )
}

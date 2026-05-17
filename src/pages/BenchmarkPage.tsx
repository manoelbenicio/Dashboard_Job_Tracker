import { useState } from 'react'
import { Trophy, Play, Upload, Link2, Zap, FileText, AlertCircle } from 'lucide-react'
import { useJobs } from '@/context/JobContext'
import { PhaseTracker } from '@/components/benchmark/PhaseTracker'
import { BenchmarkResultsPanel } from '@/components/benchmark/BenchmarkResultsPanel'
import { parseUploadedCV } from '@/lib/resumeService'
import { runFullBenchmark, runPhase7, runPhase8, PHASE_NAMES, type BenchmarkInput, type BenchmarkResult, type PhaseProgress } from '@/lib/benchmarkEngine'
import type { AIProviderConfig } from '@/lib/aiProviders'
import { useRef } from 'react'
import { loadResume } from '@/lib/storage'

export function BenchmarkPage() {
  const { state, userUid } = useJobs()
  const apiKey = state.profile.apiKey
  const openaiApiKey = state.profile.openaiApiKey || ''
  const aiConfig: AIProviderConfig = {
    geminiApiKey: apiKey || undefined,
    openaiApiKey: openaiApiKey || undefined,
    preferredProvider: 'gemini',
  }
  const hasAnyKey = !!(apiKey || openaiApiKey)
  const fileRef = useRef<HTMLInputElement>(null)

  const [jobUrl, setJobUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [cvText, setCvText] = useState('')
  const [cvFileName, setCvFileName] = useState('')
  const [running, setRunning] = useState(false)
  const [phases, setPhases] = useState<PhaseProgress[]>(
    PHASE_NAMES.map((name, i) => ({ phase: i + 1, name, status: 'pending' as const }))
  )
  const [result, setResult] = useState<BenchmarkResult | null>(null)
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvFileName(file.name)
    const parsed = await parseUploadedCV(file)
    if (parsed.success && parsed.data) {
      const r = parsed.data
      setCvText([`# ${r.fullName}`, r.title, `${r.email} | ${r.phone} | ${r.location}`, '', r.summary, '', '## Experience', ...r.experience.map(x => `### ${x.role} — ${x.company}\n${x.period}\n${x.bullets.join('\n')}`), '', '## Education', ...r.education.map(x => `${x.degree} — ${x.institution} (${x.year})`), '', '## Skills', r.skills.join(', ')].join('\n'))
    } else { setError(parsed.error || 'Falha ao processar CV') }
  }

  const useResumeBuilder = async () => {
    const saved = await loadResume(userUid)
    if (!saved) return
    const r = saved
    setCvText([`# ${r.fullName}`, r.title, '', r.summary, '', '## Experience', ...(r.experience || []).map((x: any) => `### ${x.role} — ${x.company}\n${x.period}\n${(x.bullets || []).join('\n')}`), '', '## Skills', (r.skills || []).join(', ')].join('\n'))
    setCvFileName('Resume Builder')
  }

  const canRun = cvText.length > 50 && (jobDescription.length > 30 || jobUrl.length > 10) && hasAnyKey && !running

  const handleRun = async () => {
    if (!canRun) return
    setRunning(true); setError(''); setResult(null)
    setPhases(PHASE_NAMES.map((name, i) => ({ phase: i + 1, name, status: 'pending' })))
    try {
      const input: BenchmarkInput = { cvText, jobDescription: jobDescription || `Job posting URL: ${jobUrl}`, jobUrl: jobUrl || undefined }
      const r = await runFullBenchmark(aiConfig, input, (p, res) => { 
        setPhases([...p])
        // Only set result if it actually has data, otherwise keep it null so inputs don't disappear
        if (Object.keys(res).length > 0) setResult({ ...res }) 
      })
      if (!r.phase1) {
        throw new Error(phases[0]?.error || 'Benchmark aborted: API capacity exhausted or connection failed.')
      }
      setResult(r)
    } catch (err: any) { 
      setError(err.message || 'Benchmark failed')
      setResult(null) 
    }
    finally { setRunning(false) }
  }

  const handleRecalibrate = async () => {
    if (!result?.phase5 || !hasAnyKey) return
    setRunning(true)
    try {
      const input: BenchmarkInput = { cvText, jobDescription: jobDescription || `Job posting URL: ${jobUrl}` }
      const p7 = await runPhase7(aiConfig, input, result.phase5)
      const p8 = await runPhase8(aiConfig, input, p7)
      setResult(prev => prev ? { ...prev, phase7: p7, phase8: p8 } : null)
    } catch (err: any) { setError(err.message || 'Recalibration failed') }
    finally { setRunning(false) }
  }

  return (
    <div>
      {/* Section Header — same pattern as DashboardPage */}
      <div className="indra-section-header">
        <p className="indra-section-eyebrow">Intelligence</p>
        <h2 className="indra-section-title">Executive Global Benchmark</h2>
        <p className="indra-panel-subtitle" style={{ marginTop: '8px' }}>
          Análise competitiva completa: 8 fases de avaliação estratégica com IA.
        </p>
      </div>

      {/* Main Grid — 2 columns */}
      <section className={result ? "" : "indra-dash-grid"} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* INPUTS AND PROGRESS - Only show if no results OR explicitly requested */}
        {!result && (
          <div style={result ? { display: 'none' } : {}}>
            {/* CV Upload Panel */}
            <div className="indra-panel" style={{ marginBottom: '16px' }}>
              <div className="indra-panel-header">
                <FileText size={16} style={{ color: 'var(--indra-cyan, #00B0BD)' }} />
                <span className="indra-panel-title">Seu CV</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button className="indra-btn-secondary" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>
                  <Upload size={14} /> Upload CV
                </button>
                <button className="indra-btn-secondary" style={{ flex: 1 }} onClick={useResumeBuilder}>
                  <Zap size={14} /> Do Builder
                </button>
              </div>
              {cvFileName && (
                <p style={{ fontSize: '11px', color: '#10B981', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', margin: 0 }} title={cvFileName}>
                  ✓ {cvFileName}
                </p>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>

            {/* Job Target Panel */}
            <div className="indra-panel" style={{ marginBottom: '16px' }}>
              <div className="indra-panel-header">
                <Link2 size={16} style={{ color: 'var(--indra-cyan, #00B0BD)' }} />
                <span className="indra-panel-title">Vaga Alvo</span>
              </div>
              <input
                value={jobUrl} onChange={e => setJobUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/..."
                className="indra-input" style={{ marginBottom: '10px' }}
              />
              <textarea
                value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                placeholder="Cole a descrição completa da vaga aqui..."
                className="indra-input" style={{ minHeight: '120px', resize: 'vertical' }}
              />
            </div>

            {/* Run Button */}
            <button className="indra-btn-cyan" onClick={handleRun} disabled={!canRun}
              style={{ width: '100%', marginBottom: '16px', opacity: canRun ? 1 : 0.4, gap: '10px' }}>
              <Play size={16} /> Iniciar Benchmark (8 Fases)
            </button>

            {!hasAnyKey && <p style={{ fontSize: '11px', color: '#EF4444', marginBottom: '12px' }}>⚠️ Configure pelo menos uma chave API (Gemini ou OpenAI) em Configurações</p>}

            {error && (
              <div style={{ padding: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '12px', color: '#EF4444', wordBreak: 'break-word' }}>{error}</span>
              </div>
            )}

            {/* Phase Tracker */}
            {running && (
              <div className="indra-panel">
                <div className="indra-panel-header">
                  <span className="indra-panel-title">Progresso da Análise</span>
                </div>
                <PhaseTracker phases={phases} />
              </div>
            )}
          </div>
        )}

        {/* RESULTS SECTION - Full width when available */}
        <div style={{ width: '100%' }}>
          {!result && !running && (
            <div className="indra-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
              <Trophy size={48} style={{ color: 'rgba(255,255,255,0.06)' }} />
              <p style={{ fontSize: '14px', color: '#7A9CAE' }}>Faça upload do CV e cole a vaga para iniciar o benchmark</p>
            </div>
          )}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {running && (
                <div className="indra-panel" style={{ marginBottom: '0' }}>
                  <PhaseTracker phases={phases} />
                </div>
              )}
              <BenchmarkResultsPanel result={result} running={running} onRecalibrate={handleRecalibrate} />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

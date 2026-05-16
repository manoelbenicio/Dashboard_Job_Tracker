import React from 'react'
import { RefreshCw, Download, FileText, ChevronRight, BarChart2 } from 'lucide-react'
import { ScoreRing } from '@/components/benchmark/ScoreRing'
import { RiskMatrix } from '@/components/benchmark/RiskMatrix'
import { RadarScoreChart } from '@/components/benchmark/RadarScoreChart'
import { MarketPositionMap } from '@/components/benchmark/MarketPositionMap'
import { ProbabilityGauge } from '@/components/benchmark/ProbabilityGauge'
import { DistinctivenessCards } from '@/components/benchmark/DistinctivenessCards'
import { InteractiveGapAnalysis } from '@/components/benchmark/InteractiveGapAnalysis'
import type { BenchmarkResult } from '@/lib/benchmarkEngine'

const P = {
  card: { background: '#1A1D2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' } as React.CSSProperties,
  title: { fontSize: '18px', fontWeight: 800, color: '#F0F1F5', marginBottom: '24px', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '10px' } as React.CSSProperties,
  sub: { fontSize: '13px', color: '#8B8FA3', lineHeight: 1.6, margin: '16px 0 0' } as React.CSSProperties,
  btn: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em' } as React.CSSProperties,
}

interface Props {
  result: BenchmarkResult
  running: boolean
  onRecalibrate: () => void
}

export function BenchmarkResultsPanel({ result, running, onRecalibrate }: Props) {
  const { phase1: p1, phase2: p2, phase3: p3, phase4: p4, phase6: p6, phase7: p7, phase8: p8 } = result

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      
      {/* 1. Dashboard Header Row (Score + Probability) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {p1 && (
          <div style={{ ...P.card, display: 'flex', flexDirection: 'column' }}>
            <div style={P.title}><BarChart2 size={20} style={{ color: '#00B0BD' }} /> Market Positioning Score</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '20px' }}>
              <ScoreRing score={p1.overallScore} size={120} />
              <div style={{ flex: 1 }}>
                <RadarScoreChart data={p1} />
              </div>
            </div>
            <p style={P.sub}>{p1.strategicJustification}</p>
          </div>
        )}

        {p6 && (
          <div style={P.card}>
            <div style={P.title}>🎯 Probabilidade de Dominância</div>
            <ProbabilityGauge data={p6} />
          </div>
        )}
      </div>

      {/* 2. Middle Row (Market Position + Distinctiveness) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {p2 && (
          <div style={P.card}>
            <div style={P.title}>🗺️ Market Position Map</div>
            <MarketPositionMap data={p2} />
          </div>
        )}

        {p3 && (
          <div style={P.card}>
            <div style={P.title}>⚡ Análise de Distintividade</div>
            <DistinctivenessCards data={p3} />
          </div>
        )}
      </div>

      {/* 3. Risks */}
      {p4 && (
        <div style={P.card}>
          <div style={P.title}>🛡️ Riscos de Posicionamento (Heatmap)</div>
          <RiskMatrix risks={p4.risks} />
        </div>
      )}

      {/* 4. Repositioning & Gaps (Actionable Intelligence) */}
      {p8 && (
        <div style={{ ...P.card, border: '1px solid rgba(0, 176, 189, 0.3)' }}>
          <div style={P.title}>🔄 Interactive Gap Analysis</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px' }}>
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <ScoreRing score={p8.newScore} size={100} label="NOVO SCORE" />
              <span style={{ display: 'block', marginTop: '12px', fontSize: '11px', color: '#8B8FA3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Após MOCKs</span>
            </div>
            <div style={{ flex: 1 }}>
              <InteractiveGapAnalysis data={p8} />
            </div>
          </div>
        </div>
      )}

      {/* 5. Premium CV Output */}
      {p7 && (
        <div style={P.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={P.title}><FileText size={20} style={{ color: '#3B82F6' }} /> CV Premium (A4 Preview)</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={onRecalibrate} disabled={running} style={{ ...P.btn, background: '#242840', color: '#F0F1F5', border: '1px solid rgba(255,255,255,0.1)' }}>
                <RefreshCw size={14} className={running ? 'animate-spin' : ''} /> Recalibrar MOCKs
              </button>
              <button onClick={() => {
                const blob = new Blob([p7.rewrittenCV], { type: 'application/vnd.ms-word' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url; a.download = 'CV-Premium-Exec.doc'; a.click()
                URL.revokeObjectURL(url)
              }} style={{ ...P.btn, background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff', border: '1px solid rgba(59,130,246,0.5)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                <Download size={14} /> Download DOCX
              </button>
            </div>
          </div>

          <div style={{ 
            background: '#FFFFFF', 
            color: '#1A1D2E', 
            padding: '40px', 
            borderRadius: '4px', 
            fontSize: '11px', 
            lineHeight: 1.6, 
            whiteSpace: 'pre-wrap', 
            minHeight: '600px', 
            maxHeight: '800px', 
            overflowY: 'auto', 
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
            margin: '0 auto',
            maxWidth: '210mm'
          }}>
            {p7.rewrittenCV}
          </div>
        </div>
      )}

    </div>
  )
}

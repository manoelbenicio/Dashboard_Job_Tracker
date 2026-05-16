import React from 'react'
import { AlertCircle, CheckCircle2, ChevronRight, PenTool } from 'lucide-react'
import type { Phase8Result } from '@/lib/benchmarkEngine'

interface Props {
  data: Phase8Result
}

export function InteractiveGapAnalysis({ data }: Props) {
  const mockGaps = data.gaps.filter(g => g.isMock)
  const otherGaps = data.gaps.filter(g => !g.isMock)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Verdict Panel */}
      <div style={{ padding: '20px', background: 'linear-gradient(145deg, #1A1D2E, #242840)', borderRadius: '12px', borderLeft: '4px solid #00B0BD' }}>
        <p style={{ fontSize: '14px', color: '#F0F1F5', lineHeight: 1.6, margin: 0 }}>
          {data.finalVerdict}
        </p>
      </div>

      {/* MOCK Gaps (Action Required) */}
      {mockGaps.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertCircle size={16} style={{ color: '#F59E0B' }} />
            <h4 style={{ fontSize: '13px', color: '#F0F1F5', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ação Necessária (Preencher MOCKs)
            </h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mockGaps.map((gap, i) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(245,158,11,0.05)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ padding: '8px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', color: '#F59E0B' }}>
                  <PenTool size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h5 style={{ fontSize: '13px', fontWeight: 600, color: '#F0F1F5', margin: 0 }}>{gap.area}</h5>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#F59E0B', background: 'rgba(245,158,11,0.15)', padding: '2px 6px', borderRadius: '4px' }}>MOCK PENDENTE</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#C4C7D4', margin: 0, lineHeight: 1.5 }}>{gap.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Gaps / Improvements */}
      {otherGaps.length > 0 && (
        <div style={{ marginTop: mockGaps.length > 0 ? '16px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle2 size={16} style={{ color: '#10B981' }} />
            <h4 style={{ fontSize: '13px', color: '#8B8FA3', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Melhorias Sugeridas
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {otherGaps.map((gap, i) => (
              <div key={i} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <ChevronRight size={14} style={{ color: '#8B8FA3', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#E5E7EB', display: 'block', marginBottom: '2px' }}>{gap.area}</span>
                  <span style={{ fontSize: '12px', color: '#8B8FA3' }}>{gap.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

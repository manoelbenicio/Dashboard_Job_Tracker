import React from 'react'
import { Star, ShieldAlert, Zap, Box, Repeat } from 'lucide-react'
import type { Phase3Result } from '@/lib/benchmarkEngine'

interface Props {
  data: Phase3Result
}

export function DistinctivenessCards({ data }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top 3 Strengths as Cards */}
      <div>
        <h4 style={{ fontSize: '12px', color: '#8B8FA3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 600 }}>Top 3 Diferenciais Competitivos</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {data.top3Strengths.map((strength, i) => (
            <div key={i} style={{ padding: '16px', background: 'linear-gradient(145deg, #242840, #1A1D2E)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                <Star size={64} style={{ color: '#F59E0B' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 800 }}>{i + 1}</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#F0F1F5', lineHeight: 1.6, margin: 0, position: 'relative', zIndex: 1, fontWeight: 500 }}>
                {strength}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        {/* Commodity Assessment */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Box size={16} style={{ color: '#60A5FA' }} />
            <h4 style={{ fontSize: '13px', color: '#F0F1F5', fontWeight: 600, margin: 0 }}>É Commodity?</h4>
          </div>
          <p style={{ fontSize: '13px', color: '#C4C7D4', lineHeight: 1.6, margin: 0 }}>{data.isCommodity}</p>
        </div>

        {/* Replaceability Assessment */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Repeat size={16} style={{ color: '#8B5CF6' }} />
            <h4 style={{ fontSize: '13px', color: '#F0F1F5', fontWeight: 600, margin: 0 }}>É Substituível?</h4>
          </div>
          <p style={{ fontSize: '13px', color: '#C4C7D4', lineHeight: 1.6, margin: 0 }}>{data.isReplaceable}</p>
        </div>

      </div>

      {/* Weaknesses */}
      {data.weaknessesVsCompetitors && data.weaknessesVsCompetitors.length > 0 && (
        <div>
          <h4 style={{ fontSize: '12px', color: '#8B8FA3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 600 }}>Onde Perde para Concorrentes</h4>
          <div style={{ padding: '16px', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.1)' }}>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.weaknessesVsCompetitors.map((weakness, i) => (
                <li key={i} style={{ fontSize: '13px', color: '#F87171', lineHeight: 1.5 }}>
                  <span style={{ color: '#E5E7EB' }}>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  )
}

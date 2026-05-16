import React from 'react'
import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'
import type { RiskItem } from '@/lib/benchmarkEngine'

interface Props {
  risks: RiskItem[]
}

const severityConfig: Record<string, { level: number, color: string; bg: string; border: string; icon: typeof ShieldCheck }> = {
  'Baixo': { level: 1, color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: ShieldCheck },
  'Médio': { level: 2, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: AlertTriangle },
  'Médio-Alto': { level: 3, color: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', icon: ShieldAlert },
  'Alto': { level: 4, color: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', icon: ShieldAlert },
  'Crítico': { level: 5, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: ShieldX },
}

export function RiskMatrix({ risks }: Props) {
  // Sort risks by severity level (descending)
  const sortedRisks = [...risks].sort((a, b) => {
    const levelA = severityConfig[a.severity]?.level || 0
    const levelB = severityConfig[b.severity]?.level || 0
    return levelB - levelA
  })

  // Group by severity
  const grouped = {
    'Alto/Crítico': sortedRisks.filter(r => ['Alto', 'Crítico'].includes(r.severity)),
    'Médio': sortedRisks.filter(r => ['Médio', 'Médio-Alto'].includes(r.severity)),
    'Baixo': sortedRisks.filter(r => r.severity === 'Baixo')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Visual Heatmap Summary */}
      <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', gap: '2px' }}>
        {risks.map((r, i) => {
          const config = severityConfig[r.severity] || severityConfig['Médio']
          return <div key={i} style={{ flex: 1, background: config.color, opacity: 0.8 }} title={r.area} />
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        
        {/* High / Critical */}
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.05)', borderRadius: '10px', borderTop: '3px solid #EF4444' }}>
          <h4 style={{ fontSize: '12px', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 700 }}>Alta Severidade</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {grouped['Alto/Crítico'].length === 0 ? (
              <span style={{ fontSize: '12px', color: '#8B8FA3' }}>Nenhum risco crítico detectado.</span>
            ) : grouped['Alto/Crítico'].map((risk, i) => (
              <div key={i}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#F0F1F5', display: 'block', marginBottom: '2px' }}>{risk.area}</span>
                <span style={{ fontSize: '11px', color: '#C4C7D4', lineHeight: 1.4, display: 'block' }}>{risk.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medium */}
        <div style={{ padding: '16px', background: 'rgba(245,158,11,0.05)', borderRadius: '10px', borderTop: '3px solid #F59E0B' }}>
          <h4 style={{ fontSize: '12px', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 700 }}>Atenção (Médio)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {grouped['Médio'].length === 0 ? (
              <span style={{ fontSize: '12px', color: '#8B8FA3' }}>Nenhum risco médio detectado.</span>
            ) : grouped['Médio'].map((risk, i) => (
              <div key={i}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#F0F1F5', display: 'block', marginBottom: '2px' }}>{risk.area}</span>
                <span style={{ fontSize: '11px', color: '#C4C7D4', lineHeight: 1.4, display: 'block' }}>{risk.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low */}
        <div style={{ padding: '16px', background: 'rgba(16,185,129,0.05)', borderRadius: '10px', borderTop: '3px solid #10B981' }}>
          <h4 style={{ fontSize: '12px', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 700 }}>Monitorar (Baixo)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {grouped['Baixo'].length === 0 ? (
              <span style={{ fontSize: '12px', color: '#8B8FA3' }}>Nenhum risco baixo listado.</span>
            ) : grouped['Baixo'].map((risk, i) => (
              <div key={i}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#F0F1F5', display: 'block', marginBottom: '2px' }}>{risk.area}</span>
                <span style={{ fontSize: '11px', color: '#C4C7D4', lineHeight: 1.4, display: 'block' }}>{risk.detail}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

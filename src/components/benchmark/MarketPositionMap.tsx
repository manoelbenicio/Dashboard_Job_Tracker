import React from 'react'
import { Building2, Cpu, LineChart, Globe2, Briefcase } from 'lucide-react'
import type { Phase2Result } from '@/lib/benchmarkEngine'

interface Props {
  data: Phase2Result
}

export function MarketPositionMap({ data }: Props) {
  const categories = [
    { id: 'fortune100', label: 'Fortune 100', text: data.fortune100, icon: Building2, color: '#3B82F6' },
    { id: 'bigTech', label: 'Big Tech', text: data.bigTech, icon: Cpu, color: '#8B5CF6' },
    { id: 'tier1', label: 'Tier 1 Consulting', text: data.tier1Consulting, icon: LineChart, color: '#10B981' },
    { id: 'ipo', label: 'IPO / M&A', text: data.ipoMa, icon: Briefcase, color: '#F59E0B' },
    { id: 'global', label: 'Global Execs', text: data.globalExecs, icon: Globe2, color: '#EC4899' },
  ]

  // Calculate generic position strength based on keywords
  const isTop1 = data.marketPosition.toLowerCase().includes('top 1%')
  const isTop10 = data.marketPosition.toLowerCase().includes('top 10')
  const isAbove = data.marketPosition.toLowerCase().includes('acima da m')

  const badgeColor = isTop1 ? '#60A5FA' : isTop10 ? '#10B981' : isAbove ? '#34D399' : '#F59E0B'
  const badgeBg = isTop1 ? 'rgba(96,165,250,0.15)' : isTop10 ? 'rgba(16,185,129,0.15)' : isAbove ? 'rgba(52,211,153,0.15)' : 'rgba(245,158,11,0.15)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#8B8FA3', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Posicionamento Geral</span>
          <div style={{ marginTop: '4px' }}>
            <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '8px', background: badgeBg, color: badgeColor, fontSize: '13px', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
              {data.marketPosition}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {categories.map((cat, i) => (
          <div key={i} style={{ padding: '16px', background: '#242840', borderRadius: '10px', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: cat.color }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <cat.icon size={16} style={{ color: cat.color }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#F0F1F5' }}>{cat.label}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#C4C7D4', lineHeight: 1.6, margin: 0 }}>
              {cat.text}
            </p>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px', background: '#1A1D2E', borderRadius: '10px', borderLeft: '2px solid #60A5FA' }}>
        <p style={{ fontSize: '13px', color: '#8B8FA3', lineHeight: 1.6, margin: 0 }}>
          {data.explanation}
        </p>
      </div>

    </div>
  )
}

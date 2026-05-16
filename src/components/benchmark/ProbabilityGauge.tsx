import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Globe, Trophy, Target } from 'lucide-react'
import type { Phase6Result } from '@/lib/benchmarkEngine'

interface Props {
  data: Phase6Result
}

export function ProbabilityGauge({ data }: Props) {
  const winProbability = data.winProbability || 0
  const remaining = 100 - winProbability

  const pieData = [
    { name: 'Win', value: winProbability },
    { name: 'Remaining', value: remaining }
  ]

  // Color mapping based on probability
  let color = '#EF4444' // Red
  if (winProbability >= 80) color = '#10B981' // Green
  else if (winProbability >= 50) color = '#F59E0B' // Amber
  else if (winProbability >= 30) color = '#3B82F6' // Blue

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top section: Gauge and Main KPI */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
        
        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                startAngle={225}
                endAngle={-45}
                innerRadius="75%"
                outerRadius="100%"
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell key="cell-0" fill={color} />
                <Cell key="cell-1" fill="rgba(255,255,255,0.05)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '36px', fontWeight: 800, color: '#F0F1F5', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
              {winProbability}%
            </span>
            <span style={{ fontSize: '10px', color: '#8B8FA3', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
              Win Rate
            </span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={20} style={{ color: '#10B981' }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: '#8B8FA3', textTransform: 'uppercase', margin: '0 0 2px 0', fontWeight: 600 }}>Ranking Estimado</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#F0F1F5', margin: 0 }}>{data.estimatedRanking}</p>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(192,132,252,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} style={{ color: '#C084FC' }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: '#8B8FA3', textTransform: 'uppercase', margin: '0 0 2px 0', fontWeight: 600 }}>Nível Competitivo</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#F0F1F5', margin: 0 }}>{data.competitivenessLevel}</p>
            </div>
          </div>

        </div>

      </div>

      <div style={{ padding: '16px', background: '#242840', borderRadius: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <Target size={16} style={{ color: '#00B0BD' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#F0F1F5' }}>Executive Summary</span>
        </div>
        <p style={{ fontSize: '13px', color: '#C4C7D4', lineHeight: 1.6, margin: 0 }}>
          {data.summary}
        </p>
      </div>

    </div>
  )
}

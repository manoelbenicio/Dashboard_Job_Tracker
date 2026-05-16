import React from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import type { Phase1Result } from '@/lib/benchmarkEngine'

interface Props {
  data: Phase1Result
}

export function RadarScoreChart({ data }: Props) {
  const chartData = data.categories.map(c => ({
    subject: c.category,
    score: c.score,
    fullMark: 100,
    weight: c.weight
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{ background: '#1A1D2E', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          <p style={{ color: '#F0F1F5', fontSize: '12px', fontWeight: 600, margin: '0 0 4px 0' }}>{data.subject}</p>
          <p style={{ color: '#00B0BD', fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0', fontFamily: "'JetBrains Mono'" }}>{data.score}/100</p>
          <p style={{ color: '#8B8FA3', fontSize: '10px', margin: 0 }}>Weight: {data.weight}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#8B8FA3', fontSize: 10, fontFamily: "'Inter', sans-serif" }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#00B0BD"
            strokeWidth={2}
            fill="#00B0BD"
            fillOpacity={0.3}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

import { useEffect, useState } from 'react'

interface Props {
  score: number
  size?: number
  label?: string
}

export function ScoreRing({ score, size = 180, label = 'SCORE GLOBAL' }: Props) {
  const [animated, setAnimated] = useState(0)
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / 1500, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setAnimated(Math.round(score * eased))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [score])

  const getColor = (s: number) => {
    if (s >= 85) return '#00B0BD'
    if (s >= 70) return '#10B981'
    if (s >= 50) return '#F59E0B'
    if (s >= 30) return '#F97316'
    return '#EF4444'
  }

  const color = getColor(animated)

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background ring */}
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        {/* Score ring */}
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke 0.3s' }} />
      </svg>
      <div style={{
        position: 'absolute', textAlign: 'center',
      }}>
        <div style={{
          fontSize: size * 0.25, fontWeight: 800, color,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1,
        }}>
          {animated}
        </div>
        <div style={{
          fontSize: '10px', color: '#7A9CAE',
          textTransform: 'uppercase', letterSpacing: '0.12em',
          marginTop: '4px',
        }}>
          {label}
        </div>
      </div>
    </div>
  )
}

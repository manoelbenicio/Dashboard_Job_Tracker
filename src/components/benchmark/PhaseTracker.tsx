import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react'
import type { PhaseProgress } from '@/lib/benchmarkEngine'

interface Props {
  phases: PhaseProgress[]
}

export function PhaseTracker({ phases }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {phases.map((p) => {
        const icons = {
          pending: <Clock size={14} style={{ color: '#7A9CAE' }} />,
          running: <Loader2 size={14} className="animate-spin" style={{ color: '#00B0BD' }} />,
          complete: <CheckCircle size={14} style={{ color: '#10B981' }} />,
          error: <AlertCircle size={14} style={{ color: '#EF4444' }} />,
        }
        const colors = {
          pending: '#7A9CAE',
          running: '#00B0BD',
          complete: '#10B981',
          error: '#EF4444',
        }

        return (
          <div key={p.phase} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', borderRadius: '6px',
            background: p.status === 'running' ? 'rgba(0,176,189,0.06)' : 'transparent',
            transition: 'all 0.3s',
          }}>
            {icons[p.status]}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                fontSize: '12px', fontWeight: p.status === 'running' ? 600 : 400,
                color: colors[p.status],
              }}>
                Fase {p.phase}: {p.name}
              </span>
            </div>
            {p.error && (
              <span style={{ fontSize: '10px', color: '#EF4444', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.error}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

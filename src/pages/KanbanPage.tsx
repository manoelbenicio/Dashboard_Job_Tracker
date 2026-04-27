import { Kanban } from 'lucide-react'

export function KanbanPage() {
  return (
    <div>
      <div className="mb-8 animate-fade-in-up delay-1">
        <h1 className="text-headline" style={{ color: 'var(--color-on-surface)' }}>Kanban Board</h1>
        <p className="text-body mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          Visual pipeline — drag cards between stages to update status.
        </p>
      </div>
      <div className="glass-card-elevated animate-fade-in-up delay-2 flex flex-col items-center justify-center py-16" style={{ border: '1px solid var(--glass-stroke)' }}>
        <Kanban size={48} style={{ color: 'var(--color-surface-container-highest)', marginBottom: '16px' }} />
        <h2 className="text-title" style={{ color: 'var(--color-on-surface)' }}>Drag & Drop Pipeline</h2>
        <p className="text-label-md mt-2">Coming in Phase 4 — Applied → Interview → Offer → Accepted</p>
      </div>
    </div>
  )
}

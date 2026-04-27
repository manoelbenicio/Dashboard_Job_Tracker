import { Briefcase, Plus } from 'lucide-react'

export function JobsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-fade-in-up delay-1">
        <div>
          <h1 className="text-headline" style={{ color: 'var(--color-on-surface)' }}>Job Applications</h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
            Manage and track all your applications in one place.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: 'var(--gradient-primary)',
            color: 'var(--color-on-primary)',
          }}
        >
          <Plus size={16} />
          Add Application
        </button>
      </div>

      <div className="glass-card-elevated animate-fade-in-up delay-2 flex flex-col items-center justify-center py-16" style={{ border: '1px solid var(--glass-stroke)' }}>
        <Briefcase size={48} style={{ color: 'var(--color-surface-container-highest)', marginBottom: '16px' }} />
        <h2 className="text-title" style={{ color: 'var(--color-on-surface)' }}>Job Tracker CRUD</h2>
        <p className="text-label-md mt-2">Coming in Phase 3 — Job list, filters, modal forms</p>
      </div>
    </div>
  )
}

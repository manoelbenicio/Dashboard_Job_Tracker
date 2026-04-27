import { FileText } from 'lucide-react'

export function ResumePage() {
  return (
    <div>
      <div className="mb-8 animate-fade-in-up delay-1">
        <h1 className="text-headline" style={{ color: 'var(--color-on-surface)' }}>Resume Builder</h1>
        <p className="text-body mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          AI-powered resume analysis and cover letter generation.
        </p>
      </div>
      <div className="glass-card-elevated animate-fade-in-up delay-2 flex flex-col items-center justify-center py-16" style={{ border: '1px solid var(--glass-stroke)' }}>
        <FileText size={48} style={{ color: 'var(--color-surface-container-highest)', marginBottom: '16px' }} />
        <h2 className="text-title" style={{ color: 'var(--color-on-surface)' }}>AI Resume Suite</h2>
        <p className="text-label-md mt-2">Coming in Phase 5 — Gemini-powered analysis & generation</p>
      </div>
    </div>
  )
}

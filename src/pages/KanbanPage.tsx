import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { MapPin, DollarSign, Calendar, GripVertical } from 'lucide-react'
import { useJobs } from '@/context/JobContext'
import { Job, JOB_STATUSES, type JobStatus } from '@/types'

/* ─── Job Card ───────────────────────────────────────── */

function KanbanCard({ job, isDragging }: { job: Job; isDragging?: boolean }) {
  const statusColor = JOB_STATUSES.find(s => s.value === job.status)?.color || '#86948a'

  return (
    <div
      className="rounded-xl p-4 transition-all cursor-grab active:cursor-grabbing"
      style={{
        background: 'var(--color-surface-container)',
        border: isDragging ? `2px solid ${statusColor}` : '1px solid var(--glass-stroke)',
        boxShadow: isDragging ? `0 12px 40px ${statusColor}30` : 'none',
        transform: isDragging ? 'scale(1.04) rotate(1deg)' : 'none',
        opacity: isDragging ? 0.95 : 1,
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'var(--gradient-primary-subtle)', color: 'var(--color-primary)' }}
          >
            {job.company[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-on-surface)' }}>
              {job.company}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--color-on-surface-variant)' }}>
              {job.role}
            </p>
          </div>
        </div>
        <GripVertical size={14} style={{ color: 'var(--color-surface-container-highest)', opacity: 0.4 }} />
      </div>

      <div className="flex flex-col gap-1.5">
        {job.salary && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
            <DollarSign size={12} />
            <span className="text-data truncate">{job.salary}</span>
          </div>
        )}
        {job.location && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
            <MapPin size={12} />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
          <Calendar size={12} />
          <span>{new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {job.origin !== 'application' && (
        <div className="mt-3 pt-2" style={{ borderTop: '1px solid var(--color-surface-container-high)' }}>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}
          >
            {job.origin}
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Sortable Wrapper ───────────────────────────────── */

function SortableCard({ job }: { job: Job }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
    data: { type: 'card', job },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard job={job} />
    </div>
  )
}

/* ─── Kanban Column ──────────────────────────────────── */

function KanbanColumn({ status, jobs }: { status: typeof JOB_STATUSES[0]; jobs: Job[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.value })

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col min-w-[280px] max-w-[320px] flex-1 rounded-2xl transition-all"
      style={{
        background: isOver ? 'var(--color-surface-container-low)' : 'var(--color-surface-container-lowest)',
        border: isOver ? `2px dashed ${status.color}` : '1px solid var(--glass-stroke)',
        padding: 'var(--space-md)',
        boxShadow: isOver ? `0 0 20px ${status.color}20` : 'none',
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>
            {status.label}
          </span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-data"
          style={{ background: `${status.color}20`, color: status.color }}
        >
          {jobs.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 flex-1 min-h-[100px]">
          {jobs.map(job => (
            <SortableCard key={job.id} job={job} />
          ))}
          {jobs.length === 0 && (
            <div
              className="flex items-center justify-center rounded-xl py-8 text-xs"
              style={{
                border: '1px dashed var(--color-surface-container-high)',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

/* ─── Kanban Board ───────────────────────────────────── */

export function KanbanPage() {
  const { state, dispatch } = useJobs()
  const [activeJob, setActiveJob] = useState<Job | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const job = state.jobs.find(j => j.id === active.id)
    if (job) setActiveJob(job)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveJob(null)

    if (!over) return

    const jobId = active.id as string
    const targetStatus = over.id as string

    // Check if dropped on a column
    const isColumn = JOB_STATUSES.some(s => s.value === targetStatus)
    if (isColumn) {
      const currentJob = state.jobs.find(j => j.id === jobId)
      if (currentJob && currentJob.status !== targetStatus) {
        dispatch({ type: 'UPDATE_STATUS', payload: { id: jobId, status: targetStatus as JobStatus } })
      }
      return
    }

    // Dropped on another card — get that card's status
    const targetJob = state.jobs.find(j => j.id === targetStatus)
    if (targetJob) {
      const currentJob = state.jobs.find(j => j.id === jobId)
      if (currentJob && currentJob.status !== targetJob.status) {
        dispatch({ type: 'UPDATE_STATUS', payload: { id: jobId, status: targetJob.status } })
      }
    }
  }

  return (
    <div>
      <div className="mb-6 animate-fade-in-up delay-1">
        <h1 className="text-headline" style={{ color: 'var(--color-on-surface)' }}>Kanban Board</h1>
        <p className="text-body mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          Drag cards between columns to update application status. Changes persist automatically.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto pb-4 animate-fade-in-up delay-2" style={{ minHeight: '60vh' }}>
          {JOB_STATUSES.map(status => (
            <KanbanColumn
              key={status.value}
              status={status}
              jobs={state.jobs.filter(j => j.status === status.value)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeJob && <KanbanCard job={activeJob} isDragging />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

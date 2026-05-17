import { useState } from 'react'
import {
  DndContext, DragOverlay, closestCorners, PointerSensor,
  useSensor, useSensors, type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { MapPin, DollarSign, Calendar, GripVertical } from 'lucide-react'
import { useJobs } from '@/context/JobContext'
import { Job, JOB_STATUSES, type JobStatus } from '@/types'

/* ─── Kanban Card — Indra Style ─── */
function KanbanCard({ job, isDragging }: { job: Job; isDragging?: boolean }) {
  return (
    <div style={{
      background: isDragging ? 'rgba(0,176,189,0.08)' : '#003E50',
      border: isDragging ? '2px solid #00B0BD' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '16px',
      cursor: isDragging ? 'grabbing' : 'grab',
      boxShadow: isDragging ? '0 12px 40px rgba(0,176,189,0.2)' : 'none',
      transform: isDragging ? 'scale(1.04) rotate(1deg)' : 'none',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '32px', height: '32px', flexShrink: 0,
            background: 'rgba(0,176,189,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#00B0BD',
          }}>
            {job.company[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {job.company}
            </p>
            <p style={{ fontSize: '12px', color: '#7A9CAE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {job.role}
            </p>
          </div>
        </div>
        <GripVertical size={14} style={{ color: '#7A9CAE', opacity: 0.4, flexShrink: 0 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {job.salary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#7A9CAE' }}>
            <DollarSign size={12} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{job.salary}</span>
          </div>
        )}
        {job.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#7A9CAE' }}>
            <MapPin size={12} />
            <span>{job.location}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#7A9CAE' }}>
          <Calendar size={12} />
          <span>{new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {job.origin !== 'application' && (
        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(255,255,255,0.06)', color: '#7A9CAE', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
            {job.origin}
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Sortable Wrapper ─── */
function SortableCard({ job }: { job: Job }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id, data: { type: 'card', job },
  })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }} {...attributes} {...listeners}
      onDoubleClick={() => (window as any).__jobflow_viewJob?.(job.id)}
    >
      <KanbanCard job={job} />
    </div>
  )
}

/* ─── Kanban Column — Indra Style ─── */
function KanbanColumn({ status, jobs }: { status: typeof JOB_STATUSES[0]; jobs: Job[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.value })

  return (
    <div ref={setNodeRef} style={{
      minWidth: '280px', maxWidth: '320px', flex: 1,
      background: isOver ? 'rgba(0,176,189,0.04)' : '#002B3A',
      border: isOver ? '2px dashed #00B0BD' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.2s',
    }}>
      {/* Column Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.color, display: 'inline-block' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{status.label}</span>
        </div>
        <span style={{
          fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px',
          background: `${status.color}20`, color: status.color,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {jobs.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: '100px' }}>
          {jobs.map(job => <SortableCard key={job.id} job={job} />)}
          {jobs.length === 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '8px',
              padding: '32px 0', fontSize: '12px', color: '#7A9CAE',
            }}>
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

/* ─── Kanban Board ─── */
export function KanbanPage() {
  const { state, dispatch } = useJobs()
  const [activeJob, setActiveJob] = useState<Job | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragStart = (event: DragStartEvent) => {
    const job = state.jobs.find(j => j.id === event.active.id)
    if (job) setActiveJob(job)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveJob(null)
    if (!over) return

    const jobId = active.id as string
    const targetStatus = over.id as string
    const isColumn = JOB_STATUSES.some(s => s.value === targetStatus)

    if (isColumn) {
      const currentJob = state.jobs.find(j => j.id === jobId)
      if (currentJob && currentJob.status !== targetStatus) {
        dispatch({ type: 'UPDATE_STATUS', payload: { id: jobId, status: targetStatus as JobStatus } })
      }
      return
    }

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
      <div className="indra-section-header">
        <p className="indra-section-eyebrow">Pipeline</p>
        <h2 className="indra-section-title">Kanban Board</h2>
        <p className="indra-panel-subtitle" style={{ marginTop: '4px' }}>
          Drag cards between columns to update status. Changes persist automatically.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px', minHeight: '60vh' }}>
          {JOB_STATUSES.map(status => (
            <KanbanColumn key={status.value} status={status} jobs={state.jobs.filter(j => j.status === status.value)} />
          ))}
        </div>
        <DragOverlay>
          {activeJob && <KanbanCard job={activeJob} isDragging />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

import { useState } from 'react'
import { Download, FileText, FileJson, FileCode, Printer } from 'lucide-react'
import { exportToDocx, exportToJSON, exportToMarkdown, type ParsedResume } from '@/lib/resumeService'

interface Props {
  data: ParsedResume
}

export function ResumeExporter({ data }: Props) {
  const [exported, setExported] = useState('')

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setExported(filename.split('.').pop() || '')
    setTimeout(() => setExported(''), 2000)
  }

  const formats = [
    {
      id: 'pdf', label: 'PDF', icon: Printer, color: '#EF4444',
      action: () => window.print(),
    },
    {
      id: 'docx', label: 'DOCX', icon: FileText, color: '#3B82F6',
      action: () => download(exportToDocx(data), `${data.fullName || 'resume'}-cv.doc`),
    },
    {
      id: 'json', label: 'JSON', icon: FileJson, color: '#F59E0B',
      action: () => download(exportToJSON(data), `${data.fullName || 'resume'}-cv.json`),
    },
    {
      id: 'md', label: 'Markdown', icon: FileCode, color: '#10B981',
      action: () => download(exportToMarkdown(data), `${data.fullName || 'resume'}-cv.md`),
    },
  ]

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {formats.map(fmt => {
        const Icon = fmt.icon
        const isExported = exported === fmt.id
        return (
          <button
            key={fmt.id}
            onClick={fmt.action}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', fontSize: '12px', fontWeight: 500,
              background: isExported ? 'rgba(16,185,129,0.12)' : '#003E50',
              border: `1px solid ${isExported ? '#10B981' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '6px', color: isExported ? '#10B981' : '#FFFFFF',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <Icon size={14} style={{ color: isExported ? '#10B981' : fmt.color }} />
            {isExported ? 'Saved!' : fmt.label}
          </button>
        )
      })}
    </div>
  )
}

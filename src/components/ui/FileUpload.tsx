import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, CheckCircle2, XCircle, RefreshCw, Loader2, X, AlertCircle } from 'lucide-react'
import { uploadFiles, validateFile, type UploadResult } from '@/lib/uploadService'

interface FileUploadProps {
  onResults?: (results: UploadResult[]) => void
  onClose?: () => void
}

interface FileItem {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  result?: UploadResult
}

export function FileUpload({ onResults, onClose }: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const items: FileItem[] = Array.from(newFiles).map(f => {
      const validation = validateFile(f)
      return {
        file: f,
        status: validation.valid ? 'pending' as const : 'error' as const,
        result: validation.valid ? undefined : { success: false, filename: f.name, error: validation.error, errorType: validation.errorType },
      }
    })
    setFiles(prev => [...prev, ...items])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index))

  const processFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    if (!pendingFiles.length) return
    setProcessing(true)

    // Mark all pending as uploading
    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' as const } : f))

    const results = await uploadFiles(
      pendingFiles.map(f => f.file),
      (completed, _total, result) => {
        setFiles(prev => prev.map(f => {
          if (f.file.name === result.filename && f.status === 'uploading') {
            return { ...f, status: result.success ? 'success' as const : 'error' as const, result }
          }
          return f
        }))
      }
    )

    setProcessing(false)
    onResults?.(results)
  }

  const retryFile = async (index: number) => {
    const item = files[index]
    if (!item) return
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading' as const, result: undefined } : f))

    const results = await uploadFiles([item.file])
    const result = results[0]
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: result.success ? 'success' as const : 'error' as const, result } : f))
  }

  const successCount = files.filter(f => f.status === 'success').length
  const errorCount = files.filter(f => f.status === 'error').length
  const pendingCount = files.filter(f => f.status === 'pending').length

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    }} onClick={e => { if (e.target === e.currentTarget && !processing) onClose?.() }}>
      <div style={{
        width: '100%', maxWidth: '640px', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        background: '#002B3A', border: '1px solid rgba(255,255,255,0.08)',
        animation: 'indra-slide-up 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Document Processing</h2>
            <p style={{ fontSize: '12px', color: '#7A9CAE', margin: '4px 0 0' }}>Powered by Docling AI Engine</p>
          </div>
          {onClose && !processing && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7A9CAE', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            margin: '0 24px', padding: '32px', textAlign: 'center', cursor: 'pointer',
            border: `2px dashed ${isDragging ? '#00B0BD' : 'rgba(255,255,255,0.12)'}`,
            background: isDragging ? 'rgba(0,176,189,0.06)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <Upload size={32} style={{ color: isDragging ? '#00B0BD' : '#7A9CAE', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: '#FFFFFF', margin: '0 0 4px' }}>
            {isDragging ? 'Drop files here' : 'Click or drag files to upload'}
          </p>
          <p style={{ fontSize: '12px', color: '#7A9CAE', margin: 0 }}>
            PDF, DOCX, PPTX, XLSX, HTML, TXT, images — up to 100MB
          </p>
          <input
            ref={inputRef}
            type="file" multiple
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = '' }}
            accept=".pdf,.docx,.pptx,.xlsx,.html,.htm,.txt,.md,.png,.jpg,.jpeg,.tiff,.tif,.tex"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            {/* Summary */}
            {(successCount > 0 || errorCount > 0) && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px' }}>
                {successCount > 0 && <span style={{ color: '#4ADE80' }}>✓ {successCount} processed</span>}
                {errorCount > 0 && <span style={{ color: '#E91E63' }}>✗ {errorCount} failed</span>}
                {pendingCount > 0 && <span style={{ color: '#7A9CAE' }}>⏳ {pendingCount} pending</span>}
              </div>
            )}

            {/* Files */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {files.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', background: '#003E50',
                  border: item.status === 'error' ? '1px solid rgba(233,30,99,0.3)' : '1px solid rgba(255,255,255,0.04)',
                }}>
                  <FileText size={16} style={{
                    color: item.status === 'success' ? '#4ADE80' : item.status === 'error' ? '#E91E63' : '#7A9CAE',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.file.name}
                    </p>
                    {item.status === 'error' && item.result?.error && (
                      <p style={{ fontSize: '11px', color: '#E91E63', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={11} /> {item.result.error}
                      </p>
                    )}
                    {item.status === 'success' && item.result?.charCount && (
                      <p style={{ fontSize: '11px', color: '#4ADE80', margin: '2px 0 0' }}>
                        {item.result.charCount.toLocaleString()} characters extracted
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.status === 'uploading' && <Loader2 size={16} className="animate-spin" style={{ color: '#00B0BD' }} />}
                    {item.status === 'success' && <CheckCircle2 size={16} style={{ color: '#4ADE80' }} />}
                    {item.status === 'error' && (
                      <button onClick={() => retryFile(idx)} style={{ background: 'none', border: 'none', color: '#00B0BD', cursor: 'pointer', padding: '4px' }} title="Retry">
                        <RefreshCw size={14} />
                      </button>
                    )}
                    {item.status !== 'uploading' && (
                      <button onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', color: '#7A9CAE', cursor: 'pointer', padding: '4px' }} title="Remove">
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={processFiles}
            disabled={pendingCount === 0 || processing}
            className="indra-btn-cyan"
            style={{ flex: 1, gap: '8px', opacity: (pendingCount === 0 || processing) ? 0.5 : 1 }}
          >
            {processing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {processing ? 'Processing...' : `Process ${pendingCount} File${pendingCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

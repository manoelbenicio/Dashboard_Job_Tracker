import { useState, useEffect } from 'react'
import { Folder, FileText, ChevronRight, ArrowLeft, X, Loader2, CheckSquare, Square, HardDrive, AlertCircle } from 'lucide-react'
import { requestDriveAccess, listDriveFiles, downloadDriveFile, getDriveAccessToken, type DriveFile } from '@/lib/driveService'

interface DriveFilePickerProps {
  onFilesSelected: (files: File[]) => void
  onClose: () => void
}

export function DriveFilePicker({ onFilesSelected, onClose }: DriveFilePickerProps) {
  const [authed, setAuthed] = useState(!!getDriveAccessToken())
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<DriveFile[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [folderStack, setFolderStack] = useState<{ id?: string; name: string }[]>([{ name: 'My Drive' }])
  const [downloading, setDownloading] = useState(false)

  const currentFolder = folderStack[folderStack.length - 1]

  const authenticate = async () => {
    setAuthLoading(true); setError('')
    try {
      await requestDriveAccess()
      setAuthed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally { setAuthLoading(false) }
  }

  const loadFiles = async (folderId?: string) => {
    setLoading(true); setError('')
    try {
      const result = await listDriveFiles(folderId)
      setFiles(result)
      setSelected(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (authed) loadFiles(currentFolder.id)
  }, [authed])

  const navigateFolder = (folder: DriveFile) => {
    setFolderStack(prev => [...prev, { id: folder.id, name: folder.name }])
    loadFiles(folder.id)
  }

  const goBack = () => {
    if (folderStack.length <= 1) return
    const newStack = folderStack.slice(0, -1)
    setFolderStack(newStack)
    loadFiles(newStack[newStack.length - 1].id)
  }

  const toggleSelect = (fileId: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(fileId)) next.delete(fileId)
      else next.add(fileId)
      return next
    })
  }

  const handleDownloadSelected = async () => {
    setDownloading(true); setError('')
    try {
      const selectedFiles = files.filter(f => selected.has(f.id) && !f.isFolder)
      const downloadedFiles: File[] = []

      for (const driveFile of selectedFiles) {
        const file = await downloadDriveFile(driveFile.id, driveFile.name)
        downloadedFiles.push(file)
      }

      onFilesSelected(downloadedFiles)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally { setDownloading(false) }
  }

  const selectedFileCount = Array.from(selected).filter(id => {
    const f = files.find(file => file.id === id)
    return f && !f.isFolder
  }).length

  const formatSize = (bytes?: string) => {
    if (!bytes) return ''
    const n = parseInt(bytes)
    if (n < 1024) return `${n}B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)}KB`
    return `${(n / 1024 / 1024).toFixed(1)}MB`
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: '100%', maxWidth: '560px', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        background: '#002B3A', border: '1px solid rgba(255,255,255,0.08)',
        animation: 'indra-slide-up 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HardDrive size={20} style={{ color: '#00B0BD' }} />
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Google Drive</h2>
              <p style={{ fontSize: '12px', color: '#7A9CAE', margin: 0 }}>Select files to process</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7A9CAE', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {!authed ? (
          /* Auth Screen */
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <HardDrive size={48} style={{ color: '#7A9CAE', margin: '0 auto 16px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '8px' }}>Connect your Google Drive</p>
            <p style={{ fontSize: '12px', color: '#7A9CAE', marginBottom: '24px' }}>
              Grant read-only access to browse and select files for processing.
            </p>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#E91E63' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}
            <button onClick={authenticate} disabled={authLoading} className="indra-btn-cyan" style={{ gap: '8px' }}>
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : <HardDrive size={16} />}
              {authLoading ? 'Connecting...' : 'Connect Google Drive'}
            </button>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 24px 12px', fontSize: '12px', color: '#7A9CAE' }}>
              {folderStack.length > 1 && (
                <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00B0BD', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                  <ArrowLeft size={14} />
                </button>
              )}
              {folderStack.map((f, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {i > 0 && <ChevronRight size={12} />}
                  <span style={{ color: i === folderStack.length - 1 ? '#FFFFFF' : '#7A9CAE' }}>{f.name}</span>
                </span>
              ))}
            </div>

            {/* File List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', marginBottom: '8px', fontSize: '13px', color: '#E91E63', background: 'rgba(233,30,99,0.1)' }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: '#00B0BD' }} />
                </div>
              ) : files.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#7A9CAE' }}>
                  <p style={{ fontSize: '14px' }}>This folder is empty</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {files.map(file => (
                    <div
                      key={file.id}
                      onClick={() => file.isFolder ? navigateFolder(file) : toggleSelect(file.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px', cursor: 'pointer',
                        background: selected.has(file.id) ? 'rgba(0,176,189,0.08)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (!selected.has(file.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                      onMouseLeave={e => { if (!selected.has(file.id)) e.currentTarget.style.background = 'transparent' }}
                    >
                      {!file.isFolder && (
                        selected.has(file.id)
                          ? <CheckSquare size={16} style={{ color: '#00B0BD', flexShrink: 0 }} />
                          : <Square size={16} style={{ color: '#7A9CAE', flexShrink: 0 }} />
                      )}
                      {file.isFolder
                        ? <Folder size={16} style={{ color: '#FFC107', flexShrink: 0 }} />
                        : <FileText size={16} style={{ color: '#7A9CAE', flexShrink: 0 }} />
                      }
                      <span style={{ flex: 1, fontSize: '13px', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </span>
                      {file.size && <span style={{ fontSize: '11px', color: '#7A9CAE' }}>{formatSize(file.size)}</span>}
                      {file.isFolder && <ChevronRight size={14} style={{ color: '#7A9CAE' }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={handleDownloadSelected}
                disabled={selectedFileCount === 0 || downloading}
                className="indra-btn-cyan"
                style={{ flex: 1, gap: '8px', opacity: (selectedFileCount === 0 || downloading) ? 0.5 : 1 }}
              >
                {downloading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                {downloading ? 'Downloading...' : `Upload ${selectedFileCount} File${selectedFileCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

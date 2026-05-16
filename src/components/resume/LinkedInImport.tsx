import { useState } from 'react'
import { Linkedin, Globe, Upload, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { scrapeLinkedIn, parseUploadedCV, type ParsedResume } from '@/lib/resumeService'

interface Props {
  onImport: (data: ParsedResume) => void
}

export function LinkedInImport({ onImport }: Props) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPdfFallback, setShowPdfFallback] = useState(false)

  const handleUrlScrape = async () => {
    if (!url.includes('linkedin.com')) {
      setError('Please enter a valid LinkedIn profile URL')
      return
    }
    setLoading(true)
    setError('')

    const result = await scrapeLinkedIn(url)
    setLoading(false)

    if (result.success && result.data) {
      onImport(result.data)
    } else {
      setError(result.error || 'Failed to scrape LinkedIn profile')
      setShowPdfFallback(true)
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')

    const result = await parseUploadedCV(file)
    setLoading(false)

    if (result.success && result.data) {
      result.data.linkedinUrl = url || undefined
      onImport(result.data)
    } else {
      setError(result.error || 'Failed to parse file')
    }
  }

  return (
    <div className="indra-panel" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '36px', height: '36px', background: 'rgba(0,176,189,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
          <Linkedin size={20} style={{ color: '#00B0BD' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>Import from LinkedIn</h3>
          <p style={{ fontSize: '12px', color: '#7A9CAE' }}>Paste your profile URL or upload LinkedIn PDF export</p>
        </div>
      </div>

      {/* URL Input */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7A9CAE' }} />
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/your-profile"
            style={{
              width: '100%', padding: '10px 12px 10px 36px', fontSize: '13px',
              background: '#003E50', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px', color: '#FFFFFF', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#00B0BD'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
        </div>
        <button
          onClick={handleUrlScrape}
          disabled={loading || !url}
          className="indra-btn-cyan"
          style={{ padding: '10px 20px', opacity: loading || !url ? 0.5 : 1 }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Import'}
        </button>
      </div>

      {/* Error with PDF Fallback */}
      {error && (
        <div style={{
          padding: '12px 16px', background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px',
          display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px',
        }}>
          <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '13px', color: '#EF4444', marginBottom: '4px' }}>{error}</p>
            {showPdfFallback && (
              <p style={{ fontSize: '12px', color: '#7A9CAE' }}>
                Tip: Go to LinkedIn &gt; Profile &gt; More &gt; Save to PDF, then upload below.
              </p>
            )}
          </div>
        </div>
      )}

      {/* PDF Upload Fallback */}
      {showPdfFallback && (
        <label style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '16px',
          border: '2px dashed rgba(0,176,189,0.3)', borderRadius: '8px',
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}>
          <Upload size={20} style={{ color: '#00B0BD' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>Upload LinkedIn PDF</p>
            <p style={{ fontSize: '11px', color: '#7A9CAE' }}>PDF, DOCX, TXT, MD, JSON</p>
          </div>
          <input type="file" accept=".pdf,.docx,.txt,.md,.json" style={{ display: 'none' }} onChange={handlePdfUpload} />
        </label>
      )}

      {/* Always show upload option */}
      {!showPdfFallback && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '11px', color: '#7A9CAE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or upload file</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>
      )}
      {!showPdfFallback && (
        <label style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
          border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '8px',
          cursor: 'pointer', marginTop: '12px',
        }}>
          <Upload size={16} style={{ color: '#7A9CAE' }} />
          <span style={{ fontSize: '12px', color: '#7A9CAE' }}>Upload CV (PDF, DOCX, TXT, MD, JSON)</span>
          <input type="file" accept=".pdf,.docx,.txt,.md,.json" style={{ display: 'none' }} onChange={handlePdfUpload} />
        </label>
      )}
    </div>
  )
}

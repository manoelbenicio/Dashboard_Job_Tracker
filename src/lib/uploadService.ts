/**
 * Upload Service — handles file validation, upload to Docling backend,
 * and structured error reporting.
 */

const DOCLING_API = 'http://localhost:8001'

export type UploadErrorType = 'UNSUPPORTED_FORMAT' | 'SIZE_EXCEEDED' | 'PARSE_FAILED' | 'NETWORK_ERROR' | 'SERVER_ERROR'

export interface UploadResult {
  success: boolean
  filename: string
  markdown?: string
  charCount?: number
  error?: string
  errorType?: UploadErrorType
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

const SUPPORTED_EXTENSIONS = new Set([
  '.pdf', '.docx', '.pptx', '.xlsx', '.html', '.htm',
  '.txt', '.md', '.png', '.jpg', '.jpeg', '.tiff', '.tif',
  '.tex', '.qmd', '.rmd', '.wav', '.mp3', '.vtt',
])

/** Validate a file before uploading */
export function validateFile(file: File): { valid: boolean; error?: string; errorType?: UploadErrorType } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 100MB.`, errorType: 'SIZE_EXCEEDED' }
  }

  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Unsupported format: ${ext}. Supported: PDF, DOCX, PPTX, XLSX, HTML, TXT, MD, images.`, errorType: 'UNSUPPORTED_FORMAT' }
  }

  return { valid: true }
}

/** Upload a single file to Docling backend for conversion */
export async function uploadFile(file: File): Promise<UploadResult> {
  const validation = validateFile(file)
  if (!validation.valid) {
    return { success: false, filename: file.name, error: validation.error, errorType: validation.errorType }
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${DOCLING_API}/api/convert`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Server error' }))
      return {
        success: false, filename: file.name,
        error: err.detail || `Server returned ${res.status}`,
        errorType: res.status === 422 ? 'PARSE_FAILED' : 'SERVER_ERROR',
      }
    }

    const result = await res.json()
    return {
      success: true,
      filename: file.name,
      markdown: result.markdown,
      charCount: result.char_count,
    }
  } catch (err) {
    return {
      success: false, filename: file.name,
      error: err instanceof Error ? err.message : 'Network error — is the Docling backend running?',
      errorType: 'NETWORK_ERROR',
    }
  }
}

/** Upload multiple files and report per-file results */
export async function uploadFiles(
  files: File[],
  onProgress?: (completed: number, total: number, result: UploadResult) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i])
    results.push(result)
    onProgress?.(i + 1, files.length, result)
  }
  return results
}

/** Convert a URL via Docling */
export async function convertUrl(url: string): Promise<UploadResult> {
  try {
    const res = await fetch(`${DOCLING_API}/api/convert-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Server error' }))
      return { success: false, filename: url, error: err.detail || `HTTP ${res.status}`, errorType: 'SERVER_ERROR' }
    }

    const result = await res.json()
    return { success: true, filename: url, markdown: result.markdown, charCount: result.char_count }
  } catch (err) {
    return { success: false, filename: url, error: err instanceof Error ? err.message : 'Network error', errorType: 'NETWORK_ERROR' }
  }
}

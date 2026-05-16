/**
 * Google Drive Service — handles OAuth, file browsing, and downloads.
 * Uses Google Identity Services (GIS) for auth and Drive REST API.
 */

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime?: string
  iconLink?: string
  isFolder: boolean
}

let accessToken: string | null = null

/** Get the current access token (from Firebase Google auth) */
export function setDriveAccessToken(token: string) {
  accessToken = token
}

export function getDriveAccessToken(): string | null {
  return accessToken
}

/** Request an additional Drive scope via Google OAuth popup */
export async function requestDriveAccess(): Promise<string> {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      reject(new Error('VITE_GOOGLE_CLIENT_ID not set in environment variables.'))
      return
    }

    // @ts-expect-error — google.accounts loaded via script tag
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response: { access_token?: string; error?: string }) => {
        if (response.error) {
          reject(new Error(response.error))
        } else if (response.access_token) {
          accessToken = response.access_token
          resolve(response.access_token)
        }
      },
    })
    tokenClient.requestAccessToken()
  })
}

/** List files in a Drive folder (or root if no folderId) */
export async function listDriveFiles(folderId?: string): Promise<DriveFile[]> {
  if (!accessToken) throw new Error('Not authenticated with Google Drive')

  const q = folderId
    ? `'${folderId}' in parents and trashed = false`
    : `'root' in parents and trashed = false`

  const params = new URLSearchParams({
    q,
    fields: 'files(id,name,mimeType,size,modifiedTime,iconLink)',
    orderBy: 'folder,name',
    pageSize: '100',
  })

  const res = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    if (res.status === 401) { accessToken = null; throw new Error('Drive session expired. Please re-authenticate.') }
    throw new Error(`Drive API error: ${res.status}`)
  }

  const data = await res.json()
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size,
    modifiedTime: f.modifiedTime,
    iconLink: f.iconLink,
    isFolder: f.mimeType === 'application/vnd.google-apps.folder',
  }))
}

/** Download a file from Drive as a Blob */
export async function downloadDriveFile(fileId: string, fileName: string): Promise<File> {
  if (!accessToken) throw new Error('Not authenticated with Google Drive')

  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) throw new Error(`Failed to download ${fileName}: ${res.status}`)

  const blob = await res.blob()
  return new File([blob], fileName, { type: blob.type })
}

/** List all files in a folder recursively */
export async function listFolderRecursive(folderId: string): Promise<DriveFile[]> {
  const files = await listDriveFiles(folderId)
  const allFiles: DriveFile[] = []

  for (const file of files) {
    if (file.isFolder) {
      const subFiles = await listFolderRecursive(file.id)
      allFiles.push(...subFiles)
    } else {
      allFiles.push(file)
    }
  }

  return allFiles
}

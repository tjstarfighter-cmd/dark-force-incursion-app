import type { SyncAdapter } from './syncAdapter'
import type { SyncManifest } from './syncManifest'
import {
  startAuthFlow,
  handleAuthCallback,
  refreshAccessToken,
  isAuthenticated as checkAuth,
  getAccessToken,
  clearAuth,
} from './googleAuth'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'
const APP_FOLDER = 'appDataFolder'
const MANIFEST_NAME = 'manifest.json'

async function getHeaders(): Promise<HeadersInit> {
  let token = getAccessToken()
  if (!token) {
    const refreshed = await refreshAccessToken()
    if (!refreshed) throw new Error('Not authenticated')
    token = getAccessToken()
  }
  return { Authorization: `Bearer ${token}` }
}

/** Find a file by name in appDataFolder. Returns file ID or null. */
async function findFile(name: string): Promise<string | null> {
  const headers = await getHeaders()
  const q = encodeURIComponent(`name='${name}' and '${APP_FOLDER}' in parents and trashed=false`)
  const res = await fetch(`${DRIVE_API}/files?spaces=${APP_FOLDER}&q=${q}&fields=files(id,name)`, { headers })
  if (!res.ok) return null
  const data = await res.json()
  return data.files?.[0]?.id ?? null
}

/** Read file content by ID. */
async function readFile(fileId: string): Promise<string | null> {
  const headers = await getHeaders()
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, { headers })
  if (!res.ok) return null
  return res.text()
}

/** Create a new file in appDataFolder. */
async function createFile(name: string, content: string): Promise<string> {
  const headers = await getHeaders()
  const metadata = { name, parents: [APP_FOLDER] }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', new Blob([content], { type: 'application/json' }))

  const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: { Authorization: (headers as Record<string, string>).Authorization },
    body: form,
  })
  if (!res.ok) throw new Error(`Create file failed: ${res.status}`)
  const data = await res.json()
  return data.id
}

/** Update an existing file's content. */
async function updateFile(fileId: string, content: string): Promise<void> {
  const headers = await getHeaders()
  const res = await fetch(`${UPLOAD_API}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: (headers as Record<string, string>).Authorization,
      'Content-Type': 'application/json',
    },
    body: content,
  })
  if (!res.ok) throw new Error(`Update file failed: ${res.status}`)
}

/** Write a file (create or update). */
async function writeFile(name: string, content: string): Promise<void> {
  const existingId = await findFile(name)
  if (existingId) {
    await updateFile(existingId, content)
  } else {
    await createFile(name, content)
  }
}

export class GoogleDriveSyncAdapter implements SyncAdapter {
  async authenticate(): Promise<boolean> {
    // Check if we're returning from OAuth redirect
    const handled = await handleAuthCallback()
    if (handled) return true

    // Try refresh token
    if (await refreshAccessToken()) return true

    // Start new auth flow (redirects away)
    await startAuthFlow()
    return false // Won't reach here — page redirects
  }

  isAuthenticated(): boolean {
    return checkAuth()
  }

  async disconnect(): Promise<void> {
    clearAuth()
  }

  async readManifest(): Promise<SyncManifest | null> {
    const fileId = await findFile(MANIFEST_NAME)
    if (!fileId) return null
    const content = await readFile(fileId)
    if (!content) return null
    return JSON.parse(content)
  }

  async writeManifest(manifest: SyncManifest): Promise<void> {
    await writeFile(MANIFEST_NAME, JSON.stringify(manifest))
  }

  async readGameFile(gameId: string): Promise<string | null> {
    const fileId = await findFile(`game-${gameId}.json`)
    if (!fileId) return null
    return readFile(fileId)
  }

  async writeGameFile(gameId: string, data: string): Promise<void> {
    await writeFile(`game-${gameId}.json`, data)
  }

  async listGameFiles(): Promise<string[]> {
    const headers = await getHeaders()
    const q = encodeURIComponent(`name contains 'game-' and '${APP_FOLDER}' in parents and trashed=false`)
    const res = await fetch(`${DRIVE_API}/files?spaces=${APP_FOLDER}&q=${q}&fields=files(name)`, { headers })
    if (!res.ok) return []
    const data = await res.json()
    return (data.files ?? []).map((f: { name: string }) => f.name.replace('game-', '').replace('.json', ''))
  }

  async getLastModified(fileId: string): Promise<number | null> {
    const driveId = await findFile(fileId)
    if (!driveId) return null
    const headers = await getHeaders()
    const res = await fetch(`${DRIVE_API}/files/${driveId}?fields=modifiedTime`, { headers })
    if (!res.ok) return null
    const data = await res.json()
    return data.modifiedTime ? new Date(data.modifiedTime).getTime() : null
  }
}

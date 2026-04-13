export type SyncProvider = 'google-drive' | 'dropbox'

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'disconnected'

export interface SyncConfig {
  provider: SyncProvider | null
  enabled: boolean
  lastSyncedAt: number | null
  folderId: string | null
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  provider: null,
  enabled: false,
  lastSyncedAt: null,
  folderId: null,
}

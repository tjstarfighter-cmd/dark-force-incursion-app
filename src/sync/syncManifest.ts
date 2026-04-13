export interface SyncManifestGame {
  id: string
  mapName: string
  outcome: string
  date: number
  totalTurns: number
  journalCount: number
  lastModified: number
}

export interface SyncManifest {
  schemaVersion: number
  lastUpdated: number
  activeGameId: string | null
  games: SyncManifestGame[]
}

export const CURRENT_SCHEMA_VERSION = 1

export function createEmptyManifest(): SyncManifest {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastUpdated: Date.now(),
    activeGameId: null,
    games: [],
  }
}

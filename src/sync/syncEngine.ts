import type { SyncAdapter } from './syncAdapter'
import type { SyncManifest } from './syncManifest'
import { CURRENT_SCHEMA_VERSION } from './syncManifest'
import { loadArchivedGames, loadArchivedGame, archiveGame } from '../persistence/gameRepository'

let adapter: SyncAdapter | null = null
let syncing = false

export function setSyncAdapter(a: SyncAdapter | null): void {
  adapter = a
}

export function isSyncing(): boolean {
  return syncing
}

/**
 * Sync local archive data to the cloud.
 * Writes a manifest + individual game files.
 * Non-blocking, fire-and-forget safe.
 */
export async function syncToCloud(): Promise<void> {
  if (!adapter || !adapter.isAuthenticated() || syncing) return

  syncing = true
  try {
    const localGames = await loadArchivedGames()

    // Read existing cloud manifest to determine which games need uploading
    const cloudManifest = await adapter.readManifest()
    const cloudIds = new Set(cloudManifest?.games.map(g => g.id) ?? [])

    // Only upload games not already in the cloud
    for (const game of localGames) {
      if (!cloudIds.has(game.id)) {
        const full = await loadArchivedGame(game.id)
        if (full) {
          await adapter.writeGameFile(game.id, JSON.stringify({
            schemaVersion: CURRENT_SCHEMA_VERSION,
            snapshot: full.snapshot,
            turnEntries: full.turnEntries,
            journalEntries: full.journalEntries,
            metadata: full.metadata,
          }))
        }
      }
    }

    // Build and write updated manifest
    const manifest: SyncManifest = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      lastUpdated: Date.now(),
      activeGameId: null,
      games: localGames.map(g => ({
        id: g.id,
        mapName: g.mapName,
        outcome: g.outcome,
        date: g.date,
        totalTurns: g.totalTurns,
        journalCount: g.journalCount,
        lastModified: Date.now(),
      })),
    }
    await adapter.writeManifest(manifest)
  } catch (e) {
    console.warn('Sync to cloud failed:', e)
  } finally {
    syncing = false
  }
}

/**
 * Sync from cloud to local.
 * Reads manifest, downloads missing game files, stores in local IndexedDB.
 */
export async function syncFromCloud(): Promise<void> {
  if (!adapter || !adapter.isAuthenticated() || syncing) return

  syncing = true
  try {
    const manifest = await adapter.readManifest()
    if (!manifest) return

    const localGames = await loadArchivedGames()
    const localIds = new Set(localGames.map(g => g.id))

    // Download games not in local storage
    for (const cloudGame of manifest.games) {
      if (!localIds.has(cloudGame.id)) {
        const content = await adapter.readGameFile(cloudGame.id)
        if (content) {
          try {
            const data = JSON.parse(content)
            // Reconstruct hex Maps from array entries (immutable)
            const snapshot = {
              ...data.snapshot,
              hexes: new Map(data.snapshot.hexes),
            }
            const turnEntries = data.turnEntries.map((entry: any) => ({
              ...entry,
              snapshot: {
                ...entry.snapshot,
                hexes: new Map(entry.snapshot.hexes),
              },
            }))
            await archiveGame(snapshot, turnEntries, data.journalEntries ?? [])
          } catch (e) {
            console.warn(`Failed to import game ${cloudGame.id}:`, e)
          }
        }
      }
    }
  } catch (e) {
    console.warn('Sync from cloud failed:', e)
  } finally {
    syncing = false
  }
}

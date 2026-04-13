import type { SyncAdapter } from './syncAdapter'
import type { SyncManifest } from './syncManifest'

export interface ConflictInfo {
  type: 'manifest' | 'game'
  gameId?: string
  localModified: number
  cloudModified: number
}

/**
 * Detect conflicts between local and cloud data.
 * Conflicts occur when both local and cloud have been modified since last sync.
 * Returns list of conflicts (empty = no conflicts, safe to sync).
 */
export async function detectConflicts(
  adapter: SyncAdapter,
  localManifest: SyncManifest | null,
  lastSyncedAt: number | null,
): Promise<ConflictInfo[]> {
  if (!lastSyncedAt || !localManifest) return []

  const conflicts: ConflictInfo[] = []

  try {
    const cloudManifest = await adapter.readManifest()
    if (!cloudManifest) return [] // No cloud data — no conflict

    // Check if cloud was modified after our last sync
    if (cloudManifest.lastUpdated > lastSyncedAt && localManifest.lastUpdated > lastSyncedAt) {
      // Both modified since last sync — manifest conflict
      conflicts.push({
        type: 'manifest',
        localModified: localManifest.lastUpdated,
        cloudModified: cloudManifest.lastUpdated,
      })
    }
  } catch (e) {
    console.warn('Conflict detection failed:', e)
  }

  return conflicts
}

export type ConflictResolution = 'keep-local' | 'use-cloud'

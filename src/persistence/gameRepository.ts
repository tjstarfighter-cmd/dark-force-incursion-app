import { db } from './db'
import type { GameRecord } from './db'
import type { GameSnapshot } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import type { HexState } from '../types/hex.types'
import type { JournalEntry } from '../types/journal.types'
import type { TurnEntry } from '../engine/turnStack'

/**
 * Serialize a GameSnapshot for IndexedDB storage.
 * Maps can't be stored directly — convert to array entries.
 */
function serializeSnapshot(snapshot: GameSnapshot): string {
  const serializable = {
    ...snapshot,
    hexes: Array.from(snapshot.hexes.entries()),
  }
  return JSON.stringify(serializable)
}

/**
 * Deserialize a GameSnapshot from IndexedDB storage.
 */
function deserializeSnapshot(json: string): GameSnapshot {
  const parsed = JSON.parse(json)
  return {
    ...parsed,
    hexes: new Map<string, HexState>(parsed.hexes),
  }
}

/**
 * Serialize turn stack entries for storage.
 */
function serializeTurnStack(entries: TurnEntry[]): string {
  const serializable = entries.map(entry => ({
    ...entry,
    snapshot: {
      ...entry.snapshot,
      hexes: Array.from(entry.snapshot.hexes.entries()),
    },
  }))
  return JSON.stringify(serializable)
}

/**
 * Deserialize turn stack entries from storage.
 */
function deserializeTurnStack(json: string): TurnEntry[] {
  const parsed = JSON.parse(json)
  return parsed.map((entry: any) => ({
    ...entry,
    snapshot: {
      ...entry.snapshot,
      hexes: new Map<string, HexState>(entry.snapshot.hexes),
    },
  }))
}

const ACTIVE_GAME_ID = 'active'

/**
 * Save the current game state to IndexedDB.
 */
export async function saveGame(snapshot: GameSnapshot, turnEntries: TurnEntry[], journalEntries: JournalEntry[] = []): Promise<void> {
  const record: GameRecord = {
    id: ACTIVE_GAME_ID,
    mapId: snapshot.mapId,
    status: snapshot.status,
    snapshotJson: serializeSnapshot(snapshot),
    turnStackJson: serializeTurnStack(turnEntries),
    journalEntriesJson: JSON.stringify(journalEntries),
    updatedAt: Date.now(),
  }
  await db.games.put(record)
}

/**
 * Load the active game from IndexedDB.
 * Returns null if no active game exists.
 */
export async function loadActiveGame(): Promise<{ snapshot: GameSnapshot; turnEntries: TurnEntry[]; journalEntries: JournalEntry[] } | null> {
  const record = await db.games.get(ACTIVE_GAME_ID)
  if (!record) return null

  // Don't restore completed games as active
  if (record.status !== GameStatus.InProgress) return null

  const snapshot = deserializeSnapshot(record.snapshotJson)
  const turnEntries = deserializeTurnStack(record.turnStackJson)
  const journalEntries: JournalEntry[] = record.journalEntriesJson
    ? JSON.parse(record.journalEntriesJson)
    : []
  return { snapshot, turnEntries, journalEntries }
}

/**
 * Delete the active game from IndexedDB.
 */
export async function deleteActiveGame(): Promise<void> {
  await db.games.delete(ACTIVE_GAME_ID)
}

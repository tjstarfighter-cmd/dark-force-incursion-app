import type { GameSnapshot, GameAction } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import type { MapDefinition } from '../types/map.types'
import type { HexState } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import { TurnStack } from '../engine/turnStack'
import type { TurnEntry } from '../engine/turnStack'
import { resolveAction } from '../engine/ruleEngine'
import { hexToKey } from '../engine/hexMath'
import { saveGame, loadActiveGame, deleteActiveGame } from '../persistence/gameRepository'

let currentGame = $state<GameSnapshot | null>(null)
let turnStack = $state(new TurnStack())
let initialized = $state(false)

export function startGame(mapDef: MapDefinition): void {
  const hexes = new Map<string, HexState>()
  const startKey = hexToKey(mapDef.startingHex)
  hexes.set(startKey, {
    coord: { ...mapDef.startingHex },
    status: HexStatus.Claimed,
    numbers: [1, 2, 3, 4, 5, 6],
  })

  const initialSnapshot: GameSnapshot = {
    mapId: mapDef.id,
    mapDefinition: mapDef,
    hexes,
    turnNumber: 0,
    darkForceTally: 0,
    fortsCaptured: 0,
    totalForts: mapDef.forts.length,
    status: GameStatus.InProgress,
  }

  turnStack = new TurnStack()
  turnStack.push({
    turnNumber: 0,
    action: { type: 'placeHex' },
    snapshot: initialSnapshot,
    journalEntries: [],
  })

  currentGame = initialSnapshot
  initialized = true

  // Auto-save initial state
  autoSave()
}

export function dispatch(action: GameAction): { ok: boolean; reason?: string } {
  if (!currentGame) {
    return { ok: false, reason: 'No active game' }
  }

  const result = resolveAction(currentGame, action)

  if (!result.ok) {
    return { ok: false, reason: result.reason.message }
  }

  turnStack.push({
    turnNumber: result.snapshot.turnNumber,
    action: result.action,
    snapshot: result.snapshot,
    journalEntries: [],
  })

  currentGame = result.snapshot

  // Auto-save after each turn
  autoSave()

  return { ok: true }
}

/**
 * Restore a game from persisted state.
 */
export function restoreGame(snapshot: GameSnapshot, turnEntries: TurnEntry[]): void {
  turnStack = new TurnStack()
  for (const entry of turnEntries) {
    turnStack.push(entry)
  }
  currentGame = snapshot
  initialized = true
}

/**
 * Try to load and restore an active game from IndexedDB.
 * Returns true if a game was restored.
 */
export async function tryResumeGame(): Promise<boolean> {
  try {
    const saved = await loadActiveGame()
    if (saved) {
      restoreGame(saved.snapshot, saved.turnEntries)
      return true
    }
  } catch (e) {
    console.warn('Failed to load saved game:', e)
  }
  initialized = true
  return false
}

function autoSave(): void {
  if (!currentGame) return
  saveGame(currentGame, turnStack.getAll()).catch(e => {
    console.warn('Auto-save failed:', e)
  })
}

export function getCurrentSnapshot(): GameSnapshot | null {
  return currentGame
}

export const gameState = {
  get snapshot() { return currentGame },
  get isInitialized() { return initialized },
}

export function getTurnStack(): TurnStack {
  return turnStack
}

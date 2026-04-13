import type { GameSnapshot, GameAction } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import type { MapDefinition } from '../types/map.types'
import type { HexState } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import type { JournalEntry, JournalScope } from '../types/journal.types'
import { TurnStack } from '../engine/turnStack'
import type { TurnEntry } from '../engine/turnStack'
import { resolveAction } from '../engine/ruleEngine'
import { hexToKey } from '../engine/hexMath'
import { checkWinLoss } from '../engine/winLoss'
import { saveGame, loadActiveGame, deleteActiveGame, archiveGame } from '../persistence/gameRepository'

let currentGame = $state<GameSnapshot | null>(null)
let turnStack = $state(new TurnStack())
let initialized = $state(false)
let journalEntries = $state<JournalEntry[]>([])
let draftText = $state('')

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
  journalEntries = []
  draftText = ''
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

  // Auto-archive if game ended
  if (result.snapshot.status !== GameStatus.InProgress) {
    archiveGame(result.snapshot, turnStack.getAll(), journalEntries).then(() => {
      deleteActiveGame().catch(e => console.warn('Failed to clear active game:', e))
    }).catch(e => console.warn('Auto-archive failed:', e))
  }

  return { ok: true }
}

/**
 * Restore a game from persisted state.
 */
export function restoreGame(snapshot: GameSnapshot, turnEntries: TurnEntry[], savedJournalEntries?: JournalEntry[]): void {
  turnStack = new TurnStack()
  for (const entry of turnEntries) {
    turnStack.push(entry)
  }
  // Re-check win/loss in case game ended while saved
  const status = checkWinLoss(snapshot)
  if (status !== snapshot.status) {
    snapshot = { ...snapshot, status }
  }
  currentGame = snapshot
  journalEntries = savedJournalEntries ?? []
  draftText = ''
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
      restoreGame(saved.snapshot, saved.turnEntries, saved.journalEntries)
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
  saveGame(currentGame, turnStack.getAll(), journalEntries).catch(e => {
    console.warn('Auto-save failed:', e)
  })
}

/**
 * Undo the most recent turn. Returns true if successful.
 * Turn 0 (initial game setup) is never removed.
 */
export function undo(): boolean {
  if (!currentGame || turnStack.getLength() <= 1) return false

  const currentTurn = currentGame.turnNumber
  turnStack.popTo(currentTurn - 1)
  const top = turnStack.peek()
  if (!top) return false

  currentGame = top.snapshot
  autoSave()
  return true
}

/**
 * Rewind to a specific turn number. Returns true if successful.
 */
export function rewindTo(turnNumber: number): boolean {
  if (!currentGame || turnStack.getLength() <= 1) return false

  const top = turnStack.peek()
  if (!top || turnNumber >= top.turnNumber || turnNumber < 0) return false

  turnStack.popTo(turnNumber)
  const newTop = turnStack.peek()
  if (!newTop) return false

  currentGame = newTop.snapshot
  autoSave()
  return true
}

export function getCurrentSnapshot(): GameSnapshot | null {
  return currentGame
}

export const gameState = {
  get snapshot() { return currentGame },
  get isInitialized() { return initialized },
  get canUndo() { return turnStack.getLength() > 1 },
}

export function getTurnStack(): TurnStack {
  return turnStack
}

export function getTurnHistory() {
  return turnStack.getAll()
}

// --- Journal ---

export function addJournalEntry(text: string, scope: JournalScope = 'turn'): void {
  if (!currentGame || !text.trim()) return

  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    turnNumber: currentGame.turnNumber,
    text: text.trim(),
    timestamp: Date.now(),
    scope,
  }

  journalEntries = [...journalEntries, entry]
  draftText = ''
  autoSave()
}

export function getAllJournalEntries(): JournalEntry[] {
  return journalEntries
}

export function getDraftText(): string {
  return draftText
}

export function setDraftText(text: string): void {
  draftText = text
}

export function editJournalEntry(id: string, newText: string): void {
  if (!newText.trim()) return
  journalEntries = journalEntries.map(e =>
    e.id === id ? { ...e, text: newText.trim() } : e
  )
  autoSave()
}

export function deleteJournalEntry(id: string): void {
  journalEntries = journalEntries.filter(e => e.id !== id)
  autoSave()
}

export function setJournalEntries(entries: JournalEntry[]): void {
  journalEntries = entries
}

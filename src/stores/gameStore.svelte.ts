import type { GameSnapshot, GameAction } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import type { MapDefinition } from '../types/map.types'
import type { HexState } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import { TurnStack } from '../engine/turnStack'
import { resolveAction } from '../engine/ruleEngine'
import { hexToKey } from '../engine/hexMath'

let currentGame = $state<GameSnapshot | null>(null)
let turnStack = $state(new TurnStack())

export function startGame(mapDef: MapDefinition): void {
  // Create initial hex states — starting hex is claimed with no numbers
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
  return { ok: true }
}

export function getCurrentSnapshot(): GameSnapshot | null {
  // Return the $state variable directly so Svelte's reactivity tracks it
  // when used inside $derived() in components
  return currentGame
}

// Direct reactive export for component consumption via $derived
export const gameState = {
  get snapshot() { return currentGame },
}

export function getTurnStack(): TurnStack {
  return turnStack
}

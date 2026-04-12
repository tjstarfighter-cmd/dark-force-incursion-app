import type { GameSnapshot, GameAction, TurnResult } from '../types/game.types'
import type { HexState, HexEdge } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import { getNeighborAtEdge, getOppositeEdge, hexToKey } from './hexMath'
import { detectArmies } from './armyDetector'

/**
 * Generate clockwise numbers 1-6 starting with diceValue on the connecting edge.
 */
function generateClockwiseNumbers(diceValue: number, connectingEdge: HexEdge): number[] {
  const numbers = new Array<number>(6)
  for (let i = 0; i < 6; i++) {
    const edge = ((connectingEdge + i) % 6) as HexEdge
    numbers[edge] = ((diceValue - 1 + i) % 6) + 1
  }
  return numbers
}

function fail(code: string, message: string): TurnResult {
  return { ok: false, reason: { code, message } }
}

function resolvePlaceHex(state: GameSnapshot, action: GameAction): TurnResult {
  const { sourceCoord, diceValue } = action

  if (!sourceCoord) return fail('MISSING_SOURCE', 'sourceCoord is required for placeHex')
  if (!diceValue) return fail('MISSING_DICE', 'diceValue is required for placeHex')

  const sourceKey = hexToKey(sourceCoord)
  const sourceHex = state.hexes.get(sourceKey)

  if (!sourceHex || sourceHex.status !== HexStatus.Claimed) {
    return fail('SOURCE_NOT_CLAIMED', `Hex at ${sourceKey} is not a claimed hex`)
  }

  if (!sourceHex.numbers) {
    return fail('NO_NUMBERS', `Hex at ${sourceKey} has no numbers to determine exit direction`)
  }

  // The dice roll determines the exit edge: find which edge on the source hex has the rolled number
  let exitEdge: HexEdge | undefined
  if (action.edge !== undefined && action.edge !== null) {
    // Allow explicit edge override (for testing or future mechanics)
    exitEdge = action.edge
  } else {
    const edgeIndex = sourceHex.numbers.indexOf(diceValue)
    if (edgeIndex === -1) {
      return fail('NUMBER_NOT_FOUND', `Number ${diceValue} not found on hex at ${sourceKey}`)
    }
    exitEdge = edgeIndex as HexEdge
  }

  const targetCoord = getNeighborAtEdge(sourceCoord, exitEdge)
  const targetKey = hexToKey(targetCoord)

  // Check if target is off the map boundary — block source hex
  const mapBounds = new Set(state.mapDefinition.hexes.map(h => hexToKey(h.coord)))
  const isOnMap = mapBounds.has(targetKey)
  if (!isOnMap) {
    const newHexes = new Map(state.hexes)
    const blockedSource: HexState = {
      ...sourceHex,
      status: HexStatus.Blocked,
    }
    newHexes.set(sourceKey, blockedSource)

    const newSnapshot: GameSnapshot = {
      ...state,
      hexes: newHexes,
      turnNumber: state.turnNumber + 1,
    }
    return { ok: true, snapshot: newSnapshot, action }
  }

  if (state.hexes.has(targetKey) && state.hexes.get(targetKey)!.status !== HexStatus.Empty) {
    return fail('TARGET_OCCUPIED', `Hex at ${targetKey} is already occupied`)
  }

  const connectingEdge = getOppositeEdge(exitEdge)
  const numbers = generateClockwiseNumbers(diceValue, connectingEdge)

  const newHexState: HexState = {
    coord: targetCoord,
    status: HexStatus.Claimed,
    numbers,
  }

  // Create new immutable snapshot
  const newHexes = new Map(state.hexes)
  newHexes.set(targetKey, newHexState)

  let newSnapshot: GameSnapshot = {
    ...state,
    hexes: newHexes,
    turnNumber: state.turnNumber + 1,
  }

  // Detect armies across ALL claimed hexes after placement
  const armyUpdates = detectArmies(newSnapshot)
  if (armyUpdates.length > 0) {
    const updatedHexes = new Map(newSnapshot.hexes)
    // Group by hex and merge army edges
    const armiesByHex = new Map<string, number[]>()
    for (const update of armyUpdates) {
      const existing = armiesByHex.get(update.hexKey) ?? []
      if (!existing.includes(update.edgeIndex)) {
        existing.push(update.edgeIndex)
      }
      armiesByHex.set(update.hexKey, existing)
    }
    for (const [hexKey, edges] of armiesByHex) {
      const hex = updatedHexes.get(hexKey)!
      const existingArmies = hex.armies ?? []
      const combined = [...new Set([...existingArmies, ...edges])]
      updatedHexes.set(hexKey, { ...hex, armies: combined })
    }
    newSnapshot = { ...newSnapshot, hexes: updatedHexes }
  }

  return { ok: true, snapshot: newSnapshot, action }
}

/**
 * Pure rule engine entry point.
 * Resolves a game action against the current state, returning a new snapshot or a rule violation.
 * Imports nothing from stores/, components/, persistence/, or sync/.
 */
export function resolveAction(state: GameSnapshot, action: GameAction): TurnResult {
  switch (action.type) {
    case 'placeHex':
      return resolvePlaceHex(state, action)
    default:
      return fail('UNKNOWN_ACTION', `Unknown action type: ${action.type}`)
  }
}

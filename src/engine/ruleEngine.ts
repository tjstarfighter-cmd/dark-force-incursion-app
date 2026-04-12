import type { GameSnapshot, GameAction, TurnResult } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import type { HexCoord, HexState, HexEdge } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import { getNeighborAtEdge, getOppositeEdge, hexToKey } from './hexMath'
import { detectArmies } from './armyDetector'
import { checkDarkForceSpawn, resolveDarkForceEscalation } from './darkForce'
import { isTargetMountain } from './terrain/mountain'
import { countFortStatus } from './fortResolver'
import { checkWinLoss } from './winLoss'

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

/**
 * Find the next clockwise available position from a source hex, starting after exitEdge.
 */
function findNextClockwisePosition(
  sourceCoord: HexCoord,
  exitEdge: HexEdge,
  state: GameSnapshot,
  mapBounds: Set<string>,
): { edge: HexEdge; coord: HexCoord } | null {
  for (let offset = 1; offset < 6; offset++) {
    const candidateEdge = ((exitEdge + offset) % 6) as HexEdge
    const candidateCoord = getNeighborAtEdge(sourceCoord, candidateEdge)
    const candidateKey = hexToKey(candidateCoord)
    if (!mapBounds.has(candidateKey)) continue
    // Skip mountain hexes — can't place on mountains
    if (isTargetMountain(state.mapDefinition, candidateCoord)) continue
    const existing = state.hexes.get(candidateKey)
    if (!existing || existing.status === HexStatus.Empty) {
      return { edge: candidateEdge, coord: candidateCoord }
    }
  }
  return null
}

/**
 * Apply army detection to the snapshot, merging results into hex states.
 */
function applyArmyDetection(snapshot: GameSnapshot): GameSnapshot {
  const armyUpdates = detectArmies(snapshot)
  if (armyUpdates.length === 0) return snapshot

  const updatedHexes = new Map(snapshot.hexes)
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
  return { ...snapshot, hexes: updatedHexes }
}

/**
 * Check and apply Dark Force spawning at the exit edge.
 */
function applyDarkForce(snapshot: GameSnapshot, sourceCoord: HexCoord, exitEdge: HexEdge): GameSnapshot {
  const dfUpdates = checkDarkForceSpawn(snapshot, sourceCoord, exitEdge)
  if (dfUpdates.length === 0) return snapshot

  const updatedHexes = new Map(snapshot.hexes)
  let dfCount = 0
  const dfByHex = new Map<string, number[]>()
  for (const update of dfUpdates) {
    const existing = dfByHex.get(update.hexKey) ?? []
    if (!existing.includes(update.edgeIndex)) {
      existing.push(update.edgeIndex)
    }
    dfByHex.set(update.hexKey, existing)
  }
  for (const [hexKey, edges] of dfByHex) {
    const hex = updatedHexes.get(hexKey)!
    const existingDF = hex.darkForce ?? []
    const newEdges = edges.filter(e => !existingDF.includes(e))
    if (newEdges.length > 0) {
      updatedHexes.set(hexKey, { ...hex, darkForce: [...existingDF, ...newEdges] })
      dfCount += newEdges.length
    }
  }
  // Each dark force pair is 2 entries (both sides), count as 1 army
  const armiesSpawned = Math.floor(dfCount / 2)
  return {
    ...snapshot,
    hexes: updatedHexes,
    darkForceTally: snapshot.darkForceTally + armiesSpawned,
  }
}

/**
 * Apply win/loss check to a snapshot before returning it.
 */
function applyWinLossCheck(snapshot: GameSnapshot): GameSnapshot {
  const status = checkWinLoss(snapshot)
  if (status !== snapshot.status) {
    return { ...snapshot, status }
  }
  return snapshot
}

function resolvePlaceHex(state: GameSnapshot, action: GameAction): TurnResult {
  const { sourceCoord, diceValue } = action

  if (!sourceCoord) return fail('MISSING_SOURCE', 'sourceCoord is required for placeHex')
  if (!diceValue) return fail('MISSING_DICE', 'diceValue is required for placeHex')

  const sourceKey = hexToKey(sourceCoord)
  const sourceHex = state.hexes.get(sourceKey)

  if (state.status !== GameStatus.InProgress) {
    return fail('GAME_OVER', 'Game has ended')
  }

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

  // Check for Dark Force escalation BEFORE attempting placement
  // If exit edge already has a DF army, escalation triggers instead of normal placement
  const escalation = resolveDarkForceEscalation(state, sourceCoord, exitEdge)
  if (escalation) {
    return { ok: true, snapshot: applyWinLossCheck(escalation.snapshot), action }
  }

  const targetCoord = getNeighborAtEdge(sourceCoord, exitEdge)
  const targetKey = hexToKey(targetCoord)

  // Check if target is off the map boundary or a mountain — block source hex
  const mapBounds = new Set(state.mapDefinition.hexes.map(h => hexToKey(h.coord)))
  const isOnMap = mapBounds.has(targetKey)
  const isMountain = isOnMap && isTargetMountain(state.mapDefinition, targetCoord)
  if (!isOnMap || isMountain) {
    const newHexes = new Map(state.hexes)
    const blockedSource: HexState = {
      ...sourceHex,
      status: HexStatus.Blocked,
    }
    newHexes.set(sourceKey, blockedSource)

    const fortSt = countFortStatus({ ...state, hexes: newHexes })
    const newSnapshot: GameSnapshot = {
      ...state,
      hexes: newHexes,
      turnNumber: state.turnNumber + 1,
      fortsCaptured: fortSt.captured,
    }
    return { ok: true, snapshot: applyWinLossCheck(newSnapshot), action }
  }

  const targetOccupied = state.hexes.has(targetKey) && state.hexes.get(targetKey)!.status !== HexStatus.Empty

  if (targetOccupied) {
    // Blocked hex: place at next clockwise available position from source
    const clockwiseResult = findNextClockwisePosition(sourceCoord, exitEdge, state, mapBounds)
    if (!clockwiseResult) {
      // All positions occupied or off-map — block the source hex (trapped)
      const newHexes = new Map(state.hexes)
      newHexes.set(sourceKey, { ...sourceHex, status: HexStatus.Blocked })
      return { ok: true, snapshot: applyWinLossCheck({ ...state, hexes: newHexes, turnNumber: state.turnNumber + 1 }), action }
    }

    const blockedConnectingEdge = getOppositeEdge(clockwiseResult.edge)
    const blockedNumbers = generateClockwiseNumbers(diceValue, blockedConnectingEdge)
    const blockedHex: HexState = {
      coord: clockwiseResult.coord,
      status: HexStatus.Blocked,
      numbers: blockedNumbers,
    }

    const newHexes = new Map(state.hexes)
    newHexes.set(hexToKey(clockwiseResult.coord), blockedHex)

    let newSnapshot: GameSnapshot = {
      ...state,
      hexes: newHexes,
      turnNumber: state.turnNumber + 1,
    }

    // Check for dark force at the exit edge (source hex, where we rolled from)
    newSnapshot = applyDarkForce(newSnapshot, sourceCoord, exitEdge)

    // Update fort status
    const blockedFortSt = countFortStatus(newSnapshot)
    newSnapshot = { ...newSnapshot, fortsCaptured: blockedFortSt.captured }

    return { ok: true, snapshot: applyWinLossCheck(newSnapshot), action }
  }

  // Normal placement — target is available
  const connectingEdge = getOppositeEdge(exitEdge)
  const numbers = generateClockwiseNumbers(diceValue, connectingEdge)

  const newHexState: HexState = {
    coord: targetCoord,
    status: HexStatus.Claimed,
    numbers,
  }

  const newHexes = new Map(state.hexes)
  newHexes.set(targetKey, newHexState)

  let newSnapshot: GameSnapshot = {
    ...state,
    hexes: newHexes,
    turnNumber: state.turnNumber + 1,
  }

  // Detect armies across ALL claimed hexes after placement
  newSnapshot = applyArmyDetection(newSnapshot)

  // Check for dark force at the exit edge
  newSnapshot = applyDarkForce(newSnapshot, sourceCoord, exitEdge)

  // Update fort capture count
  const fortStatus = countFortStatus(newSnapshot)
  newSnapshot = { ...newSnapshot, fortsCaptured: fortStatus.captured }

  return { ok: true, snapshot: applyWinLossCheck(newSnapshot), action }
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

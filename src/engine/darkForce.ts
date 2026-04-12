import type { GameSnapshot } from '../types/game.types'
import type { HexCoord, HexState, HexEdge } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import { TerrainType } from '../types/terrain.types'
import { getNeighborAtEdge, getOppositeEdge, hexToKey } from './hexMath'

export interface DarkForceUpdate {
  hexKey: string
  edgeIndex: number
}

/**
 * Check if a Dark Force army should spawn at the exit edge.
 * Dark Force spawns when the rolled number on the source hex's exit edge
 * does NOT match the adjacent neighbor's number on the shared edge,
 * AND no army or dark force already exists at those edges.
 *
 * Called AFTER hex placement and army detection.
 */
export function checkDarkForceSpawn(
  snapshot: GameSnapshot,
  sourceCoord: HexCoord,
  exitEdge: HexEdge,
): DarkForceUpdate[] {
  const sourceKey = hexToKey(sourceCoord)
  const sourceHex = snapshot.hexes.get(sourceKey)
  if (!sourceHex || !sourceHex.numbers) return []

  const neighborCoord = getNeighborAtEdge(sourceCoord, exitEdge)
  const neighborKey = hexToKey(neighborCoord)
  const neighborHex = snapshot.hexes.get(neighborKey)

  // Neighbor must be claimed with numbers
  if (!neighborHex || neighborHex.status !== HexStatus.Claimed || !neighborHex.numbers) return []

  const sourceNumber = sourceHex.numbers[exitEdge]
  const neighborEdge = getOppositeEdge(exitEdge)
  const neighborNumber = neighborHex.numbers[neighborEdge]

  // If numbers match, that's an army (already handled) — no dark force
  if (sourceNumber === neighborNumber) return []

  // Check if army or dark force already exists at these edges
  const sourceHasArmy = sourceHex.armies?.includes(exitEdge) ?? false
  const sourceHasDarkForce = sourceHex.darkForce?.includes(exitEdge) ?? false
  const neighborHasArmy = neighborHex.armies?.includes(neighborEdge) ?? false
  const neighborHasDarkForce = neighborHex.darkForce?.includes(neighborEdge) ?? false

  if (sourceHasArmy || sourceHasDarkForce || neighborHasArmy || neighborHasDarkForce) return []

  // Non-matching, no existing markers — spawn Dark Force
  return [
    { hexKey: sourceKey, edgeIndex: exitEdge },
    { hexKey: neighborKey, edgeIndex: neighborEdge },
  ]
}

export interface EscalationResult {
  snapshot: GameSnapshot
  armiesDefeated: number
  hexesBlocked: number
  darkForceSpawned: number
}

/**
 * Resolve Dark Force escalation when rolling a number that already has
 * a Dark Force army on the source hex's exit edge.
 *
 * Returns null if no escalation needed (no DF at exit edge).
 *
 * Escalation rules (from rulebook p.5-6):
 * 1. Move clockwise from exit edge on the source hex
 * 2. If a friendly army is found at an edge, defeat it (convert to DF)
 * 3. If no friendly army, find next free hex clockwise, block it + place DF
 */
export function resolveDarkForceEscalation(
  snapshot: GameSnapshot,
  sourceCoord: HexCoord,
  exitEdge: HexEdge,
): EscalationResult | null {
  const sourceKey = hexToKey(sourceCoord)
  const sourceHex = snapshot.hexes.get(sourceKey)
  if (!sourceHex) return null

  // Check if exit edge has an existing Dark Force army
  if (!sourceHex.darkForce?.includes(exitEdge)) return null

  const newHexes = new Map(snapshot.hexes)
  let armiesDefeated = 0
  let hexesBlocked = 0
  let darkForceSpawned = 0

  // Move clockwise from exit edge, look for a friendly army to defeat
  let armyFound = false
  for (let offset = 1; offset < 6; offset++) {
    const checkEdge = ((exitEdge + offset) % 6) as HexEdge
    const currentSource = newHexes.get(sourceKey)!

    if (currentSource.armies?.includes(checkEdge)) {
      // Defeat this army — remove army, add dark force
      const updatedArmies = currentSource.armies.filter(a => a !== checkEdge)
      const updatedDF = [...(currentSource.darkForce ?? []), checkEdge]
      newHexes.set(sourceKey, { ...currentSource, armies: updatedArmies, darkForce: updatedDF })

      // Also update the neighbor's side
      const neighborCoord = getNeighborAtEdge(sourceCoord, checkEdge)
      const neighborKey = hexToKey(neighborCoord)
      const neighborHex = newHexes.get(neighborKey)
      if (neighborHex) {
        const neighborEdge = getOppositeEdge(checkEdge)
        const nArmies = neighborHex.armies?.filter(a => a !== neighborEdge) ?? []
        const nDF = [...(neighborHex.darkForce ?? []), neighborEdge]
        newHexes.set(neighborKey, { ...neighborHex, armies: nArmies, darkForce: nDF })
      }

      armiesDefeated++
      darkForceSpawned++
      armyFound = true
      break
    }
  }

  if (!armyFound) {
    // No friendly army — block next free hex clockwise + place DF
    const mapBounds = new Set(snapshot.mapDefinition.hexes.map(h => hexToKey(h.coord)))

    for (let offset = 1; offset < 6; offset++) {
      const candidateEdge = ((exitEdge + offset) % 6) as HexEdge
      const candidateCoord = getNeighborAtEdge(sourceCoord, candidateEdge)
      const candidateKey = hexToKey(candidateCoord)

      if (!mapBounds.has(candidateKey)) continue
      // Skip mountain hexes
      const mapHex = snapshot.mapDefinition.hexes.find(
        h => h.coord.q === candidateCoord.q && h.coord.r === candidateCoord.r
      )
      if (mapHex?.terrain === TerrainType.Mountain) continue
      const existing = newHexes.get(candidateKey)
      if (existing && existing.status !== HexStatus.Empty) continue

      // Block this hex
      const connectingEdge = getOppositeEdge(candidateEdge)
      const diceValue = sourceHex.numbers?.[candidateEdge] ?? 1
      const numbers = new Array(6)
      for (let i = 0; i < 6; i++) {
        const edge = ((connectingEdge + i) % 6) as HexEdge
        numbers[edge] = ((diceValue - 1 + i) % 6) + 1
      }

      const blockedHex: HexState = {
        coord: candidateCoord,
        status: HexStatus.Blocked,
        numbers,
        darkForce: [connectingEdge],
      }
      newHexes.set(candidateKey, blockedHex)

      // Also add DF on the source hex at this edge
      const currentSource = newHexes.get(sourceKey)!
      const updatedDF = [...(currentSource.darkForce ?? []), candidateEdge]
      newHexes.set(sourceKey, { ...currentSource, darkForce: updatedDF })

      hexesBlocked++
      darkForceSpawned++
      break
    }
  }

  return {
    snapshot: {
      ...snapshot,
      hexes: newHexes,
      darkForceTally: snapshot.darkForceTally + darkForceSpawned,
      turnNumber: snapshot.turnNumber + 1,
    },
    armiesDefeated,
    hexesBlocked,
    darkForceSpawned,
  }
}

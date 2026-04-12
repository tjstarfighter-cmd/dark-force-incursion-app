import type { GameSnapshot } from '../types/game.types'
import type { HexEdge } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import { getNeighbors, hexToKey, getOppositeEdge } from './hexMath'

export interface ArmyUpdate {
  hexKey: string
  edgeIndex: number
}

/**
 * Scan all claimed hex pairs for matching adjacent numbers.
 * Returns a list of army placements (both sides of each match).
 * Pure function — no side effects.
 */
export function detectArmies(snapshot: GameSnapshot): ArmyUpdate[] {
  const armies: ArmyUpdate[] = []
  const processed = new Set<string>()

  for (const [key, hex] of snapshot.hexes) {
    if (hex.status !== HexStatus.Claimed || !hex.numbers) continue

    const neighbors = getNeighbors(hex.coord)
    for (let edge = 0; edge < 6; edge++) {
      const neighborKey = hexToKey(neighbors[edge])

      // Avoid processing the same pair twice (two hexes share exactly one edge)
      const pairKey = key < neighborKey ? `${key}|${neighborKey}` : `${neighborKey}|${key}`
      if (processed.has(pairKey)) continue
      processed.add(pairKey)

      const neighbor = snapshot.hexes.get(neighborKey)
      if (!neighbor || neighbor.status !== HexStatus.Claimed || !neighbor.numbers) continue

      const myNumber = hex.numbers[edge]
      const theirEdge = getOppositeEdge(edge as HexEdge)
      const theirNumber = neighbor.numbers[theirEdge]

      if (myNumber === theirNumber) {
        armies.push({ hexKey: key, edgeIndex: edge })
        armies.push({ hexKey: neighborKey, edgeIndex: theirEdge })
      }
    }
  }

  return armies
}

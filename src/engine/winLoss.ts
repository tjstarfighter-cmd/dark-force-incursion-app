import type { GameSnapshot } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import type { HexEdge } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import { hexToKey, getNeighborAtEdge } from './hexMath'
import { isTargetMountain } from './terrain/mountain'

/**
 * Check win/loss conditions after a turn resolves.
 *
 * Win: captured more than half the forts
 * Loss: Dark Force tally >= limit, OR all uncaptured forts are blocked
 * Win takes priority if both conditions somehow met.
 */
export function checkWinLoss(snapshot: GameSnapshot): GameStatus {
  const { fortsCaptured, totalForts, darkForceTally, mapDefinition } = snapshot

  // Win: more than half the forts captured
  if (fortsCaptured > totalForts / 2) {
    return GameStatus.PlayerWon
  }

  // Loss: Dark Force tally reached limit
  if (darkForceTally >= mapDefinition.darkForceLimit) {
    return GameStatus.DarkForceWon
  }

  // Loss: all uncaptured forts blocked (can't reach them)
  const uncapturedForts = mapDefinition.forts.filter(fort => {
    const key = hexToKey(fort.coord)
    const hexState = snapshot.hexes.get(key)
    if (hexState?.armies && hexState.armies.length > 0) return false
    return true
  })

  if (uncapturedForts.length > 0) {
    const allBlocked = uncapturedForts.every(fort => {
      const key = hexToKey(fort.coord)
      const hexState = snapshot.hexes.get(key)
      return hexState?.status === HexStatus.Blocked
    })

    const fortsNeeded = Math.floor(totalForts / 2) + 1 - fortsCaptured
    if (allBlocked && fortsNeeded > 0) {
      return GameStatus.DarkForceWon
    }
  }

  // Loss: no claimed hex can produce new territory (completely surrounded)
  if (snapshot.turnNumber > 0) {
    let canExpand = false
    const mapBounds = new Set(snapshot.mapDefinition.hexes.map(h => hexToKey(h.coord)))

    for (const [_, hexState] of snapshot.hexes) {
      if (hexState.status !== HexStatus.Claimed) continue

      // Check if any of the 6 neighbors is an empty, non-mountain, on-map position
      for (let edge = 0; edge < 6; edge++) {
        const neighbor = getNeighborAtEdge(hexState.coord, edge as HexEdge)
        const neighborKey = hexToKey(neighbor)
        if (!mapBounds.has(neighborKey)) continue
        if (isTargetMountain(snapshot.mapDefinition, neighbor)) continue
        const neighborState = snapshot.hexes.get(neighborKey)
        if (!neighborState || neighborState.status === HexStatus.Empty) {
          canExpand = true
          break
        }
      }
      if (canExpand) break
    }

    if (!canExpand) {
      return GameStatus.DarkForceWon
    }
  }

  return GameStatus.InProgress
}

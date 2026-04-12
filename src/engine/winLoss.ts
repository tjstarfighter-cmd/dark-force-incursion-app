import type { GameSnapshot } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import { HexStatus } from '../types/hex.types'
import { hexToKey } from './hexMath'

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
    // Fort is uncaptured if it has no army
    if (hexState?.armies && hexState.armies.length > 0) return false
    return true
  })

  if (uncapturedForts.length > 0) {
    const allBlocked = uncapturedForts.every(fort => {
      const key = hexToKey(fort.coord)
      const hexState = snapshot.hexes.get(key)
      return hexState?.status === HexStatus.Blocked
    })

    // Only lose if ALL remaining needed forts are blocked
    // Player needs more than totalForts/2 - fortsCaptured more forts
    const fortsNeeded = Math.floor(totalForts / 2) + 1 - fortsCaptured
    if (allBlocked && fortsNeeded > 0) {
      return GameStatus.DarkForceWon
    }
  }

  return GameStatus.InProgress
}

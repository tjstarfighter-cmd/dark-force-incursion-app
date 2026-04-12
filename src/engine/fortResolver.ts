import type { GameSnapshot } from '../types/game.types'
import { HexStatus } from '../types/hex.types'
import { hexToKey } from './hexMath'

export interface FortStatus {
  captured: number
  lost: number
}

/**
 * Count captured and lost forts from the current snapshot.
 * - Captured: fort hex is Claimed AND has at least one army (even with DF present)
 * - Captured forts stay captured even if later blocked
 * - Lost: fort hex is Blocked AND was never captured (no army)
 */
export function countFortStatus(snapshot: GameSnapshot): FortStatus {
  let captured = 0
  let lost = 0

  for (const fort of snapshot.mapDefinition.forts) {
    const key = hexToKey(fort.coord)
    const hexState = snapshot.hexes.get(key)

    if (!hexState) continue // not yet interacted with

    if (hexState.armies && hexState.armies.length > 0) {
      // Has an army → captured (even if blocked or has DF)
      captured++
    } else if (hexState.status === HexStatus.Blocked) {
      // Blocked without army → lost
      lost++
    }
  }

  return { captured, lost }
}

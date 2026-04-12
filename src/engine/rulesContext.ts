import type { GameSnapshot } from '../types/game.types'
import { HexStatus } from '../types/hex.types'

/**
 * Compare two snapshots and return rule IDs relevant to what changed.
 * Pure function — no side effects, no store access.
 */
export function detectContextualRules(
  current: GameSnapshot,
  previous: GameSnapshot | null,
): string[] {
  if (!previous) {
    return ['hex-placement']
  }

  const rules: string[] = []

  // Dark Force tally increased → DF rules
  if (current.darkForceTally > previous.darkForceTally) {
    rules.push('df-spawning')
    // Check if escalation happened (tally increased by more than 1)
    if (current.darkForceTally - previous.darkForceTally > 1) {
      rules.push('df-escalation')
    }
  }

  // Check for new armies
  let newArmies = false
  for (const [key, hex] of current.hexes) {
    const prevHex = previous.hexes.get(key)
    const prevArmyCount = prevHex?.armies?.length ?? 0
    const curArmyCount = hex.armies?.length ?? 0
    if (curArmyCount > prevArmyCount) {
      newArmies = true
      break
    }
  }
  if (newArmies) {
    rules.push('army-matching')
  }

  // Check for newly blocked hexes
  let sourceBlocked = false
  let hexBlocked = false
  for (const [key, hex] of current.hexes) {
    const prevHex = previous.hexes.get(key)
    if (hex.status === HexStatus.Blocked) {
      if (prevHex && prevHex.status !== HexStatus.Blocked) {
        // Previously existed but now blocked → source was blocked
        sourceBlocked = true
      } else if (!prevHex) {
        // Newly placed as blocked → clockwise placement blocked
        hexBlocked = true
      }
    }
  }

  if (sourceBlocked) {
    // Source blocked could be mountain or off-map
    rules.push('mountain-block')
    rules.push('blocking')
  } else if (hexBlocked) {
    rules.push('blocking')
  }

  // New claimed hex placed (normal placement)
  for (const [key, hex] of current.hexes) {
    if (hex.status === HexStatus.Claimed && !previous.hexes.has(key)) {
      rules.push('hex-placement')
      break
    }
  }

  // Fort capture changed
  if (current.fortsCaptured > previous.fortsCaptured) {
    rules.push('fort-capture')
  }

  // Dark Force limit reached
  if (
    current.darkForceTally >= current.mapDefinition.darkForceLimit &&
    previous.darkForceTally < previous.mapDefinition.darkForceLimit
  ) {
    rules.push('df-limit')
  }

  // Default if nothing specific detected
  if (rules.length === 0) {
    rules.push('hex-placement')
  }

  return rules
}

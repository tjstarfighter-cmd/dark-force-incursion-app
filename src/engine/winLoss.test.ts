import { describe, it, expect } from 'vitest'
import { checkWinLoss } from './winLoss'
import type { GameSnapshot } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import { HexStatus } from '../types/hex.types'
import { hexToKey } from './hexMath'

function makeSnapshot(overrides: Partial<GameSnapshot> = {}): GameSnapshot {
  return {
    mapId: 'test',
    mapDefinition: {
      id: 'test', name: 'Test', description: '', schemaVersion: 1,
      gridWidth: 10, gridHeight: 10, hexes: [], forts: [
        { coord: { q: 1, r: 1 } },
        { coord: { q: 2, r: 2 } },
        { coord: { q: 3, r: 3 } },
        { coord: { q: 4, r: 4 } },
        { coord: { q: 5, r: 5 } },
        { coord: { q: 6, r: 6 } },
        { coord: { q: 7, r: 7 } },
      ],
      startingHex: { q: 0, r: 0 }, darkForceLimit: 25, orientation: 'flat-top' as const,
    },
    hexes: new Map(),
    turnNumber: 10,
    darkForceTally: 0,
    fortsCaptured: 0,
    totalForts: 7,
    status: GameStatus.InProgress,
    ...overrides,
  }
}

describe('checkWinLoss', () => {
  it('returns InProgress when game is ongoing', () => {
    const snapshot = makeSnapshot({ fortsCaptured: 2, darkForceTally: 5 })
    expect(checkWinLoss(snapshot)).toBe(GameStatus.InProgress)
  })

  it('returns PlayerWon when more than half forts captured (4 of 7)', () => {
    const snapshot = makeSnapshot({ fortsCaptured: 4 })
    expect(checkWinLoss(snapshot)).toBe(GameStatus.PlayerWon)
  })

  it('returns InProgress when exactly half forts captured (3 of 7 — not enough)', () => {
    const snapshot = makeSnapshot({ fortsCaptured: 3 })
    expect(checkWinLoss(snapshot)).toBe(GameStatus.InProgress)
  })

  it('returns DarkForceWon when tally reaches limit', () => {
    const snapshot = makeSnapshot({ darkForceTally: 25 })
    expect(checkWinLoss(snapshot)).toBe(GameStatus.DarkForceWon)
  })

  it('returns InProgress when tally is below limit', () => {
    const snapshot = makeSnapshot({ darkForceTally: 24 })
    expect(checkWinLoss(snapshot)).toBe(GameStatus.InProgress)
  })

  it('returns DarkForceWon when all uncaptured forts are blocked', () => {
    const hexes = new Map()
    // All 7 forts blocked, none captured
    for (let i = 1; i <= 7; i++) {
      hexes.set(hexToKey({ q: i, r: i }), {
        coord: { q: i, r: i },
        status: HexStatus.Blocked,
        numbers: [1, 2, 3, 4, 5, 6],
      })
    }
    const snapshot = makeSnapshot({ hexes, fortsCaptured: 0 })
    expect(checkWinLoss(snapshot)).toBe(GameStatus.DarkForceWon)
  })

  it('does not lose when some forts are still reachable', () => {
    const hexes = new Map()
    // 3 forts blocked, 4 still unclaimed (reachable)
    for (let i = 1; i <= 3; i++) {
      hexes.set(hexToKey({ q: i, r: i }), {
        coord: { q: i, r: i },
        status: HexStatus.Blocked,
        numbers: [1, 2, 3, 4, 5, 6],
      })
    }
    const snapshot = makeSnapshot({ hexes, fortsCaptured: 0 })
    expect(checkWinLoss(snapshot)).toBe(GameStatus.InProgress)
  })

  it('win takes priority over loss (if somehow both conditions met)', () => {
    const snapshot = makeSnapshot({ fortsCaptured: 4, darkForceTally: 25 })
    expect(checkWinLoss(snapshot)).toBe(GameStatus.PlayerWon)
  })
})

import { describe, it, expect } from 'vitest'
import { countFortStatus } from './fortResolver'
import type { GameSnapshot } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import type { HexState } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import { hexToKey } from './hexMath'

function makeSnapshot(hexEntries: Array<[string, HexState]>, forts: Array<{ q: number; r: number }>): GameSnapshot {
  return {
    mapId: 'test',
    mapDefinition: {
      id: 'test', name: 'Test', description: '', schemaVersion: 1,
      gridWidth: 10, gridHeight: 10,
      hexes: [],
      forts: forts.map(f => ({ coord: f })),
      startingHex: { q: 0, r: 0 }, darkForceLimit: 25, orientation: 'flat-top' as const,
    },
    hexes: new Map(hexEntries),
    turnNumber: 1,
    darkForceTally: 0,
    fortsCaptured: 0,
    totalForts: forts.length,
    status: GameStatus.InProgress,
  }
}

describe('countFortStatus', () => {
  it('counts captured fort when hex has army', () => {
    const snapshot = makeSnapshot([
      [hexToKey({ q: 2, r: 3 }), {
        coord: { q: 2, r: 3 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
        armies: [2],
      }],
    ], [{ q: 2, r: 3 }])

    const status = countFortStatus(snapshot)
    expect(status.captured).toBe(1)
    expect(status.lost).toBe(0)
  })

  it('counts lost fort when hex is blocked without army', () => {
    const snapshot = makeSnapshot([
      [hexToKey({ q: 2, r: 3 }), {
        coord: { q: 2, r: 3 },
        status: HexStatus.Blocked,
        numbers: [1, 2, 3, 4, 5, 6],
      }],
    ], [{ q: 2, r: 3 }])

    const status = countFortStatus(snapshot)
    expect(status.captured).toBe(0)
    expect(status.lost).toBe(1)
  })

  it('captured fort stays captured even when blocked', () => {
    const snapshot = makeSnapshot([
      [hexToKey({ q: 2, r: 3 }), {
        coord: { q: 2, r: 3 },
        status: HexStatus.Blocked,
        numbers: [1, 2, 3, 4, 5, 6],
        armies: [2], // has army → captured, even though blocked
      }],
    ], [{ q: 2, r: 3 }])

    const status = countFortStatus(snapshot)
    expect(status.captured).toBe(1)
    expect(status.lost).toBe(0)
  })

  it('fort captured despite Dark Force presence', () => {
    const snapshot = makeSnapshot([
      [hexToKey({ q: 2, r: 3 }), {
        coord: { q: 2, r: 3 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
        armies: [2],
        darkForce: [4],
      }],
    ], [{ q: 2, r: 3 }])

    const status = countFortStatus(snapshot)
    expect(status.captured).toBe(1)
  })

  it('unclaimed fort is neither captured nor lost', () => {
    const snapshot = makeSnapshot([], [{ q: 2, r: 3 }])

    const status = countFortStatus(snapshot)
    expect(status.captured).toBe(0)
    expect(status.lost).toBe(0)
  })
})

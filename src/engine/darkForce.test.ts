import { describe, it, expect } from 'vitest'
import { checkDarkForceSpawn, resolveDarkForceEscalation } from './darkForce'
import type { GameSnapshot } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import type { HexState, HexEdge } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import { hexToKey, getNeighborAtEdge, getOppositeEdge } from './hexMath'

function makeSnapshot(hexEntries: Array<[string, HexState]>): GameSnapshot {
  return {
    mapId: 'test',
    mapDefinition: {
      id: 'test', name: 'Test', description: '', schemaVersion: 1,
      gridWidth: 10, gridHeight: 10, hexes: [], forts: [],
      startingHex: { q: 0, r: 0 }, darkForceLimit: 25, orientation: 'flat-top' as const,
    },
    hexes: new Map(hexEntries),
    turnNumber: 1,
    darkForceTally: 0,
    fortsCaptured: 0,
    totalForts: 0,
    status: GameStatus.InProgress,
  }
}

describe('checkDarkForceSpawn', () => {
  it('spawns dark force when exit edge has non-matching adjacency', () => {
    // Source at (0,0) with numbers [1,2,3,4,5,6]
    // Neighbor at edge 2 (SE) with different number on connecting edge
    const neighborCoord = getNeighborAtEdge({ q: 0, r: 0 }, 2)
    const connectingEdge = getOppositeEdge(2 as HexEdge)
    const neighborNumbers = [1, 2, 3, 4, 5, 6]
    // Source has 3 at edge 2. Make neighbor have something different at connecting edge
    neighborNumbers[connectingEdge] = 1 // doesn't match 3

    const snapshot = makeSnapshot([
      [hexToKey({ q: 0, r: 0 }), {
        coord: { q: 0, r: 0 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
      }],
      [hexToKey(neighborCoord), {
        coord: neighborCoord,
        status: HexStatus.Claimed,
        numbers: neighborNumbers,
      }],
    ])

    const updates = checkDarkForceSpawn(snapshot, { q: 0, r: 0 }, 2 as HexEdge)
    expect(updates.length).toBe(2)
    expect(updates).toContainEqual({ hexKey: '0,0', edgeIndex: 2 })
    expect(updates).toContainEqual({ hexKey: hexToKey(neighborCoord), edgeIndex: connectingEdge })
  })

  it('does not spawn when numbers match (army exists)', () => {
    const neighborCoord = getNeighborAtEdge({ q: 0, r: 0 }, 2)
    const connectingEdge = getOppositeEdge(2 as HexEdge)
    const neighborNumbers = [0, 0, 0, 0, 0, 0]
    neighborNumbers[connectingEdge] = 3 // matches source edge 2 = 3

    const snapshot = makeSnapshot([
      [hexToKey({ q: 0, r: 0 }), {
        coord: { q: 0, r: 0 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
        armies: [2],
      }],
      [hexToKey(neighborCoord), {
        coord: neighborCoord,
        status: HexStatus.Claimed,
        numbers: neighborNumbers,
        armies: [connectingEdge],
      }],
    ])

    const updates = checkDarkForceSpawn(snapshot, { q: 0, r: 0 }, 2 as HexEdge)
    expect(updates.length).toBe(0)
  })

  it('does not spawn when dark force already exists at those edges', () => {
    const neighborCoord = getNeighborAtEdge({ q: 0, r: 0 }, 2)
    const connectingEdge = getOppositeEdge(2 as HexEdge)
    const neighborNumbers = [0, 0, 0, 0, 0, 0]
    neighborNumbers[connectingEdge] = 1 // doesn't match 3

    const snapshot = makeSnapshot([
      [hexToKey({ q: 0, r: 0 }), {
        coord: { q: 0, r: 0 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
        darkForce: [2], // already has dark force
      }],
      [hexToKey(neighborCoord), {
        coord: neighborCoord,
        status: HexStatus.Claimed,
        numbers: neighborNumbers,
        darkForce: [connectingEdge],
      }],
    ])

    const updates = checkDarkForceSpawn(snapshot, { q: 0, r: 0 }, 2 as HexEdge)
    expect(updates.length).toBe(0)
  })

  it('does not spawn when neighbor is blocked', () => {
    const neighborCoord = getNeighborAtEdge({ q: 0, r: 0 }, 2)
    const connectingEdge = getOppositeEdge(2 as HexEdge)
    const neighborNumbers = [0, 0, 0, 0, 0, 0]
    neighborNumbers[connectingEdge] = 1

    const snapshot = makeSnapshot([
      [hexToKey({ q: 0, r: 0 }), {
        coord: { q: 0, r: 0 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
      }],
      [hexToKey(neighborCoord), {
        coord: neighborCoord,
        status: HexStatus.Blocked,
        numbers: neighborNumbers,
      }],
    ])

    const updates = checkDarkForceSpawn(snapshot, { q: 0, r: 0 }, 2 as HexEdge)
    expect(updates.length).toBe(0)
  })

  it('does not spawn when no neighbor exists at exit edge', () => {
    const snapshot = makeSnapshot([
      [hexToKey({ q: 0, r: 0 }), {
        coord: { q: 0, r: 0 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
      }],
    ])

    const updates = checkDarkForceSpawn(snapshot, { q: 0, r: 0 }, 2 as HexEdge)
    expect(updates.length).toBe(0)
  })
})

describe('resolveDarkForceEscalation', () => {
  it('returns null when no Dark Force at exit edge', () => {
    const snapshot = makeSnapshot([
      [hexToKey({ q: 0, r: 0 }), {
        coord: { q: 0, r: 0 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
      }],
    ])

    const result = resolveDarkForceEscalation(snapshot, { q: 0, r: 0 }, 2 as HexEdge)
    expect(result).toBeNull()
  })

  it('defeats a friendly army when escalation triggers', () => {
    // Source hex has DF at edge 2 and army at edge 3
    const neighborCoord3 = getNeighborAtEdge({ q: 0, r: 0 }, 3)
    const connectingEdge3 = getOppositeEdge(3 as HexEdge)

    const snapshot = makeSnapshot([
      [hexToKey({ q: 0, r: 0 }), {
        coord: { q: 0, r: 0 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
        darkForce: [2],
        armies: [3],
      }],
      [hexToKey(neighborCoord3), {
        coord: neighborCoord3,
        status: HexStatus.Claimed,
        numbers: [4, 4, 4, 4, 4, 4],
        armies: [connectingEdge3],
      }],
    ])

    const result = resolveDarkForceEscalation(snapshot, { q: 0, r: 0 }, 2 as HexEdge)
    expect(result).not.toBeNull()
    if (!result) return

    expect(result.armiesDefeated).toBe(1)
    expect(result.darkForceSpawned).toBeGreaterThanOrEqual(1)

    // Source hex should have DF at edge 3 now (army defeated)
    const sourceHex = result.snapshot.hexes.get('0,0')!
    expect(sourceHex.darkForce).toContain(3)
    expect(sourceHex.armies).not.toContain(3)
  })

  it('blocks a free hex when no friendly army to defeat', () => {
    // Source hex has DF at edge 2 but no armies on any edge
    // Edge 3 neighbor position is free (not occupied)
    const mapHexes = []
    for (let q = 0; q <= 3; q++) {
      for (let r = 0; r <= 3; r++) {
        mapHexes.push({ coord: { q, r } })
      }
    }

    const snapshot: GameSnapshot = {
      ...makeSnapshot([
        [hexToKey({ q: 0, r: 0 }), {
          coord: { q: 0, r: 0 },
          status: HexStatus.Claimed,
          numbers: [1, 2, 3, 4, 5, 6],
          darkForce: [2],
        }],
      ]),
      mapDefinition: {
        id: 'test', name: 'Test', description: '', schemaVersion: 1,
        gridWidth: 4, gridHeight: 4, hexes: mapHexes, forts: [],
        startingHex: { q: 0, r: 0 }, darkForceLimit: 25, orientation: 'flat-top' as const,
      },
    }

    const result = resolveDarkForceEscalation(snapshot, { q: 0, r: 0 }, 2 as HexEdge)
    expect(result).not.toBeNull()
    if (!result) return

    expect(result.hexesBlocked).toBe(1)
    expect(result.darkForceSpawned).toBeGreaterThanOrEqual(1)
  })
})

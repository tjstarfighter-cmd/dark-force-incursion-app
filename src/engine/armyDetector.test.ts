import { describe, it, expect } from 'vitest'
import { detectArmies } from './armyDetector'
import type { GameSnapshot } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import type { HexState } from '../types/hex.types'
import { HexStatus } from '../types/hex.types'
import { hexToKey, getNeighborAtEdge, getOppositeEdge } from './hexMath'
import type { HexEdge } from '../types/hex.types'

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

function claimedHex(q: number, r: number, numbers: number[]): [string, HexState] {
  return [hexToKey({ q, r }), {
    coord: { q, r },
    status: HexStatus.Claimed,
    numbers,
  }]
}

describe('detectArmies', () => {
  it('detects a single army when matching numbers are adjacent', () => {
    // Hex at (0,0) has numbers [1,2,3,4,5,6]
    // Hex at neighbor of edge 2 (SE) has numbers where opposite edge matches
    const neighborCoord = getNeighborAtEdge({ q: 0, r: 0 }, 2)
    const connectingEdge = getOppositeEdge(2 as HexEdge)
    // Put matching number 3 (edge 2 of source) at connecting edge of neighbor
    const neighborNumbers = new Array(6).fill(0)
    neighborNumbers[connectingEdge] = 3 // matches source edge 2 = 3
    // Fill rest with non-matching
    for (let i = 0; i < 6; i++) {
      if (i !== connectingEdge) neighborNumbers[i] = i + 1 === 3 ? 9 : i + 1
    }

    const snapshot = makeSnapshot([
      claimedHex(0, 0, [1, 2, 3, 4, 5, 6]),
      [hexToKey(neighborCoord), {
        coord: neighborCoord,
        status: HexStatus.Claimed,
        numbers: neighborNumbers,
      }],
    ])

    const armies = detectArmies(snapshot)
    expect(armies.length).toBe(2) // one for each hex in the pair
    expect(armies).toContainEqual({ hexKey: '0,0', edgeIndex: 2 })
    expect(armies).toContainEqual({ hexKey: hexToKey(neighborCoord), edgeIndex: connectingEdge })
  })

  it('detects no armies when numbers do not match', () => {
    const neighborCoord = getNeighborAtEdge({ q: 0, r: 0 }, 2)
    const connectingEdge = getOppositeEdge(2 as HexEdge)
    const neighborNumbers = [6, 5, 4, 3, 2, 1] // edge 2 of source has 3, connecting edge has different

    const snapshot = makeSnapshot([
      claimedHex(0, 0, [1, 2, 3, 4, 5, 6]),
      [hexToKey(neighborCoord), {
        coord: neighborCoord,
        status: HexStatus.Claimed,
        numbers: neighborNumbers,
      }],
    ])

    // Only count if the specific shared edges match
    const armies = detectArmies(snapshot)
    // Check that none of the armies are for the edge 2 / connectingEdge pair unless they actually match
    const sourceEdge2Match = armies.some(a => a.hexKey === '0,0' && a.edgeIndex === 2)
    // source numbers[2] = 3, neighbor numbers[connectingEdge] — check if they match
    if (3 !== neighborNumbers[connectingEdge]) {
      expect(sourceEdge2Match).toBe(false)
    }
  })

  it('detects multiple armies from a single hex placement', () => {
    // Three hexes in a row, middle hex matches both neighbors
    const snapshot = makeSnapshot([
      claimedHex(0, 0, [1, 2, 3, 4, 5, 6]),
      claimedHex(1, 0, [4, 5, 6, 1, 2, 3]), // edge 5 toward (0,0): number is 3. Source (0,0) edge 2: 3. Match!
      claimedHex(2, 0, [1, 2, 3, 4, 5, 6]),
    ])

    const armies = detectArmies(snapshot)
    // Should find at least the match between (0,0) and (1,0)
    expect(armies.length).toBeGreaterThanOrEqual(2)
  })

  it('does not duplicate existing armies on re-scan', () => {
    const neighborCoord = getNeighborAtEdge({ q: 0, r: 0 }, 2)
    const connectingEdge = getOppositeEdge(2 as HexEdge)
    const neighborNumbers = new Array(6).fill(0)
    neighborNumbers[connectingEdge] = 3
    for (let i = 0; i < 6; i++) {
      if (i !== connectingEdge) neighborNumbers[i] = i + 1 === 3 ? 9 : i + 1
    }

    const snapshot = makeSnapshot([
      ['0,0', {
        coord: { q: 0, r: 0 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
        armies: [2], // Already has army at edge 2
      }],
      [hexToKey(neighborCoord), {
        coord: neighborCoord,
        status: HexStatus.Claimed,
        numbers: neighborNumbers,
        armies: [connectingEdge],
      }],
    ])

    const armies = detectArmies(snapshot)
    // Should still detect the same pairs (detection is stateless)
    const edge2Entries = armies.filter(a => a.hexKey === '0,0' && a.edgeIndex === 2)
    expect(edge2Entries.length).toBe(1) // no duplicates
  })

  it('ignores blocked and empty hexes', () => {
    const neighborCoord = getNeighborAtEdge({ q: 0, r: 0 }, 2)
    const snapshot = makeSnapshot([
      claimedHex(0, 0, [1, 2, 3, 4, 5, 6]),
      [hexToKey(neighborCoord), {
        coord: neighborCoord,
        status: HexStatus.Blocked,
        numbers: [3, 3, 3, 3, 3, 3], // all 3s — would match but hex is blocked
      }],
    ])

    const armies = detectArmies(snapshot)
    expect(armies.length).toBe(0)
  })
})

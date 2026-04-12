import { describe, it, expect } from 'vitest'
import { resolveAction } from './ruleEngine'
import type { GameSnapshot, GameAction } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import { HexStatus } from '../types/hex.types'
import type { HexState } from '../types/hex.types'
import { hexToKey, getNeighborAtEdge, getOppositeEdge } from './hexMath'

// Build a small 3x3 map for testing (q: 0-2, r: 0-2)
function makeMapHexes() {
  const mapHexes = []
  for (let q = 0; q <= 2; q++) {
    for (let r = 0; r <= 2; r++) {
      mapHexes.push({ coord: { q, r } })
    }
  }
  return mapHexes
}

function makeGameSnapshot(): GameSnapshot {
  const hexes = new Map<string, HexState>()
  // Starting hex claimed at (1,1) — center of 3x3 map
  hexes.set('1,1', {
    coord: { q: 1, r: 1 },
    status: HexStatus.Claimed,
    numbers: [1, 2, 3, 4, 5, 6],
  })

  return {
    mapId: 'test',
    mapDefinition: {
      id: 'test',
      name: 'Test Map',
      description: 'Test',
      schemaVersion: 1,
      gridWidth: 3,
      gridHeight: 3,
      hexes: makeMapHexes(),
      forts: [],
      startingHex: { q: 1, r: 1 },
      darkForceLimit: 25,
      orientation: 'flat-top' as const,
    },
    hexes,
    turnNumber: 0,
    darkForceTally: 0,
    fortsCaptured: 0,
    totalForts: 0,
    status: GameStatus.InProgress,
  }
}

describe('resolveAction — placeHex', () => {
  it('places a hex in the target position and returns ok', () => {
    const state = makeGameSnapshot()
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 1, r: 1 },
      edge: 2,  // SE direction
      diceValue: 3,
    }

    const result = resolveAction(state, action)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const targetCoord = getNeighborAtEdge({ q: 1, r: 1 }, 2)
    const targetKey = hexToKey(targetCoord)
    const targetHex = result.snapshot.hexes.get(targetKey)

    expect(targetHex).toBeDefined()
    expect(targetHex!.status).toBe(HexStatus.Claimed)
    expect(targetHex!.numbers).toBeDefined()
    expect(targetHex!.numbers).toHaveLength(6)
  })

  it('orients numbers correctly — diceValue on the connecting edge', () => {
    const state = makeGameSnapshot()
    const rollEdge = 2  // SE
    const diceValue = 3
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 1, r: 1 },
      edge: rollEdge,
      diceValue,
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const targetCoord = getNeighborAtEdge({ q: 1, r: 1 }, rollEdge)
    const targetKey = hexToKey(targetCoord)
    const targetHex = result.snapshot.hexes.get(targetKey)!

    // The connecting edge on the target is the opposite of the roll direction
    const connectingEdge = getOppositeEdge(rollEdge as 0 | 1 | 2 | 3 | 4 | 5)
    expect(targetHex.numbers![connectingEdge]).toBe(diceValue)
  })

  it('numbers are 1-6 clockwise from connecting edge', () => {
    const state = makeGameSnapshot()
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 1, r: 1 },
      edge: 0,  // N direction
      diceValue: 4,
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const targetCoord = getNeighborAtEdge({ q: 1, r: 1 }, 0)
    const targetHex = result.snapshot.hexes.get(hexToKey(targetCoord))!
    const connectingEdge = getOppositeEdge(0)  // edge 3

    // Starting with diceValue=4 at edge 3, clockwise: 4,5,6,1,2,3
    expect(targetHex.numbers![3]).toBe(4)
    expect(targetHex.numbers![4]).toBe(5)
    expect(targetHex.numbers![5]).toBe(6)
    expect(targetHex.numbers![0]).toBe(1)
    expect(targetHex.numbers![1]).toBe(2)
    expect(targetHex.numbers![2]).toBe(3)
  })

  it('increments turn number in the new snapshot', () => {
    const state = makeGameSnapshot()
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 1, r: 1 },
      edge: 2,
      diceValue: 1,
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.snapshot.turnNumber).toBe(1)
  })

  it('does not mutate the original snapshot', () => {
    const state = makeGameSnapshot()
    const originalHexCount = state.hexes.size
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 1, r: 1 },
      edge: 2,
      diceValue: 1,
    }

    resolveAction(state, action)

    expect(state.hexes.size).toBe(originalHexCount)
    expect(state.turnNumber).toBe(0)
  })

  it('returns error when source hex is not claimed', () => {
    const state = makeGameSnapshot()
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 3, r: 3 },  // not claimed
      edge: 2,
      diceValue: 1,
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason.code).toBe('SOURCE_NOT_CLAIMED')
  })

  it('places blocked hex clockwise when target is occupied', () => {
    const state = makeGameSnapshot()
    // Occupy the target at edge 2 (SE) — neighbor of (1,1)
    const targetCoord = getNeighborAtEdge({ q: 1, r: 1 }, 2)
    state.hexes.set(hexToKey(targetCoord), {
      coord: targetCoord,
      status: HexStatus.Claimed,
      numbers: [1, 2, 3, 4, 5, 6],
    })

    // Roll 3 from (1,1) — edge 2 has number 3, target is occupied
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 1, r: 1 },
      diceValue: 3,
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    // Source should stay claimed
    expect(result.snapshot.hexes.get('1,1')!.status).toBe(HexStatus.Claimed)

    // Next clockwise from edge 2 is edge 3. Check if a blocked hex was placed there.
    const clockwiseCoord = getNeighborAtEdge({ q: 1, r: 1 }, 3)
    const blockedHex = result.snapshot.hexes.get(hexToKey(clockwiseCoord))
    expect(blockedHex).toBeDefined()
    expect(blockedHex!.status).toBe(HexStatus.Blocked)
    expect(blockedHex!.numbers).toBeDefined()
  })

  it('returns error when missing required fields', () => {
    const state = makeGameSnapshot()

    const noSource: GameAction = { type: 'placeHex', edge: 2, diceValue: 1 }
    expect(resolveAction(state, noSource).ok).toBe(false)

    const noDice: GameAction = { type: 'placeHex', sourceCoord: { q: 1, r: 1 }, edge: 2 }
    expect(resolveAction(state, noDice).ok).toBe(false)
  })

  it('succeeds without explicit edge — derives from source hex numbers', () => {
    const state = makeGameSnapshot()
    const noEdge: GameAction = { type: 'placeHex', sourceCoord: { q: 1, r: 1 }, diceValue: 1 }
    expect(resolveAction(state, noEdge).ok).toBe(true)
  })
})

describe('resolveAction — dice determines direction', () => {
  it('derives exit edge from the rolled number on the source hex', () => {
    const state = makeGameSnapshot()
    // Source hex at (1,1) has numbers [1,2,3,4,5,6]
    // numbers[0]=1, numbers[1]=2, numbers[2]=3, etc.
    // Rolling a 3 means exit from edge 2 (where number 3 is)
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 1, r: 1 },
      diceValue: 3,
      // No edge specified — engine derives it
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    // Edge 2 (SE) neighbor of (1,1) is (2,1)
    const targetKey = hexToKey(getNeighborAtEdge({ q: 1, r: 1 }, 2))
    expect(result.snapshot.hexes.has(targetKey)).toBe(true)
    expect(result.snapshot.hexes.get(targetKey)!.status).toBe(HexStatus.Claimed)
  })

  it('places rolled number on the connecting edge of the new hex', () => {
    const state = makeGameSnapshot()
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 1, r: 1 },
      diceValue: 5,
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    // numbers[4]=5, so exit from edge 4 (SW)
    const targetCoord = getNeighborAtEdge({ q: 1, r: 1 }, 4)
    const targetHex = result.snapshot.hexes.get(hexToKey(targetCoord))!
    // Connecting edge on target = opposite of exit edge 4 = edge 1
    const connectingEdge = getOppositeEdge(4 as 0|1|2|3|4|5)
    expect(targetHex.numbers![connectingEdge]).toBe(5)
  })

  it('returns error when source hex has no numbers', () => {
    const state = makeGameSnapshot()
    // Add a claimed hex with no numbers
    state.hexes.set('0,0', {
      coord: { q: 0, r: 0 },
      status: HexStatus.Claimed,
    })

    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 0, r: 0 },
      diceValue: 3,
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason.code).toBe('NO_NUMBERS')
  })
})

describe('resolveAction — off-map boundary', () => {
  it('blocks the source hex when rolling off the map edge', () => {
    const state = makeGameSnapshot()
    // Place a hex at the edge of the map
    const edgeCoord = { q: 0, r: 1 }
    state.hexes.set(hexToKey(edgeCoord), {
      coord: edgeCoord,
      status: HexStatus.Claimed,
      numbers: [1, 2, 3, 4, 5, 6],
    })

    // Roll from (0,1) toward edge 5 (NW) — neighbor is (-1,1), off the 3x3 map
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: edgeCoord,
      edge: 5,
      diceValue: 3,
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    // Source hex should now be blocked
    const sourceHex = result.snapshot.hexes.get(hexToKey(edgeCoord))
    expect(sourceHex!.status).toBe(HexStatus.Blocked)

    // No new hex placed off-map
    expect(result.snapshot.hexes.has(hexToKey({ q: -1, r: 1 }))).toBe(false)
  })

  it('does not block source when rolling into valid map position', () => {
    const state = makeGameSnapshot()
    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: { q: 1, r: 1 },
      edge: 2,
      diceValue: 3,
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.snapshot.hexes.get('1,1')!.status).toBe(HexStatus.Claimed)
    const targetHex = result.snapshot.hexes.get(hexToKey(getNeighborAtEdge({ q: 1, r: 1 }, 2)))
    expect(targetHex!.status).toBe(HexStatus.Claimed)
  })

  it('preserves source hex numbers when blocked by off-map roll', () => {
    const state = makeGameSnapshot()
    const edgeCoord = { q: 0, r: 0 }
    state.hexes.set(hexToKey(edgeCoord), {
      coord: edgeCoord,
      status: HexStatus.Claimed,
      numbers: [3, 4, 5, 6, 1, 2],
    })

    const action: GameAction = {
      type: 'placeHex',
      sourceCoord: edgeCoord,
      edge: 0, // N — neighbor (0,-1) is off map
      diceValue: 1,
    }

    const result = resolveAction(state, action)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const sourceHex = result.snapshot.hexes.get(hexToKey(edgeCoord))
    expect(sourceHex!.status).toBe(HexStatus.Blocked)
    expect(sourceHex!.numbers).toEqual([3, 4, 5, 6, 1, 2])
  })
})

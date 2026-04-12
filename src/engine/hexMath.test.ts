import { describe, it, expect } from 'vitest'
import {
  getNeighbors,
  getNeighborAtEdge,
  getEdgeDirection,
  getOppositeEdge,
  axialToCube,
  cubeToAxial,
  hexDistance,
  hexEquals,
  hexToKey,
  keyToHex,
} from './hexMath'
import type { HexCoord, HexEdge } from '../types/hex.types'

describe('getNeighbors', () => {
  it('returns 6 neighbors for origin', () => {
    const neighbors = getNeighbors({ q: 0, r: 0 })
    expect(neighbors).toHaveLength(6)
  })

  it('returns correct neighbors for origin (clockwise from top)', () => {
    const neighbors = getNeighbors({ q: 0, r: 0 })
    expect(neighbors[0]).toEqual({ q: 0, r: -1 })   // Edge 0: N
    expect(neighbors[1]).toEqual({ q: 1, r: -1 })   // Edge 1: NE
    expect(neighbors[2]).toEqual({ q: 1, r: 0 })    // Edge 2: SE
    expect(neighbors[3]).toEqual({ q: 0, r: 1 })    // Edge 3: S
    expect(neighbors[4]).toEqual({ q: -1, r: 1 })   // Edge 4: SW
    expect(neighbors[5]).toEqual({ q: -1, r: 0 })   // Edge 5: W
  })

  it('returns correct neighbors for offset position', () => {
    const neighbors = getNeighbors({ q: 3, r: 3 })
    expect(neighbors[0]).toEqual({ q: 3, r: 2 })    // N
    expect(neighbors[1]).toEqual({ q: 4, r: 2 })    // NE
    expect(neighbors[2]).toEqual({ q: 4, r: 3 })    // SE
    expect(neighbors[3]).toEqual({ q: 3, r: 4 })    // S
    expect(neighbors[4]).toEqual({ q: 2, r: 4 })    // SW
    expect(neighbors[5]).toEqual({ q: 2, r: 3 })    // W
  })

  it('works with negative coordinates', () => {
    const neighbors = getNeighbors({ q: -2, r: -1 })
    expect(neighbors).toHaveLength(6)
    expect(neighbors[0]).toEqual({ q: -2, r: -2 })
    expect(neighbors[2]).toEqual({ q: -1, r: -1 })
  })

  it('returns new array each call (no shared state)', () => {
    const a = getNeighbors({ q: 0, r: 0 })
    const b = getNeighbors({ q: 0, r: 0 })
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('getNeighborAtEdge', () => {
  it('returns correct neighbor for each edge from origin', () => {
    const coord: HexCoord = { q: 0, r: 0 }
    expect(getNeighborAtEdge(coord, 0)).toEqual({ q: 0, r: -1 })
    expect(getNeighborAtEdge(coord, 1)).toEqual({ q: 1, r: -1 })
    expect(getNeighborAtEdge(coord, 2)).toEqual({ q: 1, r: 0 })
    expect(getNeighborAtEdge(coord, 3)).toEqual({ q: 0, r: 1 })
    expect(getNeighborAtEdge(coord, 4)).toEqual({ q: -1, r: 1 })
    expect(getNeighborAtEdge(coord, 5)).toEqual({ q: -1, r: 0 })
  })

  it('matches getNeighbors output by index', () => {
    const coord: HexCoord = { q: 5, r: -3 }
    const neighbors = getNeighbors(coord)
    for (let edge = 0; edge < 6; edge++) {
      expect(getNeighborAtEdge(coord, edge as HexEdge)).toEqual(neighbors[edge])
    }
  })
})

describe('getEdgeDirection', () => {
  it('returns correct edge for each neighbor direction', () => {
    const from: HexCoord = { q: 3, r: 3 }
    expect(getEdgeDirection(from, { q: 3, r: 2 })).toBe(0)   // N
    expect(getEdgeDirection(from, { q: 4, r: 2 })).toBe(1)   // NE
    expect(getEdgeDirection(from, { q: 4, r: 3 })).toBe(2)   // SE
    expect(getEdgeDirection(from, { q: 3, r: 4 })).toBe(3)   // S
    expect(getEdgeDirection(from, { q: 2, r: 4 })).toBe(4)   // SW
    expect(getEdgeDirection(from, { q: 2, r: 3 })).toBe(5)   // W
  })

  it('returns undefined for non-neighbor', () => {
    expect(getEdgeDirection({ q: 0, r: 0 }, { q: 2, r: 0 })).toBeUndefined()
    expect(getEdgeDirection({ q: 0, r: 0 }, { q: 0, r: 0 })).toBeUndefined()
  })

  it('round-trips with getNeighborAtEdge', () => {
    const coord: HexCoord = { q: 2, r: -1 }
    for (let edge = 0; edge < 6; edge++) {
      const neighbor = getNeighborAtEdge(coord, edge as HexEdge)
      expect(getEdgeDirection(coord, neighbor)).toBe(edge)
    }
  })
})

describe('getOppositeEdge', () => {
  it('returns opposite edge for each edge', () => {
    expect(getOppositeEdge(0)).toBe(3)
    expect(getOppositeEdge(1)).toBe(4)
    expect(getOppositeEdge(2)).toBe(5)
    expect(getOppositeEdge(3)).toBe(0)
    expect(getOppositeEdge(4)).toBe(1)
    expect(getOppositeEdge(5)).toBe(2)
  })
})

describe('axialToCube / cubeToAxial', () => {
  it('converts origin correctly', () => {
    const cube = axialToCube({ q: 0, r: 0 })
    expect(cube).toEqual({ q: 0, r: 0, s: 0 })
  })

  it('maintains cube constraint q + r + s = 0', () => {
    const coords: HexCoord[] = [
      { q: 3, r: -1 },
      { q: -2, r: 5 },
      { q: 0, r: 0 },
      { q: -4, r: -3 },
    ]
    for (const coord of coords) {
      const cube = axialToCube(coord)
      expect(cube.q + cube.r + cube.s).toBe(0)
    }
  })

  it('round-trips axial -> cube -> axial', () => {
    const coords: HexCoord[] = [
      { q: 3, r: -1 },
      { q: -2, r: 5 },
      { q: 0, r: 0 },
      { q: -4, r: -3 },
      { q: 10, r: -7 },
    ]
    for (const coord of coords) {
      const result = cubeToAxial(axialToCube(coord))
      expect(result).toEqual(coord)
    }
  })

  it('converts negative coordinates correctly', () => {
    const cube = axialToCube({ q: -3, r: -2 })
    expect(cube).toEqual({ q: -3, r: -2, s: 5 })
  })
})

describe('hexDistance', () => {
  it('returns 0 for same hex', () => {
    expect(hexDistance({ q: 3, r: 3 }, { q: 3, r: 3 })).toBe(0)
  })

  it('returns 1 for adjacent hexes', () => {
    const center: HexCoord = { q: 0, r: 0 }
    const neighbors = getNeighbors(center)
    for (const neighbor of neighbors) {
      expect(hexDistance(center, neighbor)).toBe(1)
    }
  })

  it('calculates correct distance for non-adjacent hexes', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 3, r: 0 })).toBe(3)
    expect(hexDistance({ q: 0, r: 0 }, { q: 0, r: 4 })).toBe(4)
    expect(hexDistance({ q: -2, r: 1 }, { q: 2, r: -1 })).toBe(4)
  })
})

describe('hexEquals', () => {
  it('returns true for equal coords', () => {
    expect(hexEquals({ q: 3, r: 5 }, { q: 3, r: 5 })).toBe(true)
  })

  it('returns false for different coords', () => {
    expect(hexEquals({ q: 3, r: 5 }, { q: 3, r: 4 })).toBe(false)
    expect(hexEquals({ q: 3, r: 5 }, { q: 4, r: 5 })).toBe(false)
  })
})

describe('hexToKey / keyToHex', () => {
  it('creates consistent key format', () => {
    expect(hexToKey({ q: 3, r: 5 })).toBe('3,5')
    expect(hexToKey({ q: -1, r: 0 })).toBe('-1,0')
  })

  it('round-trips key -> coord -> key', () => {
    const coords: HexCoord[] = [
      { q: 0, r: 0 },
      { q: 3, r: -2 },
      { q: -5, r: 7 },
    ]
    for (const coord of coords) {
      expect(keyToHex(hexToKey(coord))).toEqual(coord)
    }
  })
})

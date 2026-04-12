import { defineHex, Orientation as HCOrientation } from 'honeycomb-grid'
import type { HexCoord, CubeCoord, HexEdge } from '../types/hex.types'

/**
 * Honeycomb.js hex class configured for flat-top orientation.
 * Exported for use in rendering (hex-to-pixel conversion in Story 1.3).
 */
export const FlatHex = defineHex({
  orientation: HCOrientation.FLAT,
  dimensions: 1,
})

/**
 * Axial neighbor offsets for flat-top hexagons, clockwise from top (edge 0).
 */
const NEIGHBOR_OFFSETS: readonly HexCoord[] = [
  { q: 0, r: -1 },   // Edge 0: N (top)
  { q: 1, r: -1 },   // Edge 1: NE (top-right)
  { q: 1, r: 0 },    // Edge 2: SE (bottom-right)
  { q: 0, r: 1 },    // Edge 3: S (bottom)
  { q: -1, r: 1 },   // Edge 4: SW (bottom-left)
  { q: -1, r: 0 },   // Edge 5: W (top-left)
]

/**
 * Returns all 6 neighboring hex coordinates for a given hex.
 * Order: clockwise from top (edge 0 through edge 5).
 */
export function getNeighbors(coord: HexCoord): HexCoord[] {
  return NEIGHBOR_OFFSETS.map((offset) => ({
    q: coord.q + offset.q,
    r: coord.r + offset.r,
  }))
}

/**
 * Returns the neighbor coordinate at the given edge direction.
 * Edge 0 = top (N), clockwise to Edge 5 = top-left (W).
 */
export function getNeighborAtEdge(coord: HexCoord, edge: HexEdge): HexCoord {
  const offset = NEIGHBOR_OFFSETS[edge]
  return {
    q: coord.q + offset.q,
    r: coord.r + offset.r,
  }
}

/**
 * Returns the edge index (0-5) that connects `from` to `to`.
 * Returns undefined if `to` is not a neighbor of `from`.
 */
export function getEdgeDirection(from: HexCoord, to: HexCoord): HexEdge | undefined {
  const dq = to.q - from.q
  const dr = to.r - from.r

  for (let i = 0; i < NEIGHBOR_OFFSETS.length; i++) {
    const offset = NEIGHBOR_OFFSETS[i]
    if (offset.q === dq && offset.r === dr) {
      return i as HexEdge
    }
  }

  return undefined
}

/**
 * Returns the opposite edge index (the edge on the other side).
 * Edge 0 <-> Edge 3, Edge 1 <-> Edge 4, Edge 2 <-> Edge 5.
 */
export function getOppositeEdge(edge: HexEdge): HexEdge {
  return ((edge + 3) % 6) as HexEdge
}

/**
 * Convert axial (q, r) coordinates to cube (q, r, s) coordinates.
 * Cube constraint: q + r + s = 0
 */
export function axialToCube(coord: HexCoord): CubeCoord {
  const s = -coord.q - coord.r
  return {
    q: coord.q,
    r: coord.r,
    s: s === 0 ? 0 : s, // avoid -0
  }
}

/**
 * Convert cube (q, r, s) coordinates to axial (q, r) coordinates.
 */
export function cubeToAxial(cube: CubeCoord): HexCoord {
  return {
    q: cube.q,
    r: cube.r,
  }
}

/**
 * Calculate the distance between two hexes in hex steps.
 */
export function hexDistance(a: HexCoord, b: HexCoord): number {
  const ac = axialToCube(a)
  const bc = axialToCube(b)
  return Math.max(
    Math.abs(ac.q - bc.q),
    Math.abs(ac.r - bc.r),
    Math.abs(ac.s - bc.s),
  )
}

/**
 * Check if two hex coordinates are equal.
 */
export function hexEquals(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r
}

/**
 * Create a string key from a hex coordinate for use as Map keys.
 */
export function hexToKey(coord: HexCoord): string {
  return `${coord.q},${coord.r}`
}

/**
 * Parse a hex key string back to a HexCoord.
 */
export function keyToHex(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number)
  return { q, r }
}

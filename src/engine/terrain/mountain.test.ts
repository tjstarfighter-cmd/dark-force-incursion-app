import { describe, it, expect } from 'vitest'
import { isTargetMountain } from './mountain'
import type { MapDefinition } from '../../types/map.types'
import { TerrainType } from '../../types/terrain.types'

const testMap: MapDefinition = {
  id: 'test', name: 'Test', description: '', schemaVersion: 1,
  gridWidth: 5, gridHeight: 5,
  hexes: [
    { coord: { q: 0, r: 0 } },
    { coord: { q: 1, r: 0 } },
    { coord: { q: 2, r: 0 }, terrain: TerrainType.Mountain },
    { coord: { q: 0, r: 1 } },
    { coord: { q: 1, r: 1 } },
  ],
  forts: [],
  startingHex: { q: 0, r: 0 },
  darkForceLimit: 25,
  orientation: 'flat-top' as const,
}

describe('isTargetMountain', () => {
  it('returns true when target is a mountain hex', () => {
    expect(isTargetMountain(testMap, { q: 2, r: 0 })).toBe(true)
  })

  it('returns false when target is not a mountain', () => {
    expect(isTargetMountain(testMap, { q: 1, r: 0 })).toBe(false)
  })

  it('returns false when target is off the map', () => {
    expect(isTargetMountain(testMap, { q: 9, r: 9 })).toBe(false)
  })
})

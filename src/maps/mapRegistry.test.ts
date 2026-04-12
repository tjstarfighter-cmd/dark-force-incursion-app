import { describe, it, expect } from 'vitest'
import { getMap, listMaps, registerMap } from './mapRegistry'
import type { MapDefinition } from '../types/map.types'

describe('getMap', () => {
  it('returns Calosanti map by id', () => {
    const map = getMap('calosanti')
    expect(map).toBeDefined()
    expect(map!.name).toBe('Calosanti Region')
    expect(map!.orientation).toBe('flat-top')
  })

  it('returns undefined for unknown map id', () => {
    expect(getMap('nonexistent')).toBeUndefined()
  })

  it('returns map with correct structure', () => {
    const map = getMap('calosanti')!
    expect(map.id).toBe('calosanti')
    expect(map.hexes.length).toBeGreaterThan(0)
    expect(map.forts.length).toBeGreaterThan(0)
    expect(map.startingHex).toBeDefined()
    expect(map.darkForceLimit).toBe(25)
    expect(map.schemaVersion).toBeGreaterThanOrEqual(1)
  })
})

describe('listMaps', () => {
  it('returns at least Calosanti in the list', () => {
    const maps = listMaps()
    expect(maps.length).toBeGreaterThanOrEqual(1)
    expect(maps.some(m => m.id === 'calosanti')).toBe(true)
  })

  it('returns metadata with id, name, description', () => {
    const maps = listMaps()
    const calosanti = maps.find(m => m.id === 'calosanti')!
    expect(calosanti.name).toBe('Calosanti Region')
    expect(calosanti.description).toBeTruthy()
  })
})

describe('registerMap', () => {
  it('registers a custom map and retrieves it', () => {
    const customMap: MapDefinition = {
      id: 'test-map',
      name: 'Test Map',
      description: 'A test map',
      schemaVersion: 1,
      gridWidth: 3,
      gridHeight: 3,
      hexes: [{ coord: { q: 0, r: 0 } }, { coord: { q: 1, r: 0 } }],
      forts: [],
      startingHex: { q: 0, r: 0 },
      darkForceLimit: 13,
      orientation: 'flat-top',
    }

    registerMap(customMap)
    const retrieved = getMap('test-map')
    expect(retrieved).toBeDefined()
    expect(retrieved!.name).toBe('Test Map')
  })
})

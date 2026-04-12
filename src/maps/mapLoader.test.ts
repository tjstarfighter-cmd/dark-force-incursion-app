import { describe, it, expect } from 'vitest'
import { validateMap, isValidMapDefinition } from './mapLoader'
import { CALOSANTI_MAP } from './calosanti'

describe('validateMap', () => {
  it('accepts valid Calosanti map', () => {
    const result = validateMap(CALOSANTI_MAP)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects null', () => {
    const result = validateMap(null)
    expect(result.valid).toBe(false)
  })

  it('rejects undefined', () => {
    const result = validateMap(undefined)
    expect(result.valid).toBe(false)
  })

  it('rejects empty object', () => {
    const result = validateMap({})
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('rejects map with missing id', () => {
    const map = { ...CALOSANTI_MAP, id: '' }
    const result = validateMap(map)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('id'))).toBe(true)
  })

  it('rejects map with missing name', () => {
    const map = { ...CALOSANTI_MAP, name: '' }
    const result = validateMap(map)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('name'))).toBe(true)
  })

  it('rejects map with invalid orientation', () => {
    const map = { ...CALOSANTI_MAP, orientation: 'sideways' }
    const result = validateMap(map)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('orientation'))).toBe(true)
  })

  it('rejects map with invalid schemaVersion', () => {
    const map = { ...CALOSANTI_MAP, schemaVersion: 0 }
    const result = validateMap(map)
    expect(result.valid).toBe(false)
  })

  it('rejects map with empty hexes array', () => {
    const map = { ...CALOSANTI_MAP, hexes: [] }
    const result = validateMap(map)
    expect(result.valid).toBe(false)
  })

  it('rejects map with invalid hex entry', () => {
    const map = { ...CALOSANTI_MAP, hexes: [{ coord: { q: 'a', r: 0 } }] }
    const result = validateMap(map)
    expect(result.valid).toBe(false)
  })

  it('rejects map with missing startingHex', () => {
    const map = { ...CALOSANTI_MAP, startingHex: null }
    const result = validateMap(map)
    expect(result.valid).toBe(false)
  })
})

describe('isValidMapDefinition', () => {
  it('returns true for valid map', () => {
    expect(isValidMapDefinition(CALOSANTI_MAP)).toBe(true)
  })

  it('returns false for invalid data', () => {
    expect(isValidMapDefinition({})).toBe(false)
    expect(isValidMapDefinition(null)).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { detectContextualRules } from './rulesContext'
import type { GameSnapshot } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import { HexStatus } from '../types/hex.types'
import type { MapDefinition } from '../types/map.types'

const TEST_MAP: MapDefinition = {
  id: 'test',
  name: 'Test',
  description: '',
  schemaVersion: 1,
  gridWidth: 5,
  gridHeight: 5,
  hexes: [{ coord: { q: 0, r: 0 } }],
  forts: [],
  startingHex: { q: 0, r: 0 },
  darkForceLimit: 25,
  orientation: 'flat-top' as const,
}

function makeSnapshot(overrides: Partial<GameSnapshot> = {}): GameSnapshot {
  return {
    mapId: 'test',
    mapDefinition: TEST_MAP,
    hexes: new Map(),
    turnNumber: 0,
    darkForceTally: 0,
    fortsCaptured: 0,
    totalForts: 0,
    status: GameStatus.InProgress,
    ...overrides,
  }
}

describe('detectContextualRules', () => {
  it('returns hex-placement when no previous snapshot', () => {
    const current = makeSnapshot()
    expect(detectContextualRules(current, null)).toEqual(['hex-placement'])
  })

  it('detects Dark Force spawning', () => {
    const previous = makeSnapshot({ darkForceTally: 2 })
    const current = makeSnapshot({ darkForceTally: 3 })

    const rules = detectContextualRules(current, previous)
    expect(rules).toContain('df-spawning')
  })

  it('detects Dark Force escalation (tally increase > 1)', () => {
    const previous = makeSnapshot({ darkForceTally: 2 })
    const current = makeSnapshot({ darkForceTally: 5 })

    const rules = detectContextualRules(current, previous)
    expect(rules).toContain('df-spawning')
    expect(rules).toContain('df-escalation')
  })

  it('detects new armies', () => {
    const prevHexes = new Map([
      ['0,0', { coord: { q: 0, r: 0 }, status: HexStatus.Claimed, numbers: [1, 2, 3, 4, 5, 6] }],
    ])
    const curHexes = new Map([
      ['0,0', { coord: { q: 0, r: 0 }, status: HexStatus.Claimed, numbers: [1, 2, 3, 4, 5, 6], armies: [0] }],
    ])

    const previous = makeSnapshot({ hexes: prevHexes as any })
    const current = makeSnapshot({ hexes: curHexes as any })

    const rules = detectContextualRules(current, previous)
    expect(rules).toContain('army-matching')
  })

  it('detects source hex blocked (mountain/off-map)', () => {
    const prevHexes = new Map([
      ['0,0', { coord: { q: 0, r: 0 }, status: HexStatus.Claimed, numbers: [1, 2, 3, 4, 5, 6] }],
    ])
    const curHexes = new Map([
      ['0,0', { coord: { q: 0, r: 0 }, status: HexStatus.Blocked, numbers: [1, 2, 3, 4, 5, 6] }],
    ])

    const previous = makeSnapshot({ hexes: prevHexes as any })
    const current = makeSnapshot({ hexes: curHexes as any })

    const rules = detectContextualRules(current, previous)
    expect(rules).toContain('mountain-block')
    expect(rules).toContain('blocking')
  })

  it('detects clockwise blocked placement', () => {
    const prevHexes = new Map([
      ['0,0', { coord: { q: 0, r: 0 }, status: HexStatus.Claimed }],
    ])
    const curHexes = new Map([
      ['0,0', { coord: { q: 0, r: 0 }, status: HexStatus.Claimed }],
      ['1,0', { coord: { q: 1, r: 0 }, status: HexStatus.Blocked, numbers: [1, 2, 3, 4, 5, 6] }],
    ])

    const previous = makeSnapshot({ hexes: prevHexes as any })
    const current = makeSnapshot({ hexes: curHexes as any })

    const rules = detectContextualRules(current, previous)
    expect(rules).toContain('blocking')
    expect(rules).not.toContain('mountain-block')
  })

  it('detects normal hex placement', () => {
    const prevHexes = new Map([
      ['0,0', { coord: { q: 0, r: 0 }, status: HexStatus.Claimed }],
    ])
    const curHexes = new Map([
      ['0,0', { coord: { q: 0, r: 0 }, status: HexStatus.Claimed }],
      ['1,0', { coord: { q: 1, r: 0 }, status: HexStatus.Claimed, numbers: [1, 2, 3, 4, 5, 6] }],
    ])

    const previous = makeSnapshot({ hexes: prevHexes as any })
    const current = makeSnapshot({ hexes: curHexes as any })

    const rules = detectContextualRules(current, previous)
    expect(rules).toContain('hex-placement')
  })

  it('detects fort capture', () => {
    const previous = makeSnapshot({ fortsCaptured: 1 })
    const current = makeSnapshot({ fortsCaptured: 2 })

    const rules = detectContextualRules(current, previous)
    expect(rules).toContain('fort-capture')
  })

  it('detects Dark Force limit reached', () => {
    const previous = makeSnapshot({ darkForceTally: 24 })
    const current = makeSnapshot({ darkForceTally: 25 })

    const rules = detectContextualRules(current, previous)
    expect(rules).toContain('df-limit')
  })

  it('returns hex-placement as default when nothing specific detected', () => {
    const previous = makeSnapshot({ turnNumber: 1 })
    const current = makeSnapshot({ turnNumber: 2 })

    const rules = detectContextualRules(current, previous)
    expect(rules).toContain('hex-placement')
  })
})

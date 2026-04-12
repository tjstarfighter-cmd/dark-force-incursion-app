import { describe, it, expect } from 'vitest'
import { TurnStack } from './turnStack'
import type { TurnEntry } from './turnStack'
import type { GameSnapshot, GameAction } from '../types/game.types'
import { GameStatus } from '../types/game.types'
import { HexStatus } from '../types/hex.types'

function makeSnapshot(turnNumber: number, extraHexes?: Map<string, any>): GameSnapshot {
  const hexes = new Map<string, any>()
  if (extraHexes) {
    for (const [k, v] of extraHexes) {
      hexes.set(k, v)
    }
  }
  return {
    mapId: 'test-map',
    mapDefinition: {
      id: 'test-map',
      name: 'Test Map',
      description: 'Test',
      schemaVersion: 1,
      gridWidth: 5,
      gridHeight: 5,
      hexes: [],
      forts: [],
      startingHex: { q: 0, r: 0 },
      darkForceLimit: 25,
      orientation: 'flat-top' as const,
    },
    hexes,
    turnNumber,
    darkForceTally: 0,
    fortsCaptured: 0,
    totalForts: 0,
    status: GameStatus.InProgress,
  }
}

function makeAction(type: string = 'placeHex'): GameAction {
  return {
    type: type as GameAction['type'],
    sourceCoord: { q: 0, r: 0 },
    edge: 2,
    diceValue: 3,
  }
}

describe('TurnStack', () => {
  describe('initial state', () => {
    it('starts empty', () => {
      const stack = new TurnStack()
      expect(stack.isEmpty()).toBe(true)
      expect(stack.getLength()).toBe(0)
    })

    it('peek returns undefined when empty', () => {
      const stack = new TurnStack()
      expect(stack.peek()).toBeUndefined()
    })

    it('getAll returns empty array when empty', () => {
      const stack = new TurnStack()
      expect(stack.getAll()).toEqual([])
    })
  })

  describe('push', () => {
    it('adds an entry to the stack', () => {
      const stack = new TurnStack()
      const snapshot = makeSnapshot(1)
      const action = makeAction()

      stack.push({ turnNumber: 1, action, snapshot, journalEntries: [] })

      expect(stack.isEmpty()).toBe(false)
      expect(stack.getLength()).toBe(1)
    })

    it('multiple pushes increment length', () => {
      const stack = new TurnStack()

      stack.push({ turnNumber: 1, action: makeAction(), snapshot: makeSnapshot(1), journalEntries: [] })
      stack.push({ turnNumber: 2, action: makeAction(), snapshot: makeSnapshot(2), journalEntries: [] })
      stack.push({ turnNumber: 3, action: makeAction(), snapshot: makeSnapshot(3), journalEntries: [] })

      expect(stack.getLength()).toBe(3)
    })
  })

  describe('peek', () => {
    it('returns the most recently pushed entry', () => {
      const stack = new TurnStack()
      stack.push({ turnNumber: 1, action: makeAction(), snapshot: makeSnapshot(1), journalEntries: [] })
      stack.push({ turnNumber: 2, action: makeAction(), snapshot: makeSnapshot(2), journalEntries: [] })

      const top = stack.peek()
      expect(top).toBeDefined()
      expect(top!.turnNumber).toBe(2)
    })
  })

  describe('getAll', () => {
    it('returns all entries in order', () => {
      const stack = new TurnStack()
      stack.push({ turnNumber: 1, action: makeAction(), snapshot: makeSnapshot(1), journalEntries: [] })
      stack.push({ turnNumber: 2, action: makeAction(), snapshot: makeSnapshot(2), journalEntries: [] })

      const all = stack.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].turnNumber).toBe(1)
      expect(all[1].turnNumber).toBe(2)
    })

    it('returns a copy, not the internal array', () => {
      const stack = new TurnStack()
      stack.push({ turnNumber: 1, action: makeAction(), snapshot: makeSnapshot(1), journalEntries: [] })

      const all1 = stack.getAll()
      const all2 = stack.getAll()
      expect(all1).not.toBe(all2)
      expect(all1).toEqual(all2)
    })
  })

  describe('popTo', () => {
    it('removes entries after the specified turn number', () => {
      const stack = new TurnStack()
      stack.push({ turnNumber: 1, action: makeAction(), snapshot: makeSnapshot(1), journalEntries: [] })
      stack.push({ turnNumber: 2, action: makeAction(), snapshot: makeSnapshot(2), journalEntries: [] })
      stack.push({ turnNumber: 3, action: makeAction(), snapshot: makeSnapshot(3), journalEntries: [] })

      const removed = stack.popTo(1)

      expect(removed).toHaveLength(2)
      expect(removed[0].turnNumber).toBe(2)
      expect(removed[1].turnNumber).toBe(3)
      expect(stack.getLength()).toBe(1)
      expect(stack.peek()!.turnNumber).toBe(1)
    })

    it('returns empty array if already at target turn', () => {
      const stack = new TurnStack()
      stack.push({ turnNumber: 1, action: makeAction(), snapshot: makeSnapshot(1), journalEntries: [] })

      const removed = stack.popTo(1)
      expect(removed).toEqual([])
      expect(stack.getLength()).toBe(1)
    })

    it('returns empty array when target turn not found', () => {
      const stack = new TurnStack()
      stack.push({ turnNumber: 1, action: makeAction(), snapshot: makeSnapshot(1), journalEntries: [] })
      stack.push({ turnNumber: 2, action: makeAction(), snapshot: makeSnapshot(2), journalEntries: [] })

      const removed = stack.popTo(99)
      expect(removed).toEqual([])
      expect(stack.getLength()).toBe(2)
    })
  })

  describe('deep clone verification', () => {
    it('pushed snapshot is independent from the original', () => {
      const stack = new TurnStack()
      const hexes = new Map<string, any>()
      hexes.set('0,0', {
        coord: { q: 0, r: 0 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
        armies: [0],
      })
      const snapshot = makeSnapshot(1, hexes)

      stack.push({ turnNumber: 1, action: makeAction(), snapshot, journalEntries: [] })

      // Mutate the original
      snapshot.hexes.set('1,0', {
        coord: { q: 1, r: 0 },
        status: HexStatus.Claimed,
        numbers: [3, 4, 5, 6, 1, 2],
      })
      snapshot.turnNumber = 999

      // Stack entry should be unaffected
      const entry = stack.peek()!
      expect(entry.snapshot.hexes.has('1,0')).toBe(false)
      expect(entry.snapshot.turnNumber).toBe(1)
    })

    it('retrieved snapshot arrays are independent copies', () => {
      const stack = new TurnStack()
      const hexes = new Map<string, any>()
      hexes.set('0,0', {
        coord: { q: 0, r: 0 },
        status: HexStatus.Claimed,
        numbers: [1, 2, 3, 4, 5, 6],
        armies: [0],
      })
      const snapshot = makeSnapshot(1, hexes)
      stack.push({ turnNumber: 1, action: makeAction(), snapshot, journalEntries: [] })

      // Mutate the numbers array on the original
      snapshot.hexes.get('0,0')!.numbers[0] = 99

      // Stack entry numbers should be unaffected
      const entry = stack.peek()!
      expect(entry.snapshot.hexes.get('0,0')!.numbers[0]).toBe(1)
    })
  })
})

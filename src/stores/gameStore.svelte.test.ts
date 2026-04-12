import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock persistence layer before importing gameStore
vi.mock('../persistence/gameRepository', () => ({
  saveGame: vi.fn().mockResolvedValue(undefined),
  loadActiveGame: vi.fn().mockResolvedValue(null),
  deleteActiveGame: vi.fn().mockResolvedValue(undefined),
}))

import { startGame, dispatch, undo, rewindTo, gameState, getTurnHistory, getTurnStack, restoreGame } from './gameStore.svelte'
import type { MapDefinition } from '../types/map.types'
import { GameStatus } from '../types/game.types'
import type { GameSnapshot } from '../types/game.types'
import type { TurnEntry } from '../engine/turnStack'

const TEST_MAP: MapDefinition = {
  id: 'test-map',
  name: 'Test',
  description: 'Test map',
  schemaVersion: 1,
  gridWidth: 5,
  gridHeight: 5,
  hexes: [
    { coord: { q: 0, r: 0 } },
    { coord: { q: 1, r: 0 } },
    { coord: { q: 0, r: 1 } },
    { coord: { q: -1, r: 1 } },
    { coord: { q: 1, r: -1 } },
    { coord: { q: -1, r: 0 } },
    { coord: { q: 0, r: -1 } },
    // Extra neighbors for multi-turn play
    { coord: { q: 2, r: -1 } },
    { coord: { q: 2, r: 0 } },
    { coord: { q: 1, r: 1 } },
    { coord: { q: -1, r: 2 } },
    { coord: { q: 0, r: 2 } },
    { coord: { q: -2, r: 1 } },
    { coord: { q: -2, r: 2 } },
  ],
  forts: [],
  startingHex: { q: 0, r: 0 },
  darkForceLimit: 25,
  orientation: 'flat-top' as const,
}

describe('gameStore undo/rewind', () => {
  beforeEach(() => {
    startGame(TEST_MAP)
  })

  describe('canUndo', () => {
    it('is false at turn 0 (only initial entry in stack)', () => {
      expect(gameState.canUndo).toBe(false)
    })

    it('is true after dispatching a turn', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      expect(gameState.canUndo).toBe(true)
    })
  })

  describe('undo()', () => {
    it('returns false when at turn 0', () => {
      expect(undo()).toBe(false)
    })

    it('reverts to previous turn snapshot', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      expect(gameState.snapshot!.turnNumber).toBe(1)

      const result = undo()
      expect(result).toBe(true)
      expect(gameState.snapshot!.turnNumber).toBe(0)
    })

    it('sequential undo reverts through multiple turns', () => {
      // Play 3 turns from different claimed hexes
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      const turnOneSnapshot = gameState.snapshot!
      expect(turnOneSnapshot.turnNumber).toBe(1)

      // Undo back to turn 0
      undo()
      expect(gameState.snapshot!.turnNumber).toBe(0)
      expect(gameState.canUndo).toBe(false)
    })

    it('canUndo becomes false after undoing all turns', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      expect(gameState.canUndo).toBe(true)

      undo()
      expect(gameState.canUndo).toBe(false)
    })
  })

  describe('rewindTo()', () => {
    it('returns false when at turn 0', () => {
      expect(rewindTo(0)).toBe(false)
    })

    it('returns false for invalid turn number', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      expect(rewindTo(-1)).toBe(false)
      expect(rewindTo(99)).toBe(false)
    })

    it('rewinds to specified turn', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      expect(gameState.snapshot!.turnNumber).toBe(1)

      const result = rewindTo(0)
      expect(result).toBe(true)
      expect(gameState.snapshot!.turnNumber).toBe(0)
    })

    it('removes all turns after the target', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })

      rewindTo(0)
      expect(getTurnStack().getLength()).toBe(1)
      expect(getTurnStack().peek()!.turnNumber).toBe(0)
    })
  })

  describe('getTurnHistory()', () => {
    it('returns all turn entries', () => {
      const history = getTurnHistory()
      expect(history).toHaveLength(1) // turn 0
      expect(history[0].turnNumber).toBe(0)
    })

    it('includes entries for each dispatched turn', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      const history = getTurnHistory()
      expect(history).toHaveLength(2)
      expect(history[0].turnNumber).toBe(0)
      expect(history[1].turnNumber).toBe(1)
    })

    it('reflects undo state', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      undo()
      const history = getTurnHistory()
      expect(history).toHaveLength(1)
      expect(history[0].turnNumber).toBe(0)
    })
  })

  describe('auto-save after undo', () => {
    it('calls saveGame after undo', async () => {
      const { saveGame } = await import('../persistence/gameRepository')
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      const callsBefore = (saveGame as any).mock.calls.length

      undo()
      expect((saveGame as any).mock.calls.length).toBeGreaterThan(callsBefore)
    })

    it('calls saveGame after rewindTo', async () => {
      const { saveGame } = await import('../persistence/gameRepository')
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      const callsBefore = (saveGame as any).mock.calls.length

      rewindTo(0)
      expect((saveGame as any).mock.calls.length).toBeGreaterThan(callsBefore)
    })
  })

  describe('override after rewind (Story 4.2)', () => {
    it('dispatch works after undo — new turn is N+1', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      expect(gameState.snapshot!.turnNumber).toBe(1)

      undo()
      expect(gameState.snapshot!.turnNumber).toBe(0)

      // Dispatch again from the rewound state
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 2 })
      expect(gameState.snapshot!.turnNumber).toBe(1)
    })

    it('removed turns stay discarded after new dispatch', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 2 })
      expect(getTurnStack().getLength()).toBe(3) // turns 0, 1, 2

      // Rewind to turn 0, then play a new turn
      rewindTo(0)
      expect(getTurnStack().getLength()).toBe(1)

      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 3 })
      expect(getTurnStack().getLength()).toBe(2) // turns 0, 1 (new)
      expect(getTurnStack().peek()!.turnNumber).toBe(1)
    })

    it('undo-dispatch-undo-dispatch cycle works', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      expect(gameState.snapshot!.turnNumber).toBe(1)

      // Cycle 1: undo and replay
      undo()
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 2 })
      expect(gameState.snapshot!.turnNumber).toBe(1)

      // Cycle 2: undo and replay again
      undo()
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 3 })
      expect(gameState.snapshot!.turnNumber).toBe(1)
      expect(getTurnStack().getLength()).toBe(2) // turn 0 + turn 1
    })

    it('turn stack has no duplicate turn numbers after override', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      undo()
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 2 })

      const history = getTurnHistory()
      const turnNumbers = history.map(e => e.turnNumber)
      const uniqueNumbers = new Set(turnNumbers)
      expect(turnNumbers.length).toBe(uniqueNumbers.size)
    })

    it('getTurnHistory returns clean sequential entries after override', () => {
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      undo()
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 3 })

      const history = getTurnHistory()
      expect(history).toHaveLength(2)
      expect(history[0].turnNumber).toBe(0)
      expect(history[1].turnNumber).toBe(1)
    })

    it('auto-save fires after dispatch following undo', async () => {
      const { saveGame } = await import('../persistence/gameRepository')
      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 1 })
      undo()
      const callsBefore = (saveGame as any).mock.calls.length

      dispatch({ type: 'placeHex', sourceCoord: { q: 0, r: 0 }, diceValue: 2 })
      expect((saveGame as any).mock.calls.length).toBeGreaterThan(callsBefore)
    })
  })

  describe('undo from game-over state', () => {
    it('restores InProgress status when undoing past a game-ending turn', () => {
      // Manually set up a game-over scenario using restoreGame
      const inProgressSnapshot: GameSnapshot = {
        mapId: 'test-map',
        mapDefinition: TEST_MAP,
        hexes: new Map([['0,0', { coord: { q: 0, r: 0 }, status: 'claimed' as any, numbers: [1, 2, 3, 4, 5, 6] }]]),
        turnNumber: 5,
        darkForceTally: 0,
        fortsCaptured: 0,
        totalForts: 0,
        status: GameStatus.InProgress,
      }

      const gameOverSnapshot: GameSnapshot = {
        ...inProgressSnapshot,
        turnNumber: 6,
        darkForceTally: 25,
        status: GameStatus.DarkForceWon,
      }

      const entries: TurnEntry[] = [
        { turnNumber: 5, action: { type: 'placeHex' }, snapshot: inProgressSnapshot, journalEntries: [] },
        { turnNumber: 6, action: { type: 'placeHex' }, snapshot: gameOverSnapshot, journalEntries: [] },
      ]

      restoreGame(gameOverSnapshot, entries)
      expect(gameState.snapshot!.status).toBe(GameStatus.DarkForceWon)

      undo()
      expect(gameState.snapshot!.turnNumber).toBe(5)
      expect(gameState.snapshot!.status).toBe(GameStatus.InProgress)
    })
  })
})

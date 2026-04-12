import type { GameSnapshot, GameAction } from '../types/game.types'
import type { HexState } from '../types/hex.types'
import type { JournalEntry } from '../types/journal.types'

export interface TurnEntry {
  turnNumber: number
  action: GameAction
  snapshot: GameSnapshot
  journalEntries: JournalEntry[]
}

function cloneHexState(state: HexState): HexState {
  return {
    ...state,
    numbers: state.numbers ? [...state.numbers] : undefined,
    armies: state.armies ? [...state.armies] : undefined,
    darkForce: state.darkForce ? [...state.darkForce] : undefined,
  }
}

function cloneSnapshot(snapshot: GameSnapshot): GameSnapshot {
  return {
    ...snapshot,
    hexes: new Map(
      Array.from(snapshot.hexes.entries()).map(([k, v]) => [k, cloneHexState(v)])
    ),
  }
}

export class TurnStack {
  private entries: TurnEntry[] = []

  push(entry: TurnEntry): void {
    this.entries.push({
      ...entry,
      snapshot: cloneSnapshot(entry.snapshot),
      journalEntries: entry.journalEntries.map(j => ({ ...j })),
    })
  }

  peek(): TurnEntry | undefined {
    if (this.entries.length === 0) return undefined
    return this.entries[this.entries.length - 1]
  }

  getAll(): TurnEntry[] {
    return [...this.entries]
  }

  getLength(): number {
    return this.entries.length
  }

  isEmpty(): boolean {
    return this.entries.length === 0
  }

  popTo(turnNumber: number): TurnEntry[] {
    const index = this.entries.findIndex(e => e.turnNumber === turnNumber)
    if (index === -1) {
      return []
    }
    // Remove everything after the target turn
    return this.entries.splice(index + 1)
  }
}

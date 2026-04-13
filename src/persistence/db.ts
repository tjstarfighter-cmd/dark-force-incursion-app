import Dexie, { type EntityTable } from 'dexie'

export interface GameRecord {
  id: string
  mapId: string
  status: string
  snapshotJson: string  // serialized GameSnapshot (Map → array entries)
  turnStackJson: string // serialized TurnEntry[]
  journalEntriesJson?: string // serialized JournalEntry[]
  updatedAt: number     // timestamp
}

export interface ArchiveRecord {
  id: string
  mapId: string
  mapName: string
  outcome: string       // 'player-won' | 'dark-force-won'
  date: number          // timestamp for sorting
  totalTurns: number
  journalCount: number
  snapshotJson: string
  turnStackJson: string
  journalEntriesJson: string
}

const db = new Dexie('DarkForceIncursion') as Dexie & {
  games: EntityTable<GameRecord, 'id'>
  archivedGames: EntityTable<ArchiveRecord, 'id'>
}

db.version(1).stores({
  games: 'id, mapId, status, updatedAt',
})

// v2: adds journalEntriesJson field (no index changes needed)
db.version(2).stores({
  games: 'id, mapId, status, updatedAt',
})

// v3: adds archivedGames table
db.version(3).stores({
  games: 'id, mapId, status, updatedAt',
  archivedGames: 'id, date',
})

export { db }

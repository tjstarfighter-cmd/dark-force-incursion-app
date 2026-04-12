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

const db = new Dexie('DarkForceIncursion') as Dexie & {
  games: EntityTable<GameRecord, 'id'>
}

db.version(1).stores({
  games: 'id, mapId, status, updatedAt',
})

// v2: adds journalEntriesJson field (no index changes needed)
db.version(2).stores({
  games: 'id, mapId, status, updatedAt',
})

export { db }

import Dexie, { type EntityTable } from 'dexie'

export interface GameRecord {
  id: string
  mapId: string
  status: string
  snapshotJson: string  // serialized GameSnapshot (Map → array entries)
  turnStackJson: string // serialized TurnEntry[]
  updatedAt: number     // timestamp
}

const db = new Dexie('DarkForceIncursion') as Dexie & {
  games: EntityTable<GameRecord, 'id'>
}

db.version(1).stores({
  games: 'id, mapId, status, updatedAt',
})

export { db }

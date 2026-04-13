import type { SyncConfig, SyncProvider, SyncStatus } from '../sync/syncTypes'
import { DEFAULT_SYNC_CONFIG } from '../sync/syncTypes'

type DiceMode = 'manual' | 'digital'

let diceMode = $state<DiceMode>('manual')
let syncConfig = $state<SyncConfig>({ ...DEFAULT_SYNC_CONFIG })
let syncStatus = $state<SyncStatus>('disconnected')

// --- Dice Mode ---

export function getDiceMode(): DiceMode {
  return diceMode
}

export function toggleDiceMode(): void {
  diceMode = diceMode === 'manual' ? 'digital' : 'manual'
}

export function setDiceMode(mode: DiceMode): void {
  diceMode = mode
}

// --- Sync Config ---

export function getSyncConfig(): SyncConfig {
  return syncConfig
}

export function getSyncStatus(): SyncStatus {
  return syncStatus
}

export function setSyncProvider(provider: SyncProvider | null): void {
  syncConfig = { ...syncConfig, provider }
}

export function setSyncEnabled(enabled: boolean): void {
  syncConfig = { ...syncConfig, enabled }
}

export function updateSyncStatus(status: SyncStatus): void {
  syncStatus = status
}

export function updateLastSynced(): void {
  syncConfig = { ...syncConfig, lastSyncedAt: Date.now() }
}

export const settingsState = {
  get diceMode() { return diceMode },
  get syncConfig() { return syncConfig },
  get syncStatus() { return syncStatus },
}

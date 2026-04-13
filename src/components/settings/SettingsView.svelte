<script lang="ts">
  import { settingsState, toggleDiceMode, setSyncProvider, setSyncEnabled, updateSyncStatus } from '../../stores/settingsStore.svelte'
  import type { SyncProvider } from '../../sync/syncTypes'
  import { GoogleDriveSyncAdapter } from '../../sync/googleDrive'
  import { setSyncAdapter, syncToCloud, syncFromCloud } from '../../sync/syncEngine'

  interface Props {
    onBack: () => void
  }

  let { onBack }: Props = $props()

  const diceMode = $derived(settingsState.diceMode)
  const syncConfig = $derived(settingsState.syncConfig)
  const syncStatus = $derived(settingsState.syncStatus)
  let connecting = $state(false)

  function handleProviderChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value
    setSyncProvider(value === 'none' ? null : value as SyncProvider)
    if (value === 'none') {
      setSyncAdapter(null)
      updateSyncStatus('disconnected')
      setSyncEnabled(false)
    }
  }

  async function handleConnect() {
    if (syncConfig.provider !== 'google-drive') return
    connecting = true
    try {
      const adapter = new GoogleDriveSyncAdapter()
      const success = await adapter.authenticate()
      if (success) {
        setSyncAdapter(adapter)
        setSyncEnabled(true)
        updateSyncStatus('idle')
        // Initial sync
        await syncFromCloud()
        await syncToCloud()
      }
    } catch (e) {
      console.warn('Connect failed:', e)
      updateSyncStatus('error')
    } finally {
      connecting = false
    }
  }

  async function handleSync() {
    updateSyncStatus('syncing')
    try {
      await syncFromCloud()
      await syncToCloud()
      updateSyncStatus('idle')
    } catch {
      updateSyncStatus('error')
    }
  }
</script>

<div class="settings-view">
  <div class="settings-header">
    <button class="back-btn" onclick={onBack} aria-label="Back">&larr;</button>
    <h2>Settings</h2>
  </div>

  <div class="settings-section">
    <h3>Dice Input</h3>
    <label class="setting-row">
      <span>Digital dice roller</span>
      <input
        type="checkbox"
        checked={diceMode === 'digital'}
        onchange={toggleDiceMode}
      />
    </label>
  </div>

  <div class="settings-section">
    <h3>Cloud Sync</h3>

    <label class="setting-row">
      <span>Provider</span>
      <select
        value={syncConfig.provider ?? 'none'}
        onchange={handleProviderChange}
      >
        <option value="none">Local only</option>
        <option value="google-drive">Google Drive</option>
        <option value="dropbox">Dropbox</option>
      </select>
    </label>

    {#if syncConfig.provider}
      <div class="sync-status-row">
        <span class="status-label">Status:</span>
        <span class="status-value" class:error={syncStatus === 'error'}>{syncStatus}</span>
      </div>

      {#if syncConfig.enabled}
        <button class="action-btn" onclick={handleSync} disabled={syncStatus === 'syncing'}>
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
      {:else if syncConfig.provider === 'google-drive'}
        <button class="action-btn" onclick={handleConnect} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect Google Drive'}
        </button>
      {:else}
        <p class="sync-notice">Dropbox sync coming soon.</p>
      {/if}

      <label class="setting-row">
        <span>Enable sync</span>
        <input
          type="checkbox"
          checked={syncConfig.enabled}
          onchange={() => setSyncEnabled(!syncConfig.enabled)}
        />
      </label>
    {:else}
      <p class="sync-hint">All data is stored locally on this device.</p>
    {/if}
  </div>

  <div class="settings-section">
    <h3>About</h3>
    <p class="about-text">Dark Force Incursion Companion App</p>
    <p class="about-text muted">Calosanti Region - Mountain Maps Series 1</p>
  </div>
</div>

<style>
  .settings-view {
    min-height: 100svh;
    background: var(--color-bg-app, #1a1a2e);
    padding: var(--space-md, 16px);
  }

  .settings-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    margin-bottom: var(--space-lg, 24px);
  }

  .settings-header h2 {
    margin: 0;
    font-family: var(--font-display, 'Cinzel', serif);
    font-size: var(--text-h2, 1.25rem);
    color: var(--color-text-primary, #e8e0d0);
  }

  .back-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-sm, 4px);
    color: var(--color-text-secondary, #a0a0b0);
    font-size: 1.2rem;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .settings-section {
    margin-bottom: var(--space-lg, 24px);
    padding-bottom: var(--space-md, 16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .settings-section h3 {
    margin: 0 0 var(--space-sm, 8px);
    font-family: var(--font-display, 'Cinzel', serif);
    font-size: var(--text-body, 1rem);
    color: var(--color-text-primary, #e8e0d0);
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-sm, 8px) 0;
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-body, 1rem);
    color: var(--color-text-primary, #e8e0d0);
    cursor: pointer;
  }

  .setting-row select {
    background: var(--color-bg-surface, #25253e);
    color: var(--color-text-primary, #e8e0d0);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-sm, 4px);
    padding: var(--space-xs, 4px) var(--space-sm, 8px);
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    min-height: 36px;
  }

  .sync-status-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-xs, 4px) 0;
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
  }

  .status-label {
    color: var(--color-text-secondary, #a0a0b0);
  }

  .status-value {
    color: var(--color-text-primary, #e8e0d0);
    text-transform: capitalize;
  }

  .status-value.error {
    color: #8b4a4a;
  }

  .action-btn {
    margin: var(--space-sm, 8px) 0;
    padding: var(--space-xs, 4px) var(--space-md, 16px);
    min-height: 36px;
    background: transparent;
    border: 1px solid var(--color-hex-claimed, #d4a574);
    border-radius: var(--border-radius-sm, 4px);
    color: var(--color-hex-claimed, #d4a574);
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    cursor: pointer;
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .sync-notice {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-hex-claimed, #d4a574);
    font-style: italic;
    margin: var(--space-xs, 4px) 0;
  }

  .sync-hint {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-secondary, #a0a0b0);
    margin: var(--space-xs, 4px) 0;
  }

  .about-text {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-primary, #e8e0d0);
    margin: 2px 0;
  }

  .about-text.muted {
    color: var(--color-text-secondary, #a0a0b0);
  }
</style>

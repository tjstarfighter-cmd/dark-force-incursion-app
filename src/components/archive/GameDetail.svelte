<script lang="ts">
  import type { GameSnapshot } from '../../types/game.types'
  import { GameStatus } from '../../types/game.types'
  import type { JournalEntry } from '../../types/journal.types'
  import type { ArchiveMetadata } from '../../persistence/gameRepository'
  import HexGrid from '../hex-grid/HexGrid.svelte'

  interface Props {
    snapshot: GameSnapshot
    journalEntries: JournalEntry[]
    metadata: ArchiveMetadata
    onBack: () => void
  }

  let { snapshot, journalEntries, metadata, onBack }: Props = $props()

  const isVictory = $derived(snapshot.status === GameStatus.PlayerWon)

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
</script>

<div class="game-detail">
  <div class="detail-header">
    <button class="back-btn" onclick={onBack} aria-label="Back to archive">&larr;</button>
    <div>
      <h2>{metadata.mapName}</h2>
      <span class="detail-date">{formatDate(metadata.date)}</span>
    </div>
    <span class="outcome-badge" class:win={isVictory} class:loss={!isVictory}>
      {isVictory ? 'Victory' : 'Defeat'}
    </span>
  </div>

  <div class="map-container">
    <HexGrid
      mapDefinition={snapshot.mapDefinition}
      hexStates={snapshot.hexes}
      readonly={true}
    />
  </div>

  <div class="stats-row">
    <div class="stat">
      <span class="stat-value">{metadata.totalTurns}</span>
      <span class="stat-label">Turns</span>
    </div>
    <div class="stat">
      <span class="stat-value">{snapshot.fortsCaptured}/{snapshot.totalForts}</span>
      <span class="stat-label">Forts</span>
    </div>
    <div class="stat">
      <span class="stat-value">{snapshot.darkForceTally}</span>
      <span class="stat-label">Dark Force</span>
    </div>
    <div class="stat">
      <span class="stat-value">{metadata.journalCount}</span>
      <span class="stat-label">Entries</span>
    </div>
  </div>

  {#if journalEntries.length > 0}
    <div class="journal-section">
      <h3>Campaign Journal</h3>
      {#each journalEntries as entry (entry.id)}
        <div class="journal-entry">
          <span class="entry-turn">
            {entry.scope === 'session' ? 'Session' : `Turn ${entry.turnNumber}`}
          </span>
          <p class="entry-text">{entry.text}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .game-detail {
    min-height: 100svh;
    background: var(--color-bg-app, #1a1a2e);
    overflow-y: auto;
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-md, 16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .detail-header h2 {
    margin: 0;
    font-family: var(--font-display, 'Cinzel', serif);
    font-size: var(--text-h2, 1.25rem);
    color: var(--color-text-primary, #e8e0d0);
  }

  .detail-date {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-secondary, #a0a0b0);
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
    flex-shrink: 0;
  }

  .outcome-badge {
    margin-left: auto;
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .outcome-badge.win { color: #4a8c5c; }
  .outcome-badge.loss { color: #8b4a4a; }

  .map-container {
    height: 40vh;
    min-height: 200px;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .stats-row {
    display: flex;
    justify-content: center;
    gap: var(--space-lg, 24px);
    padding: var(--space-md, 16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-value {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-h2, 1.25rem);
    font-weight: 600;
    color: var(--color-text-primary, #e8e0d0);
  }

  .stat-label {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-secondary, #a0a0b0);
  }

  .journal-section {
    padding: var(--space-md, 16px);
  }

  .journal-section h3 {
    margin: 0 0 var(--space-sm, 8px);
    font-family: var(--font-display, 'Cinzel', serif);
    font-size: var(--text-body, 1rem);
    color: var(--color-text-primary, #e8e0d0);
  }

  .journal-entry {
    padding: var(--space-xs, 4px) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .entry-turn {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-secondary, #a0a0b0);
  }

  .entry-text {
    margin: 2px 0 0;
    font-family: var(--font-display, 'Cinzel', serif);
    font-style: italic;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-text-primary, #e8e0d0);
  }
</style>

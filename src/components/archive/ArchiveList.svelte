<script lang="ts">
  import type { ArchiveMetadata } from '../../persistence/gameRepository'

  interface Props {
    archives: ArchiveMetadata[]
    onSelectGame: (id: string) => void
    onBack: () => void
  }

  let { archives, onSelectGame, onBack }: Props = $props()

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function outcomeLabel(outcome: string): string {
    return outcome === 'player-won' ? 'Victory' : 'Defeat'
  }
</script>

<div class="archive-view">
  <div class="archive-header">
    <button class="back-btn" onclick={onBack} aria-label="Back">&larr;</button>
    <h2>Campaign Archive</h2>
  </div>

  {#if archives.length === 0}
    <p class="empty-state">No campaigns yet.</p>
  {:else}
    <div class="archive-grid">
      {#each archives as game (game.id)}
        <button
          class="archive-card"
          class:win={game.outcome === 'player-won'}
          class:loss={game.outcome !== 'player-won'}
          onclick={() => onSelectGame(game.id)}
        >
          <div class="card-header">
            <span class="map-name">{game.mapName}</span>
            <span class="outcome-badge">{outcomeLabel(game.outcome)}</span>
          </div>
          <span class="card-date">{formatDate(game.date)}</span>
          <div class="card-stats">
            <span>{game.totalTurns} turns</span>
            <span>{game.journalCount} entries</span>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .archive-view {
    min-height: 100svh;
    background: var(--color-bg-app, #1a1a2e);
    padding: var(--space-md, 16px);
  }

  .archive-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    margin-bottom: var(--space-md, 16px);
  }

  .archive-header h2 {
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

  .empty-state {
    text-align: center;
    color: var(--color-text-secondary, #a0a0b0);
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-body, 1rem);
    margin-top: 30vh;
  }

  .archive-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-sm, 8px);
  }

  .archive-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
    padding: var(--space-md, 16px);
    background: var(--color-bg-surface, #25253e);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--border-radius-md, 8px);
    cursor: pointer;
    text-align: left;
    border-left: 3px solid transparent;
  }

  .archive-card.win {
    border-left-color: #4a8c5c;
  }

  .archive-card.loss {
    border-left-color: #8b4a4a;
  }

  .archive-card:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .map-name {
    font-family: var(--font-display, 'Cinzel', serif);
    font-size: var(--text-body, 1rem);
    color: var(--color-text-primary, #e8e0d0);
  }

  .outcome-badge {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .win .outcome-badge {
    color: #4a8c5c;
  }

  .loss .outcome-badge {
    color: #8b4a4a;
  }

  .card-date {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-secondary, #a0a0b0);
  }

  .card-stats {
    display: flex;
    gap: var(--space-md, 16px);
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-secondary, #a0a0b0);
  }

  @media (min-width: 1024px) {
    .archive-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>

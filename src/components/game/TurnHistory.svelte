<script lang="ts">
  import type { TurnEntry } from '../../engine/turnStack'

  interface Props {
    entries: TurnEntry[]
    currentTurn: number
    onSelectTurn: (turnNumber: number) => void
    onClose: () => void
  }

  let { entries, currentTurn, onSelectTurn, onClose }: Props = $props()

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  function describeAction(entry: TurnEntry): string {
    if (entry.turnNumber === 0) return 'Game started'
    const action = entry.action
    if (action.diceValue) return `Rolled ${action.diceValue}`
    return 'Turn'
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="turn-history-backdrop" onclick={handleBackdropClick} role="presentation">
  <div class="turn-history-panel" role="dialog" aria-label="Turn History">
    <div class="turn-history-header">
      <h3>Turn History</h3>
      <button class="close-btn" onclick={onClose} aria-label="Close turn history">&times;</button>
    </div>
    <ul class="turn-list">
      {#each entries as entry (entry.turnNumber)}
        <li>
          <button
            class="turn-item"
            class:current={entry.turnNumber === currentTurn}
            disabled={entry.turnNumber === currentTurn}
            onclick={() => onSelectTurn(entry.turnNumber)}
          >
            <span class="turn-number">Turn {entry.turnNumber}</span>
            <span class="turn-desc">{describeAction(entry)}</span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .turn-history-backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--z-overlay, 200);
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .turn-history-panel {
    background: var(--color-bg-surface, #25253e);
    border-top-left-radius: var(--border-radius-lg, 12px);
    border-top-right-radius: var(--border-radius-lg, 12px);
    width: 100%;
    max-height: 50vh;
    display: flex;
    flex-direction: column;
    padding-bottom: 56px; /* clear control strip */
  }

  .turn-history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-sm, 8px) var(--space-md, 16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .turn-history-header h3 {
    margin: 0;
    font-family: var(--font-display, 'Cinzel', serif);
    font-size: var(--text-body, 1rem);
    color: var(--color-text-primary, #e8e0d0);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--color-text-secondary, #a0a0b0);
    font-size: 1.5rem;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .turn-list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
  }

  .turn-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    width: 100%;
    padding: var(--space-sm, 8px) var(--space-md, 16px);
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: var(--color-text-primary, #e8e0d0);
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    cursor: pointer;
    text-align: left;
    min-height: 44px;
  }

  .turn-item:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
  }

  .turn-item.current {
    opacity: 0.5;
    cursor: default;
  }

  .turn-number {
    font-weight: 600;
    min-width: 4em;
  }

  .turn-desc {
    color: var(--color-text-secondary, #a0a0b0);
  }

  @media (min-width: 1024px) {
    .turn-history-panel {
      max-width: 400px;
      margin-bottom: 56px;
    }
  }
</style>

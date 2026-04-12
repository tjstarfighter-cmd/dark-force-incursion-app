<script lang="ts">
  interface Props {
    turnNumber: number
    armiesGained: number
    sourceBlocked: boolean
  }

  let { turnNumber, armiesGained, sourceBlocked }: Props = $props()

  let expanded = $state(false)

  let summaryText = $derived.by(() => {
    const parts: string[] = []
    if (armiesGained > 0) parts.push(`+${armiesGained} Army`)
    if (sourceBlocked) parts.push('Source blocked')
    if (parts.length === 0) parts.push('No armies')
    return `Turn ${turnNumber}: ${parts.join(', ')}`
  })
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="turn-summary" class:expanded onclick={() => expanded = !expanded}>
  <span class="summary-text">{summaryText}</span>
  {#if expanded}
    <div class="detail">
      <p>Armies gained this turn: {armiesGained}</p>
      {#if sourceBlocked}
        <p>Source hex was blocked (off-map or terrain)</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .turn-summary {
    position: fixed;
    bottom: 48px;
    left: 0;
    right: 0;
    z-index: var(--z-chrome);
    background: rgba(26, 26, 46, 0.75);
    backdrop-filter: var(--backdrop-blur);
    -webkit-backdrop-filter: var(--backdrop-blur);
    padding: var(--space-xs) var(--space-md);
    text-align: center;
    cursor: pointer;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .summary-text {
    font-family: var(--font-data);
    font-size: var(--text-caption);
    color: var(--color-text-primary);
  }

  .detail {
    padding-top: var(--space-xs);
  }

  .detail p {
    margin: 0;
    font-family: var(--font-data);
    font-size: var(--text-caption);
    color: var(--color-text-secondary);
  }

  @media (min-width: 1024px) {
    .turn-summary {
      right: 30%;
    }
  }
</style>

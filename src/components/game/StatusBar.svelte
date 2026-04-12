<script lang="ts">
  interface Props {
    turnNumber: number
    darkForceTally: number
    fortsCaptured: number
    totalForts: number
  }

  let { turnNumber, darkForceTally, fortsCaptured, totalForts }: Props = $props()
</script>

<div class="status-bar" aria-live="polite">
  <span class="status-item">Turn {turnNumber}</span>
  <span class="status-item df-tally">Dark Force: {darkForceTally}</span>
  <span class="status-item">Forts: {fortsCaptured}/{totalForts}</span>
</div>

<style>
  .status-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    z-index: var(--z-chrome);
    background: rgba(26, 26, 46, 0.85);
    backdrop-filter: var(--backdrop-blur);
    -webkit-backdrop-filter: var(--backdrop-blur);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-lg);
    padding: 0 var(--space-md);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .status-item {
    font-family: var(--font-data);
    font-size: var(--text-caption);
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  .df-tally {
    color: var(--color-text-secondary);
  }

  @media (min-width: 1024px) {
    .status-bar {
      right: 30%;
    }
  }
</style>

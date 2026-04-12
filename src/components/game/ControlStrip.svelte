<script lang="ts">
  // All buttons disabled for now — functionality added in later epics
</script>

<div class="control-strip">
  <button class="ctrl-btn" disabled title="Undo (Epic 4)">Undo</button>
  <button class="ctrl-btn" disabled title="Journal (Epic 5)">Journal</button>
  <button class="ctrl-btn" disabled title="Rules (Epic 4)">Rules</button>
  <button class="ctrl-btn" disabled title="Settings">Menu</button>
</div>

<style>
  .control-strip {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 48px;
    z-index: var(--z-chrome);
    background: rgba(26, 26, 46, 0.85);
    backdrop-filter: var(--backdrop-blur);
    -webkit-backdrop-filter: var(--backdrop-blur);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    padding: 0 var(--space-md);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .ctrl-btn {
    min-width: 44px;
    min-height: 44px;
    padding: var(--space-xs) var(--space-sm);
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-sm);
    font-family: var(--font-data);
    font-size: var(--text-caption);
    cursor: pointer;
    touch-action: manipulation;
  }

  .ctrl-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  @media (min-width: 1024px) {
    .control-strip {
      right: 30%;
    }
  }
</style>

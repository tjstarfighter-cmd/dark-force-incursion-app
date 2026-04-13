<script lang="ts">
  interface Props {
    canUndo?: boolean
    onUndo?: () => void
    onTurnHistoryOpen?: () => void
    onRulesOpen?: () => void
    onJournalOpen?: () => void
    onSettingsOpen?: () => void
  }

  let { canUndo = false, onUndo, onTurnHistoryOpen, onRulesOpen, onJournalOpen, onSettingsOpen }: Props = $props()

  let longPressTimer: ReturnType<typeof setTimeout> | null = null

  function handleUndoPointerDown() {
    if (!canUndo) return
    longPressTimer = setTimeout(() => {
      longPressTimer = null
      onTurnHistoryOpen?.()
    }, 500)
  }

  function handleUndoPointerUp() {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer)
      longPressTimer = null
      onUndo?.()
    }
  }

  function handleUndoPointerLeave() {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }
</script>

<div class="control-strip">
  <button
    class="ctrl-btn"
    class:disabled={!canUndo}
    aria-disabled={!canUndo}
    title="Undo"
    onpointerdown={handleUndoPointerDown}
    onpointerup={handleUndoPointerUp}
    onpointerleave={handleUndoPointerLeave}
    onpointercancel={handleUndoPointerLeave}
  >Undo</button>
  <button class="ctrl-btn" title="Journal" onclick={() => onJournalOpen?.()}>Journal</button>
  <button class="ctrl-btn" title="Rules" onclick={() => onRulesOpen?.()}>Rules</button>
  <button class="ctrl-btn" title="Settings" onclick={() => onSettingsOpen?.()}>Menu</button>
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

  .ctrl-btn:disabled,
  .ctrl-btn.disabled {
    opacity: 0.4;
    cursor: default;
  }

  @media (min-width: 1024px) {
    .control-strip {
      right: 30%;
    }
  }
</style>

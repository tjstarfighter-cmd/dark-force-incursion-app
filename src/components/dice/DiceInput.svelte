<script lang="ts">
  import { getDiceMode, toggleDiceMode } from '../../stores/settingsStore.svelte'
  import DiceRoller from './DiceRoller.svelte'

  interface Props {
    visible: boolean
    onRoll: (value: number) => void
    onClose: () => void
  }

  let { visible, onRoll, onClose }: Props = $props()

  let diceRollerRef: DiceRoller | undefined = $state()

  const mode = $derived(getDiceMode())

  function handleManualRoll(value: number) {
    onRoll(value)
  }

  function handleDigitalRoll(value: number) {
    onRoll(value)
  }

  function handleToggle() {
    toggleDiceMode()
  }

  // Keyboard input: keys 1-6 in manual mode
  function handleKeydown(e: KeyboardEvent) {
    if (!visible) return
    if (mode !== 'manual') return
    if (e.repeat) return

    const num = parseInt(e.key)
    if (num >= 1 && num <= 6) {
      e.preventDefault()
      handleManualRoll(num)
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const numbers: number[] = [1, 2, 3, 4, 5, 6]
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dice-input-panel"
  class:visible
  onclick={(e) => e.stopPropagation()}
>
  <div class="dice-input-content">
    <!-- Mode toggle -->
    <div class="mode-toggle">
      <button
        class="mode-btn"
        class:active={mode === 'manual'}
        onclick={() => { if (mode !== 'manual') handleToggle() }}
      >Manual</button>
      <button
        class="mode-btn"
        class:active={mode === 'digital'}
        onclick={() => { if (mode !== 'digital') handleToggle() }}
      >Digital</button>
    </div>

    {#if mode === 'manual'}
      <!-- Manual mode: 6 number buttons -->
      <div class="number-buttons">
        {#each numbers as num}
          <button
            class="number-btn"
            onclick={() => handleManualRoll(num)}
          >{num}</button>
        {/each}
      </div>
    {:else}
      <!-- Digital mode: Roll button with animation -->
      <DiceRoller bind:this={diceRollerRef} onRoll={handleDigitalRoll} />
    {/if}
  </div>
</div>

<style>
  .dice-input-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(100%);
    transition: transform var(--duration-panel-transition) var(--easing-default);
    z-index: var(--z-dice);
    background: rgba(26, 26, 46, 0.9);
    backdrop-filter: var(--backdrop-blur);
    -webkit-backdrop-filter: var(--backdrop-blur);
    padding: var(--space-md) var(--space-md) var(--space-xl);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dice-input-panel.visible {
    transform: translateY(0);
  }

  .dice-input-content {
    max-width: 400px;
    margin: 0 auto;
  }

  .mode-toggle {
    display: flex;
    justify-content: center;
    gap: var(--space-xs);
    margin-bottom: var(--space-md);
  }

  .mode-btn {
    padding: var(--space-xs) var(--space-md);
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: var(--border-radius-sm);
    font-family: var(--font-data);
    font-size: var(--text-caption);
    cursor: pointer;
    touch-action: manipulation;
  }

  .mode-btn.active {
    color: var(--color-text-primary);
    background: rgba(212, 160, 64, 0.2);
    border-color: var(--color-accent);
  }

  .number-buttons {
    display: flex;
    justify-content: center;
    gap: var(--space-sm);
  }

  .number-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(212, 160, 64, 0.15);
    color: var(--color-text-primary);
    border: 2px solid var(--color-accent);
    border-radius: var(--border-radius-md);
    font-family: var(--font-data);
    font-size: var(--text-h1);
    font-weight: var(--weight-semibold);
    cursor: pointer;
    touch-action: manipulation;
    transition: background 0.1s ease;
  }

  .number-btn:active {
    background: var(--color-accent);
    color: var(--color-bg-app);
    transform: scale(0.93);
  }

  @media (min-width: 1024px) {
    .dice-input-panel {
      left: 0;
      right: 30%;
    }
  }
</style>

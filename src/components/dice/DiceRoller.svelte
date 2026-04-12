<script lang="ts">
  interface Props {
    onRoll: (value: number) => void
  }

  let { onRoll }: Props = $props()

  let displayNumber = $state(0)
  let rolling = $state(false)
  let showResult = $state(false)

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  export function roll() {
    if (rolling || showResult) return
    const result = Math.floor(Math.random() * 6) + 1

    if (prefersReducedMotion) {
      displayNumber = result
      showResult = true
      setTimeout(() => {
        showResult = false
        onRoll(result)
      }, 800)
      return
    }

    rolling = true
    let ticks = 0
    const maxTicks = 15
    const interval = setInterval(() => {
      displayNumber = Math.floor(Math.random() * 6) + 1
      ticks++
      if (ticks >= maxTicks) {
        clearInterval(interval)
        displayNumber = result
        rolling = false
        showResult = true
        setTimeout(() => {
          showResult = false
          onRoll(result)
        }, 800)
      }
    }, 50)
  }
</script>

<div class="dice-roller">
  <button
    class="roll-button"
    class:result={showResult}
    onclick={roll}
    disabled={rolling || showResult}
  >
    {#if rolling}
      <span class="dice-number rolling">{displayNumber}</span>
    {:else if showResult}
      <span class="dice-number result">{displayNumber}</span>
    {:else}
      Roll
    {/if}
  </button>
</div>

<style>
  .dice-roller {
    display: flex;
    justify-content: center;
    padding: var(--space-md);
  }

  .roll-button {
    min-width: 120px;
    min-height: 48px;
    padding: var(--space-sm) var(--space-xl);
    background: var(--color-accent);
    color: var(--color-bg-app);
    border: none;
    border-radius: var(--border-radius-md);
    font-family: var(--font-heading);
    font-size: var(--text-h2);
    font-weight: var(--weight-semibold);
    cursor: pointer;
    touch-action: manipulation;
  }

  .roll-button:disabled {
    cursor: default;
  }

  .roll-button.result {
    background: var(--color-success);
    transform: scale(1.1);
    transition: transform 0.15s ease;
  }

  .roll-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  .dice-number {
    font-family: var(--font-data);
    font-size: var(--text-h1);
    font-weight: var(--weight-semibold);
  }

  .dice-number.rolling {
    animation: shake 0.1s infinite;
  }

  .dice-number.result {
    font-size: var(--text-display);
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .dice-number.rolling {
      animation: none;
    }
  }
</style>

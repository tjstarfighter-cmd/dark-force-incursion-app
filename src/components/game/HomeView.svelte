<script lang="ts">
  interface Props {
    onStartGame: () => void
  }

  let { onStartGame }: Props = $props()
</script>

<div class="home-view">
  <h1 class="title">Dark Force Incursion</h1>
  <p class="subtitle">Calosanti Region</p>
  <button class="start-button" onclick={onStartGame}>
    New Campaign
  </button>
</div>

<style>
  .home-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100svh;
    padding: var(--space-xl);
    background-color: var(--color-bg-app);
  }

  .title {
    font-family: var(--font-heading);
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    font-weight: var(--weight-regular);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-sm);
    text-align: center;
    letter-spacing: 0.05em;
  }

  .subtitle {
    font-family: var(--font-body);
    font-size: var(--text-body);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-xl);
  }

  .start-button {
    padding: var(--space-md) var(--space-xl);
    background: var(--color-accent);
    color: var(--color-bg-app);
    border: none;
    border-radius: var(--border-radius-md);
    font-family: var(--font-heading);
    font-size: var(--text-h2);
    cursor: pointer;
    touch-action: manipulation;
    min-width: 200px;
    min-height: 48px;
  }

  .start-button:active {
    transform: scale(0.97);
  }
</style>

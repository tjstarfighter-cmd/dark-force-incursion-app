<script lang="ts">
  import { GameStatus } from '../../types/game.types'

  interface Props {
    status: GameStatus
    turnNumber: number
    fortsCaptured: number
    totalForts: number
    darkForceTally: number
    onNewCampaign: () => void
  }

  let { status, turnNumber, fortsCaptured, totalForts, darkForceTally, onNewCampaign }: Props = $props()

  const isVictory = $derived(status === GameStatus.PlayerWon)
  const title = $derived(isVictory ? 'Campaign Won' : 'Campaign Lost')
  const subtitle = $derived(isVictory
    ? 'The forts are secured. Your people are safe.'
    : darkForceTally >= 25
      ? 'The Dark Force has overrun your lands.'
      : 'All forts have fallen to the enemy.')
</script>

<div class="game-over" class:victory={isVictory}>
  <div class="content">
    <h1 class="title">{title}</h1>
    <p class="subtitle">{subtitle}</p>

    <div class="stats">
      <div class="stat">
        <span class="stat-value">{turnNumber}</span>
        <span class="stat-label">Turns</span>
      </div>
      <div class="stat">
        <span class="stat-value">{fortsCaptured}/{totalForts}</span>
        <span class="stat-label">Forts</span>
      </div>
      <div class="stat">
        <span class="stat-value">{darkForceTally}</span>
        <span class="stat-label">Dark Force</span>
      </div>
    </div>

    <button class="new-campaign-btn" onclick={onNewCampaign}>
      New Campaign
    </button>
  </div>
</div>

<style>
  .game-over {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal);
    background: rgba(26, 26, 46, 0.92);
    backdrop-filter: var(--backdrop-blur);
    -webkit-backdrop-filter: var(--backdrop-blur);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    text-align: center;
    padding: var(--space-xl);
    max-width: 360px;
  }

  .title {
    font-family: var(--font-heading);
    font-size: clamp(1.5rem, 5vw, 2rem);
    margin: 0 0 var(--space-sm);
    color: var(--color-text-secondary);
  }

  .victory .title {
    color: var(--color-accent);
  }

  .subtitle {
    font-family: var(--font-body);
    font-size: var(--text-body);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-xl);
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  .stat-value {
    font-family: var(--font-data);
    font-size: var(--text-h1);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
  }

  .stat-label {
    font-family: var(--font-data);
    font-size: var(--text-caption);
    color: var(--color-text-secondary);
  }

  .new-campaign-btn {
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

  .new-campaign-btn:active {
    transform: scale(0.97);
  }
</style>

<script lang="ts">
  import type { HexCoord, HexEdge } from './types/hex.types'
  import { HexStatus } from './types/hex.types'
  import { GameStatus } from './types/game.types'
  import { hexToKey } from './engine/hexMath'
  import HexGrid from './components/hex-grid/HexGrid.svelte'
  import DiceInput from './components/dice/DiceInput.svelte'
  import HomeView from './components/game/HomeView.svelte'
  import GameOver from './components/game/GameOver.svelte'
  import StatusBar from './components/game/StatusBar.svelte'
  import ControlStrip from './components/game/ControlStrip.svelte'
  import TurnSummary from './components/game/TurnSummary.svelte'
  import { CALOSANTI_MAP } from './maps/calosanti'
  import { startGame, dispatch, gameState, tryResumeGame } from './stores/gameStore.svelte'

  const snapshot = $derived(gameState.snapshot)
  const isInitialized = $derived(gameState.isInitialized)

  // Try to resume a saved game on app load
  tryResumeGame()

  // Dice input state
  let diceInputVisible = $state(false)
  let pendingSourceCoord = $state<HexCoord | null>(null)
  let hexGridRef: HexGrid | undefined = $state()

  // Track last placed hex for animation
  let lastPlacedHexKey = $state<string | null>(null)

  // Turn summary state
  let lastTurnNumber = $state(0)
  let lastArmiesGained = $state(0)
  let lastDarkForceGained = $state(0)
  let lastHexBlocked = $state(false)
  let lastSourceBlocked = $state(false)
  let showTurnSummary = $state(false)

  function handleStartGame() {
    startGame(CALOSANTI_MAP)
    showTurnSummary = false
    lastTurnNumber = 0
  }

  function handleHexSelected(coord: HexCoord) {
    pendingSourceCoord = coord
    diceInputVisible = true
  }

  function handleRoll(diceValue: number) {
    if (!pendingSourceCoord) return

    const prevSnapshot = snapshot
    const prevTurn = prevSnapshot?.turnNumber ?? 0

    const result = dispatch({
      type: 'placeHex',
      sourceCoord: pendingSourceCoord,
      diceValue,
    })

    if (result.ok) {
      const newSnapshot = gameState.snapshot
      if (newSnapshot && newSnapshot.turnNumber > prevTurn) {
        // Determine what happened this turn
        let armiesGained = 0
        let sourceBlocked = false
        let hexBlocked = false

        for (const [key, state] of newSnapshot.hexes) {
          const prev = prevSnapshot?.hexes.get(key)
          // Count new army edges
          const prevArmyCount = prev?.armies?.length ?? 0
          const newArmyCount = state.armies?.length ?? 0
          armiesGained += Math.max(0, newArmyCount - prevArmyCount)
          // Check if source was blocked (off-map/terrain — source hex changes from claimed to blocked)
          if (key === hexToKey(pendingSourceCoord!) && prev?.status === HexStatus.Claimed && state.status === HexStatus.Blocked) {
            sourceBlocked = true
          }
          // Check if a new blocked hex was placed (occupied target clockwise placement)
          if (!prev && state.status === HexStatus.Blocked) {
            hexBlocked = true
          }
          // Detect newly placed/changed hex for animation
          if (!prev || prev.status !== state.status) {
            lastPlacedHexKey = key
            setTimeout(() => { lastPlacedHexKey = null }, 700)
          }
        }

        // Dark force gained this turn
        const prevDF = prevSnapshot?.darkForceTally ?? 0
        const newDF = newSnapshot.darkForceTally

        // Army count is per-edge, but each army is a pair — divide by 2
        lastArmiesGained = Math.floor(armiesGained / 2)
        lastDarkForceGained = newDF - prevDF
        lastHexBlocked = hexBlocked
        lastSourceBlocked = sourceBlocked
        lastTurnNumber = newSnapshot.turnNumber
        showTurnSummary = true
      }

      diceInputVisible = false
      pendingSourceCoord = null
      hexGridRef?.clearSelection()
    } else {
      console.warn('Rule violation:', result.reason)
    }
  }

  function handleDiceClose() {
    diceInputVisible = false
    pendingSourceCoord = null
  }
</script>

{#if !isInitialized}
  <!-- Waiting for persistence check -->
{:else if snapshot}
  <StatusBar
    turnNumber={snapshot.turnNumber}
    darkForceTally={snapshot.darkForceTally}
    darkForceLimit={snapshot.mapDefinition.darkForceLimit}
    fortsCaptured={snapshot.fortsCaptured}
    totalForts={snapshot.totalForts}
  />

  <HexGrid
    bind:this={hexGridRef}
    mapDefinition={snapshot.mapDefinition}
    hexStates={snapshot.hexes}
    onHexSelected={handleHexSelected}
    {lastPlacedHexKey}
  />

  {#if showTurnSummary && lastTurnNumber > 0}
    <TurnSummary
      turnNumber={lastTurnNumber}
      armiesGained={lastArmiesGained}
      darkForceGained={lastDarkForceGained}
      hexBlocked={lastHexBlocked}
      sourceBlocked={lastSourceBlocked}
    />
  {/if}

  <ControlStrip />

  <DiceInput
    visible={diceInputVisible}
    onRoll={handleRoll}
    onClose={handleDiceClose}
  />

  {#if snapshot.status !== GameStatus.InProgress}
    <GameOver
      status={snapshot.status}
      turnNumber={snapshot.turnNumber}
      fortsCaptured={snapshot.fortsCaptured}
      totalForts={snapshot.totalForts}
      darkForceTally={snapshot.darkForceTally}
      onNewCampaign={handleStartGame}
    />
  {/if}
{:else}
  <HomeView onStartGame={handleStartGame} />
{/if}

<style>
  :global(body) {
    overflow: hidden;
  }
</style>

<script lang="ts">
  import type { HexCoord, HexEdge } from './types/hex.types'
  import { HexStatus } from './types/hex.types'
  import HexGrid from './components/hex-grid/HexGrid.svelte'
  import DiceInput from './components/dice/DiceInput.svelte'
  import HomeView from './components/game/HomeView.svelte'
  import StatusBar from './components/game/StatusBar.svelte'
  import ControlStrip from './components/game/ControlStrip.svelte'
  import TurnSummary from './components/game/TurnSummary.svelte'
  import { CALOSANTI_MAP } from './maps/calosanti'
  import { startGame, dispatch, gameState } from './stores/gameStore.svelte'

  const snapshot = $derived(gameState.snapshot)

  // Dice input state
  let diceInputVisible = $state(false)
  let pendingSourceCoord = $state<HexCoord | null>(null)
  let hexGridRef: HexGrid | undefined = $state()

  // Track last placed hex for animation
  let lastPlacedHexKey = $state<string | null>(null)

  // Turn summary state
  let lastTurnNumber = $state(0)
  let lastArmiesGained = $state(0)
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

        for (const [key, state] of newSnapshot.hexes) {
          const prev = prevSnapshot?.hexes.get(key)
          // Count new army edges
          const prevArmyCount = prev?.armies?.length ?? 0
          const newArmyCount = state.armies?.length ?? 0
          armiesGained += Math.max(0, newArmyCount - prevArmyCount)
          // Check if source was blocked
          if (prev?.status === HexStatus.Claimed && state.status === HexStatus.Blocked) {
            sourceBlocked = true
          }
          // Detect newly placed hex for animation
          if (!prev || prev.status !== state.status) {
            lastPlacedHexKey = key
            setTimeout(() => { lastPlacedHexKey = null }, 700)
          }
        }

        // Army count is per-edge, but each army is a pair — divide by 2
        lastArmiesGained = Math.floor(armiesGained / 2)
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

{#if snapshot}
  <StatusBar
    turnNumber={snapshot.turnNumber}
    darkForceTally={snapshot.darkForceTally}
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
      sourceBlocked={lastSourceBlocked}
    />
  {/if}

  <ControlStrip />

  <DiceInput
    visible={diceInputVisible}
    onRoll={handleRoll}
    onClose={handleDiceClose}
  />
{:else}
  <HomeView onStartGame={handleStartGame} />
{/if}

<style>
  :global(body) {
    overflow: hidden;
  }
</style>

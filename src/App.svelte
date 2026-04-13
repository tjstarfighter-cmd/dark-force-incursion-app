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
  import TurnHistory from './components/game/TurnHistory.svelte'
  import RulesReference from './components/rules/RulesReference.svelte'
  import JournalPanel from './components/journal/JournalPanel.svelte'
  import ArchiveList from './components/archive/ArchiveList.svelte'
  import GameDetail from './components/archive/GameDetail.svelte'
  import { detectContextualRules } from './engine/rulesContext'
  import TurnSummary from './components/game/TurnSummary.svelte'
  import { CALOSANTI_MAP } from './maps/calosanti'
  import { startGame, dispatch, undo, rewindTo, gameState, getTurnHistory, tryResumeGame, addJournalEntry, editJournalEntry, deleteJournalEntry, getAllJournalEntries, getDraftText, setDraftText } from './stores/gameStore.svelte'
  import { getCurrentView, navigate, back } from './stores/viewStore.svelte'
  import { loadArchivedGames, loadArchivedGame } from './persistence/gameRepository'
  import type { ArchiveMetadata } from './persistence/gameRepository'
  import type { GameSnapshot } from './types/game.types'
  import type { JournalEntry } from './types/journal.types'

  const snapshot = $derived(gameState.snapshot)
  const isInitialized = $derived(gameState.isInitialized)

  // View state
  const currentView = $derived(getCurrentView())
  let archivedGames = $state<ArchiveMetadata[]>([])
  let archiveLoading = $state(false)
  let detailSnapshot = $state<GameSnapshot | null>(null)
  let detailJournalEntries = $state<JournalEntry[]>([])
  let detailMetadata = $state<ArchiveMetadata | null>(null)

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

  // Turn history overlay state
  let showTurnHistory = $state(false)

  // Rules reference state
  let showRulesReference = $state(false)

  // Journal state
  let showJournal = $state(false)
  let isDesktop = $state(false)

  // Track desktop width for persistent journal panel
  function checkDesktop() {
    isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
  }
  if (typeof window !== 'undefined') {
    checkDesktop()
  }
  let previousSnapshot = $state<typeof snapshot>(null)
  const contextRuleIds = $derived(
    snapshot ? detectContextualRules(snapshot, previousSnapshot) : ['hex-placement']
  )

  const canUndo = $derived(gameState.canUndo)

  function handleStartGame() {
    startGame(CALOSANTI_MAP)
    showTurnSummary = false
    lastTurnNumber = 0
    previousSnapshot = null
  }

  function handleHexSelected(coord: HexCoord) {
    pendingSourceCoord = coord
    diceInputVisible = true
  }

  function handleRoll(diceValue: number) {
    if (!pendingSourceCoord) return

    const prevSnapshot = snapshot
    const prevTurn = prevSnapshot?.turnNumber ?? 0
    previousSnapshot = prevSnapshot

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

  function handleUndo() {
    if (!canUndo) return
    previousSnapshot = snapshot
    diceInputVisible = false
    pendingSourceCoord = null
    showTurnSummary = false
    showRulesReference = false
    showJournal = false
    hexGridRef?.clearSelection()
    undo()
  }

  function handleRewindTo(turnNumber: number) {
    previousSnapshot = snapshot
    diceInputVisible = false
    pendingSourceCoord = null
    showTurnSummary = false
    showTurnHistory = false
    showRulesReference = false
    showJournal = false
    rewindTo(turnNumber)
  }

  function handleTurnHistoryOpen() {
    showTurnHistory = true
    showRulesReference = false
    showJournal = false
  }

  function handleTurnHistoryClose() {
    showTurnHistory = false
  }

  function handleRulesOpen() {
    showRulesReference = true
    showTurnHistory = false
    showJournal = false
  }

  function handleRulesClose() {
    showRulesReference = false
  }

  function handleJournalOpen() {
    showJournal = true
    showRulesReference = false
    showTurnHistory = false
  }

  function handleJournalClose() {
    showJournal = false
  }

  function handleSaveJournalEntry(text: string, scope: 'turn' | 'session') {
    addJournalEntry(text, scope)
  }

  async function handleNavigateArchive() {
    archiveLoading = true
    navigate('archive')
    archivedGames = await loadArchivedGames()
    archiveLoading = false
  }

  function handleArchiveBack() {
    back()
  }

  async function handleSelectArchivedGame(id: string) {
    const data = await loadArchivedGame(id)
    if (data) {
      detailSnapshot = data.snapshot
      detailJournalEntries = data.journalEntries
      detailMetadata = data.metadata
      navigate('gameDetail')
    }
  }

  function handleDetailBack() {
    detailSnapshot = null
    detailMetadata = null
    detailJournalEntries = []
    back()
  }

  // Keyboard shortcut: Ctrl+Z / Cmd+Z for undo (skip when typing in inputs)
  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return
      e.preventDefault()
      handleUndo()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} onresize={checkDesktop} />

{#if !isInitialized}
  <!-- Waiting for persistence check -->
{:else if currentView === 'gameDetail' && detailSnapshot && detailMetadata}
  <GameDetail
    snapshot={detailSnapshot}
    journalEntries={detailJournalEntries}
    metadata={detailMetadata}
    onBack={handleDetailBack}
  />
{:else if currentView === 'archive'}
  {#if archiveLoading}
    <div style="display:flex;align-items:center;justify-content:center;min-height:100svh;background:var(--color-bg-app,#1a1a2e);color:var(--color-text-secondary,#a0a0b0);">Loading...</div>
  {:else}
    <ArchiveList
      archives={archivedGames}
      onSelectGame={handleSelectArchivedGame}
      onBack={handleArchiveBack}
    />
  {/if}
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

  <ControlStrip {canUndo} onUndo={handleUndo} onTurnHistoryOpen={handleTurnHistoryOpen} onRulesOpen={handleRulesOpen} onJournalOpen={handleJournalOpen} />

  {#if showTurnHistory}
    <TurnHistory
      entries={getTurnHistory()}
      currentTurn={snapshot.turnNumber}
      onSelectTurn={handleRewindTo}
      onClose={handleTurnHistoryClose}
    />
  {/if}

  {#if showRulesReference}
    <RulesReference
      {contextRuleIds}
      onClose={handleRulesClose}
    />
  {/if}

  {#if showJournal || isDesktop}
    <JournalPanel
      entries={getAllJournalEntries()}
      currentTurn={snapshot.turnNumber}
      draftText={getDraftText()}
      {isDesktop}
      onSaveEntry={handleSaveJournalEntry}
      onEditEntry={editJournalEntry}
      onDeleteEntry={deleteJournalEntry}
      onDraftChange={setDraftText}
      onClose={handleJournalClose}
    />
  {/if}

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
      onViewArchive={handleNavigateArchive}
    />
  {/if}
{:else}
  <HomeView onStartGame={handleStartGame} onViewArchive={handleNavigateArchive} />
{/if}

<style>
  :global(body) {
    overflow: hidden;
  }
</style>

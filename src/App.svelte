<script lang="ts">
  import HexGrid from './components/hex-grid/HexGrid.svelte'
  import { CALOSANTI_MAP } from './maps/calosanti'
  import { HexStatus } from './types/hex.types'
  import type { HexState } from './types/hex.types'

  // Sample game state with mixed hex states for visual verification
  const sampleHexStates = new Map<string, HexState>()

  // A few claimed hexes with numbers
  sampleHexStates.set('5,5', {
    coord: { q: 5, r: 5 },
    status: HexStatus.Claimed,
    numbers: [3, 4, 5, 6, 1, 2],
  })
  sampleHexStates.set('5,4', {
    coord: { q: 5, r: 4 },
    status: HexStatus.Claimed,
    numbers: [1, 2, 3, 4, 5, 6],
  })
  sampleHexStates.set('6,4', {
    coord: { q: 6, r: 4 },
    status: HexStatus.Claimed,
    numbers: [5, 6, 1, 2, 3, 4],
  })
  sampleHexStates.set('4,5', {
    coord: { q: 4, r: 5 },
    status: HexStatus.Claimed,
    numbers: [2, 3, 4, 5, 6, 1],
  })

  // A blocked hex
  sampleHexStates.set('6,5', {
    coord: { q: 6, r: 5 },
    status: HexStatus.Blocked,
    numbers: [4, 5, 6, 1, 2, 3],
    armies: [0],
  })

  // A captured fort (has army)
  sampleHexStates.set('4,3', {
    coord: { q: 4, r: 3 },
    status: HexStatus.Claimed,
    numbers: [1, 2, 3, 4, 5, 6],
    armies: [2],
  })
</script>

<HexGrid
  mapDefinition={CALOSANTI_MAP}
  hexStates={sampleHexStates}
/>

<style>
  :global(body) {
    overflow: hidden;
  }
</style>

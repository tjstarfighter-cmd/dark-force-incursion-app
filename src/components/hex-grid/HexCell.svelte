<script lang="ts">
  import type { MapHex } from '../../types/map.types'
  import type { HexState } from '../../types/hex.types'
  import { HexStatus } from '../../types/hex.types'
  import { TerrainType } from '../../types/terrain.types'
  import { getNeighbors, hexToKey } from '../../engine/hexMath'
  import TerrainIcon from './TerrainIcon.svelte'
  import FortMarker from './FortMarker.svelte'
  import BlockedOverlay from './BlockedOverlay.svelte'

  interface Props {
    mapHex: MapHex
    hexState?: HexState
    cx: number
    cy: number
    points: string
    corners: Array<{ x: number; y: number }>
    radius: number
    claimedHexKeys: Set<string>
  }

  let { mapHex, hexState, cx, cy, points, corners, radius, claimedHexKeys }: Props = $props()

  // Determine visual state
  const isMountain = mapHex.terrain === TerrainType.Mountain
  const isFort = mapHex.isFort === true
  const status = hexState?.status ?? HexStatus.Empty

  // Fort status
  type FortStatus = 'uncaptured' | 'captured' | 'lost'
  let fortStatus: FortStatus = $derived.by(() => {
    if (!isFort) return 'uncaptured'
    if (status === HexStatus.Blocked) return 'lost'
    if (hexState?.armies && hexState.armies.length > 0) return 'captured'
    return 'uncaptured'
  })

  // Fill and stroke based on state
  let fill = $derived.by(() => {
    if (status === HexStatus.Blocked) return 'var(--color-bg-map)'
    if (status === HexStatus.Claimed) return 'var(--color-hex-claimed)'
    if (isFort && fortStatus === 'captured') return '#c49a50'
    return 'var(--color-bg-map)'
  })

  let stroke = $derived.by(() => {
    if (status === HexStatus.Blocked) return 'var(--color-dark-force)'
    if (status === HexStatus.Claimed) return 'var(--color-hex-claimed-border)'
    if (isFort && fortStatus === 'captured') return 'var(--color-fort-captured)'
    if (isFort && fortStatus === 'uncaptured') return 'var(--color-fort-uncaptured)'
    return 'rgba(255, 255, 255, 0.1)'
  })

  let strokeWidth = $derived(status === HexStatus.Blocked || status === HexStatus.Claimed || (isFort && fortStatus === 'captured') ? 2 : 1)
  let strokeDasharray = $derived(isFort && fortStatus === 'uncaptured' ? '4,3' : 'none')
  let fillOpacity = $derived(status === HexStatus.Blocked ? 0.4 : 1)

  // Number positioning: 6 positions near each edge
  function getNumberPositions(): Array<{ x: number; y: number; num: number }> {
    if (!hexState?.numbers || (status !== HexStatus.Claimed && status !== HexStatus.Blocked)) return []

    return hexState.numbers.map((num, i) => {
      // Position between center and mid-edge point
      const c1 = corners[i]
      const c2 = corners[(i + 1) % 6]
      const edgeMidX = (c1.x + c2.x) / 2
      const edgeMidY = (c1.y + c2.y) / 2
      // 65% from center toward edge midpoint
      const x = cx + (edgeMidX - cx) * 0.65
      const y = cy + (edgeMidY - cy) * 0.65
      return { x, y, num }
    })
  }

  const numberPositions = $derived(getNumberPositions())

  // Check if any adjacent hex is claimed (for terrain icon state)
  let hasAdjacentClaimed = $derived.by(() => {
    const neighbors = getNeighbors(mapHex.coord)
    return neighbors.some(n => claimedHexKeys.has(hexToKey(n)))
  })
</script>

<g class="hex-cell">
  <!-- Hex polygon -->
  <polygon
    {points}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    stroke-dasharray={strokeDasharray}
  />

  <!-- Numbers for claimed and blocked hexes -->
  {#if (status === HexStatus.Claimed || status === HexStatus.Blocked) && hexState?.numbers}
    {#each numberPositions as pos}
      <text
        x={pos.x}
        y={pos.y}
        text-anchor="middle"
        dominant-baseline="central"
        fill={status === HexStatus.Blocked ? 'rgba(232,224,208,0.3)' : 'var(--color-hex-numbers)'}
        font-family="var(--font-data)"
        font-size="{radius * 0.35}px"
        font-weight="500"
      >{pos.num}</text>
    {/each}
  {/if}

  <!-- Terrain icon (mountain) — suppressed when blocked -->
  {#if isMountain && status !== HexStatus.Blocked}
    <TerrainIcon
      terrain={mapHex.terrain!}
      {cx}
      {cy}
      {radius}
      active={hasAdjacentClaimed}
    />
  {/if}

  <!-- Fort marker -->
  {#if isFort}
    <FortMarker
      {cx}
      {cy}
      {radius}
      status={fortStatus}
    />
  {/if}

  <!-- Blocked overlay -->
  {#if status === HexStatus.Blocked}
    <BlockedOverlay {points} />
  {/if}
</g>

<script lang="ts">
  import type { HexCoord, HexState, HexEdge } from '../../types/hex.types'
  import { HexStatus } from '../../types/hex.types'
  import { TerrainType } from '../../types/terrain.types'
  import type { MapHex } from '../../types/map.types'
  import { getNeighborAtEdge, hexToKey } from '../../engine/hexMath'

  interface Props {
    coord: HexCoord
    cx: number
    cy: number
    corners: Array<{ x: number; y: number }>
    radius: number
    hexStates: Map<string, HexState>
    mapHexKeys: Set<string>
    mapHexLookup: Map<string, MapHex>
    cornerOffset: number
    selectedEdge: HexEdge | null
    onEdgeSelect: (edge: HexEdge) => void
  }

  let { coord, cx, cy, corners, radius, hexStates, mapHexKeys, mapHexLookup, cornerOffset, selectedEdge, onEdgeSelect }: Props = $props()

  type EdgeState = 'active' | 'dimmed' | 'off-map'

  function getEdgeState(edge: HexEdge): EdgeState {
    const neighbor = getNeighborAtEdge(coord, edge)
    const neighborKey = hexToKey(neighbor)

    if (!mapHexKeys.has(neighborKey)) return 'off-map'

    const neighborState = hexStates.get(neighborKey)
    if (neighborState && neighborState.status !== HexStatus.Empty) return 'dimmed'

    return 'active'
  }

  function getNeighborTerrain(edge: HexEdge): TerrainType | undefined {
    const neighbor = getNeighborAtEdge(coord, edge)
    const neighborKey = hexToKey(neighbor)
    const mapHex = mapHexLookup.get(neighborKey)
    return mapHex?.terrain
  }

  // Calculate wedge polygon for each edge
  // cornerOffset maps our edge indices to Honeycomb.js corner pairs
  function getWedgePoints(edgeIndex: number): string {
    const c1 = corners[(edgeIndex + cornerOffset) % 6]
    const c2 = corners[(edgeIndex + cornerOffset + 1) % 6]
    const extend = radius * 0.8

    // Extend corners outward from center
    const dx1 = c1.x - cx
    const dy1 = c1.y - cy
    const len1 = Math.hypot(dx1, dy1)
    const ox1 = c1.x + (dx1 / len1) * extend
    const oy1 = c1.y + (dy1 / len1) * extend

    const dx2 = c2.x - cx
    const dy2 = c2.y - cy
    const len2 = Math.hypot(dx2, dy2)
    const ox2 = c2.x + (dx2 / len2) * extend
    const oy2 = c2.y + (dy2 / len2) * extend

    return `${c1.x},${c1.y} ${c2.x},${c2.y} ${ox2},${oy2} ${ox1},${oy1}`
  }

  // Terrain icon position: near the outer edge of the wedge
  function getTerrainIconPos(edgeIndex: number): { x: number; y: number } {
    const c1 = corners[(edgeIndex + cornerOffset) % 6]
    const c2 = corners[(edgeIndex + cornerOffset + 1) % 6]
    const edgeMidX = (c1.x + c2.x) / 2
    const edgeMidY = (c1.y + c2.y) / 2
    const dx = edgeMidX - cx
    const dy = edgeMidY - cy
    const len = Math.hypot(dx, dy)
    const outward = radius * 0.5
    return {
      x: edgeMidX + (dx / len) * outward,
      y: edgeMidY + (dy / len) * outward,
    }
  }

  function getFill(edge: HexEdge): string {
    if (selectedEdge === edge) return 'rgba(212,160,64,0.6)'
    const state = getEdgeState(edge)
    if (state === 'active') return 'rgba(212,160,64,0.3)'
    return 'rgba(255,255,255,0.05)'
  }

  function getStroke(edge: HexEdge): string {
    if (selectedEdge === edge) return 'var(--color-army)'
    const state = getEdgeState(edge)
    if (state === 'active') return 'rgba(212,160,64,0.4)'
    return 'rgba(255,255,255,0.1)'
  }

  function getStrokeWidth(edge: HexEdge): number {
    return selectedEdge === edge ? 2 : 1
  }

  function handleClick(edge: HexEdge, e: MouseEvent) {
    e.stopPropagation()
    onEdgeSelect(edge)
  }

  const edges: HexEdge[] = [0, 1, 2, 3, 4, 5]
</script>

<g class="edge-selector">
  {#each edges as edge}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <polygon
      points={getWedgePoints(edge)}
      fill={getFill(edge)}
      stroke={getStroke(edge)}
      stroke-width={getStrokeWidth(edge)}
      style="cursor: pointer;"
      onclick={(e) => handleClick(edge, e)}
    />

    {#if getNeighborTerrain(edge) === TerrainType.Mountain}
      {@const pos = getTerrainIconPos(edge)}
      {@const iconSize = radius * 0.2}
      <g pointer-events="none" opacity="0.7">
        <polygon
          points="{pos.x},{pos.y - iconSize * 0.7} {pos.x + iconSize * 0.6},{pos.y + iconSize * 0.4} {pos.x - iconSize * 0.6},{pos.y + iconSize * 0.4}"
          fill="var(--color-terrain-mountain)"
          stroke="rgba(255,255,255,0.3)"
          stroke-width="0.5"
        />
      </g>
    {/if}
  {/each}
</g>

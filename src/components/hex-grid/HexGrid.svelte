<script lang="ts">
  import { defineHex, Orientation } from 'honeycomb-grid'
  import type { MapDefinition, MapHex } from '../../types/map.types'
  import type { HexCoord, HexState, HexEdge } from '../../types/hex.types'
  import { HexStatus } from '../../types/hex.types'
  import { TerrainType } from '../../types/terrain.types'
  import { getNeighborAtEdge, hexToKey, getOppositeEdge } from '../../engine/hexMath'
  import HexCell from './HexCell.svelte'
  import EdgeSelector from './EdgeSelector.svelte'
  import ArmyMarker from './ArmyMarker.svelte'

  interface Props {
    mapDefinition: MapDefinition
    hexStates?: Map<string, HexState>
    onHexSelected?: (coord: HexCoord) => void
    lastPlacedHexKey?: string | null
  }

  let { mapDefinition, hexStates, onHexSelected, lastPlacedHexKey = null }: Props = $props()

  // Rendering hex class with appropriate size
  const HEX_RADIUS = 30
  const RenderHex = defineHex({ orientation: Orientation.FLAT, dimensions: HEX_RADIUS })

  // Calculate viewBox from map bounds
  function calculateBounds() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

    for (const mapHex of mapDefinition.hexes) {
      const hex = new RenderHex(mapHex.coord)
      for (const corner of hex.corners) {
        if (corner.x < minX) minX = corner.x
        if (corner.x > maxX) maxX = corner.x
        if (corner.y < minY) minY = corner.y
        if (corner.y > maxY) maxY = corner.y
      }
    }

    const padding = HEX_RADIUS
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    }
  }

  const bounds = calculateBounds()

  // Determine the corner offset: which corner pair forms the top (N) edge.
  // Honeycomb.js corner ordering varies, so we detect it from actual positions.
  // The top edge (edge 0 = N) has the smallest average Y (topmost on screen).
  const CORNER_OFFSET = (() => {
    const sampleHex = new RenderHex({ q: 0, r: 0 })
    const c = sampleHex.corners as Array<{ x: number; y: number }>
    let topIdx = 0
    let minY = Infinity
    for (let i = 0; i < 6; i++) {
      const avgY = (c[i].y + c[(i + 1) % 6].y) / 2
      if (avgY < minY) {
        minY = avgY
        topIdx = i
      }
    }
    return topIdx
  })()

  // Prepare hex render data — must be reactive to update when hexStates changes
  // Geometry (cx, cy, points, corners) is stable per mapDefinition, but state changes per turn
  const hexGeometry = mapDefinition.hexes.map((mapHex) => {
    const hex = new RenderHex(mapHex.coord)
    return {
      mapHex,
      cx: hex.x,
      cy: hex.y,
      points: hex.corners.map((c: { x: number; y: number }) => `${c.x},${c.y}`).join(' '),
      corners: hex.corners as Array<{ x: number; y: number }>,
      key: `${mapHex.coord.q},${mapHex.coord.r}`,
    }
  })

  // Reactive: re-derive render data when hexStates prop changes
  let hexRenderData = $derived(
    hexGeometry.map(geo => ({
      ...geo,
      state: hexStates?.get(geo.key),
    })).sort((a, b) => {
      const aBlocked = a.state?.status === HexStatus.Blocked ? 1 : 0
      const bBlocked = b.state?.status === HexStatus.Blocked ? 1 : 0
      return aBlocked - bBlocked
    })
  )

  // Reactive: recompute claimed hex keys when hexStates changes
  let claimedHexKeys = $derived(
    hexStates
      ? new Set(
          Array.from(hexStates.entries())
            .filter(([_, s]) => s.status === HexStatus.Claimed)
            .map(([k]) => k)
        )
      : new Set<string>()
  )

  // Reactive: compute army marker pairs for rendering across hex boundaries
  const hexGeoLookup = new Map(hexGeometry.map(g => [g.key, g]))

  let armyPairs = $derived.by(() => {
    if (!hexStates) return []
    const pairs: Array<{ x1: number; y1: number; x2: number; y2: number; pairKey: string }> = []
    const processed = new Set<string>()

    for (const [key, hex] of hexStates) {
      if (hex.status !== HexStatus.Claimed || !hex.armies || !hex.numbers) continue
      const geo = hexGeoLookup.get(key)
      if (!geo) continue

      for (const edgeIndex of hex.armies) {
        const neighborCoord = getNeighborAtEdge(hex.coord, edgeIndex as 0|1|2|3|4|5)
        const neighborKey = hexToKey(neighborCoord)
        const pk = key < neighborKey ? `${key}|${neighborKey}` : `${neighborKey}|${key}`
        if (processed.has(pk)) continue
        processed.add(pk)

        const neighborGeo = hexGeoLookup.get(neighborKey)
        if (!neighborGeo) continue

        // Compute number positions for both sides
        const c1a = geo.corners[(edgeIndex + CORNER_OFFSET) % 6]
        const c1b = geo.corners[(edgeIndex + CORNER_OFFSET + 1) % 6]
        const edgeMid1X = (c1a.x + c1b.x) / 2
        const edgeMid1Y = (c1a.y + c1b.y) / 2
        const pos1x = geo.cx + (edgeMid1X - geo.cx) * 0.65
        const pos1y = geo.cy + (edgeMid1Y - geo.cy) * 0.65

        const theirEdge = getOppositeEdge(edgeIndex as 0|1|2|3|4|5)
        const c2a = neighborGeo.corners[(theirEdge + CORNER_OFFSET) % 6]
        const c2b = neighborGeo.corners[(theirEdge + CORNER_OFFSET + 1) % 6]
        const edgeMid2X = (c2a.x + c2b.x) / 2
        const edgeMid2Y = (c2a.y + c2b.y) / 2
        const pos2x = neighborGeo.cx + (edgeMid2X - neighborGeo.cx) * 0.65
        const pos2y = neighborGeo.cy + (edgeMid2Y - neighborGeo.cy) * 0.65

        pairs.push({ x1: pos1x, y1: pos1y, x2: pos2x, y2: pos2y, pairKey: pk })
      }
    }
    return pairs
  })

  // Pre-compute map hex keys for boundary detection
  const mapHexKeys: Set<string> = new Set(
    mapDefinition.hexes.map(h => `${h.coord.q},${h.coord.r}`)
  )

  // Lookup map hex data by key (for terrain detection)
  const mapHexLookup: Map<string, MapHex> = new Map(
    mapDefinition.hexes.map(h => [`${h.coord.q},${h.coord.r}`, h])
  )

  // Selection state (local — view-only concern, not in stores)
  let selectedHexKey = $state<string | null>(null)
  let selectedEdge = $state<HexEdge | null>(null)

  // Get selected hex render data
  let selectedHexData = $derived(
    selectedHexKey ? hexRenderData.find(h => h.key === selectedHexKey) : null
  )

  // Target hex preview: when edge is selected, show where the new hex would go
  let targetPreviewData = $derived.by(() => {
    if (!selectedHexData || selectedEdge === null) return null
    const targetCoord = getNeighborAtEdge(selectedHexData.mapHex.coord, selectedEdge)
    const hex = new RenderHex(targetCoord)
    const points = hex.corners.map((c: { x: number; y: number }) => `${c.x},${c.y}`).join(' ')
    return { points }
  })

  function handleHexSelect(key: string, hexState?: HexState) {
    if (!hexState || hexState.status !== HexStatus.Claimed) {
      // Tapping non-selectable hex deselects
      selectedHexKey = null
      selectedEdge = null
      return
    }
    if (selectedHexKey === key) {
      // Tapping same hex deselects
      selectedHexKey = null
      selectedEdge = null
    } else {
      selectedHexKey = key
      selectedEdge = null
      // Fire callback — dice input appears immediately
      if (onHexSelected) {
        const hexData = hexRenderData.find(h => h.key === key)
        if (hexData) {
          onHexSelected(hexData.mapHex.coord)
        }
      }
    }
  }

  function handleEdgeSelect(edge: HexEdge) {
    selectedEdge = edge
  }

  function handleBackgroundClick() {
    selectedHexKey = null
    selectedEdge = null
  }

  export function clearSelection() {
    selectedHexKey = null
    selectedEdge = null
  }

  // Click vs pan disambiguation
  let pointerDownPos = $state<{ x: number; y: number } | null>(null)
  const CLICK_THRESHOLD = 5

  // Zoom & pan state (local, not in stores)
  let zoom = $state(1)
  let panX = $state(0)
  let panY = $state(0)
  let isPanning = $state(false)
  let lastPointerX = $state(0)
  let lastPointerY = $state(0)

  // Pointer tracking for pinch-to-zoom
  let activePointers = $state(new Map<number, { x: number; y: number }>())
  let lastPinchDistance = $state(0)

  const MIN_ZOOM = 0.5
  const MAX_ZOOM = 3

  function clampZoom(z: number): number {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))
  }

  function handlePointerDown(e: PointerEvent) {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    pointerDownPos = { x: e.clientX, y: e.clientY }

    if (activePointers.size === 1) {
      isPanning = true
      lastPointerX = e.clientX
      lastPointerY = e.clientY
    } else if (activePointers.size === 2) {
      isPanning = false
      const pts = Array.from(activePointers.values())
      lastPinchDistance = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
    }
  }

  function handlePointerMove(e: PointerEvent) {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (activePointers.size === 1 && isPanning) {
      const dx = e.clientX - lastPointerX
      const dy = e.clientY - lastPointerY
      panX += dx / zoom
      panY += dy / zoom
      lastPointerX = e.clientX
      lastPointerY = e.clientY
    } else if (activePointers.size === 2) {
      const pts = Array.from(activePointers.values())
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
      if (lastPinchDistance > 0) {
        const scale = dist / lastPinchDistance
        zoom = clampZoom(zoom * scale)
      }
      lastPinchDistance = dist
    }
  }

  function handlePointerUp(e: PointerEvent) {
    // Check if this was a click (not a pan) on the background
    if (pointerDownPos && activePointers.size <= 1) {
      const dx = e.clientX - pointerDownPos.x
      const dy = e.clientY - pointerDownPos.y
      if (Math.hypot(dx, dy) < CLICK_THRESHOLD) {
        // Only deselect if the click target is the SVG background (not a hex or wedge)
        const target = e.target as Element
        if (target.classList.contains('hex-grid-svg') || target.tagName === 'svg') {
          handleBackgroundClick()
        }
      }
    }
    pointerDownPos = null

    activePointers.delete(e.pointerId)
    if (activePointers.size === 0) {
      isPanning = false
    }
    lastPinchDistance = 0
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault()
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = clampZoom(zoom * scaleFactor)

    // Adjust pan so the point under the cursor stays fixed
    const svg = e.currentTarget as SVGSVGElement
    const rect = svg.getBoundingClientRect()
    // Cursor position in SVG viewBox coordinates
    const cursorSvgX = bounds.x + ((e.clientX - rect.left) / rect.width) * bounds.width
    const cursorSvgY = bounds.y + ((e.clientY - rect.top) / rect.height) * bounds.height
    // The point under cursor in content-group space: (cursorSvg - pan) / zoom
    // Keep that fixed: (cursorSvg - newPan) / newZoom = (cursorSvg - pan) / zoom
    // Solve for newPan: newPan = cursorSvg - (cursorSvg - pan) * newZoom / zoom
    panX = cursorSvgX - (cursorSvgX - panX) * newZoom / zoom
    panY = cursorSvgY - (cursorSvgY - panY) * newZoom / zoom

    zoom = newZoom
  }
</script>

<div
  class="hex-grid-container"
  role="presentation"
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svg
    class="hex-grid-svg"
    viewBox="{bounds.x} {bounds.y} {bounds.width} {bounds.height}"
    role="img"
    aria-label="{mapDefinition.name} hex grid map"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointerleave={handlePointerUp}
    onwheel={handleWheel}
  >
    <defs>
      <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(139,26,26,0.5)" stroke-width="2" />
      </pattern>
      <filter id="fortGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g transform="translate({panX}, {panY}) scale({zoom})">
      {#each hexRenderData as hex (hex.key)}
        <HexCell
          mapHex={hex.mapHex}
          hexState={hex.state}
          cx={hex.cx}
          cy={hex.cy}
          points={hex.points}
          corners={hex.corners}
          radius={HEX_RADIUS}
          {claimedHexKeys}
          cornerOffset={CORNER_OFFSET}
          isSelected={selectedHexKey === hex.key}
          isNewlyPlaced={lastPlacedHexKey === hex.key}
          onSelect={() => handleHexSelect(hex.key, hex.state)}
        />
      {/each}

      <!-- Edge selector rendered on top of all hex cells -->
      {#if selectedHexData}
        <EdgeSelector
          coord={selectedHexData.mapHex.coord}
          cx={selectedHexData.cx}
          cy={selectedHexData.cy}
          corners={selectedHexData.corners}
          radius={HEX_RADIUS}
          hexStates={hexStates ?? new Map()}
          {mapHexKeys}
          {mapHexLookup}
          cornerOffset={CORNER_OFFSET}
          {selectedEdge}
          onEdgeSelect={handleEdgeSelect}
        />
      {/if}

      <!-- Army markers spanning hex pairs -->
      {#each armyPairs as pair (pair.pairKey)}
        <ArmyMarker
          x1={pair.x1}
          y1={pair.y1}
          x2={pair.x2}
          y2={pair.y2}
          radius={HEX_RADIUS}
        />
      {/each}

      <!-- Target hex preview when edge is selected -->
      {#if targetPreviewData}
        <polygon
          points={targetPreviewData.points}
          fill="none"
          stroke="var(--color-army)"
          stroke-width="2"
          stroke-dasharray="6,4"
          opacity="0.6"
          pointer-events="none"
        />
      {/if}
    </g>
  </svg>
</div>

<style>
  .hex-grid-container {
    width: 100%;
    height: calc(100svh - 40px - 48px);
    margin-top: 40px;
    overflow: hidden;
    background-color: var(--color-bg-app);
    touch-action: none;
  }

  .hex-grid-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  @media (min-width: 1024px) {
    .hex-grid-container {
      width: 70%;
    }
  }
</style>

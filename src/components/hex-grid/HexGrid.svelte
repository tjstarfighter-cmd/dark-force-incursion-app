<script lang="ts">
  import { defineHex, Orientation } from 'honeycomb-grid'
  import type { MapDefinition, MapHex } from '../../types/map.types'
  import type { HexCoord, HexState } from '../../types/hex.types'
  import { HexStatus } from '../../types/hex.types'
  import { TerrainType } from '../../types/terrain.types'
  import HexCell from './HexCell.svelte'

  interface Props {
    mapDefinition: MapDefinition
    hexStates?: Map<string, HexState>
  }

  let { mapDefinition, hexStates }: Props = $props()

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

  // Prepare hex render data
  function getHexRenderData() {
    return mapDefinition.hexes.map((mapHex) => {
      const hex = new RenderHex(mapHex.coord)
      const points = hex.corners.map((c: { x: number; y: number }) => `${c.x},${c.y}`).join(' ')
      const key = `${mapHex.coord.q},${mapHex.coord.r}`
      const state = hexStates?.get(key)

      return {
        mapHex,
        cx: hex.x,
        cy: hex.y,
        points,
        corners: hex.corners as Array<{ x: number; y: number }>,
        state,
        key,
      }
    })
  }

  // Sort so blocked hexes render last (on top), ensuring their red border isn't covered
  const hexRenderData = getHexRenderData().sort((a, b) => {
    const aBlocked = a.state?.status === HexStatus.Blocked ? 1 : 0
    const bBlocked = b.state?.status === HexStatus.Blocked ? 1 : 0
    return aBlocked - bBlocked
  })

  // Pre-compute claimed hex keys once (not per-cell)
  const claimedHexKeys: Set<string> = hexStates
    ? new Set(
        Array.from(hexStates.entries())
          .filter(([_, s]) => s.status === HexStatus.Claimed)
          .map(([k]) => k)
      )
    : new Set<string>()

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
        />
      {/each}
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

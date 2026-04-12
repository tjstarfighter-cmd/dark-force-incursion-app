# Story 2.2: Hex Selection & Edge Targets

Status: done

## Story

As a player,
I want to tap a claimed hex and see clear directional options,
So that I can choose which direction to roll toward with confidence.

## Acceptance Criteria

1. **Given** the hex grid is rendered with at least one claimed hex **When** the player taps a claimed, non-blocked hex **Then** the hex highlights with a distinct visual treatment (bright gold glow border) **And** six wedge-shaped edge targets expand outward from the selected hex into surrounding space **And** each wedge has a minimum effective tap area of 44x44px **And** edges pointing toward unclaimed hexes or terrain are visually active (translucent amber fill) **And** edges pointing toward already-claimed hexes or back toward the source are visually dimmed

2. **Given** a hex is selected with edge targets visible **When** the player taps one of the six edge wedges **Then** the selected edge highlights to confirm the chosen direction **And** the target hex (where the new hex will be placed) briefly outlines to preview the destination

3. **Given** a hex is selected **When** the player taps the same hex again or taps empty space on the map **Then** the hex deselects and edge targets collapse **And** the map returns to its default state

4. **Given** terrain is adjacent to the selected hex **When** edge targets expand **Then** a brief contextual terrain indicator appears near edges that point toward terrain (e.g., mountain peak icon near the relevant wedge)

5. **Given** the selected hex is at the edge of the map **When** edge targets expand **Then** edges pointing off the map boundary are visually dimmed but still tappable (tapping fires the appropriate rule)

## Tasks / Subtasks

- [x] Task 1: Selection State Management (AC: #1, #3)
  - [x] 1.1: Add selection state to HexGrid.svelte — `selectedHexKey: string | null` and `selectedEdge: HexEdge | null` as local `$state` variables (not in stores — view-only concern)
  - [x] 1.2: Implement `handleHexSelect(key: string, hexState?: HexState)` — if hex is claimed and non-blocked, set selectedHexKey; if same hex tapped again, deselect; if empty space or non-selectable hex tapped, deselect
  - [x] 1.3: Implement `handleEdgeSelect(edge: HexEdge)` — set selectedEdge, will be consumed by Story 2.3 (DiceInput)
  - [x] 1.4: Implement `handleBackgroundClick()` — deselect hex and edge when clicking empty SVG space
  - [x] 1.5: Pass `isSelected` boolean and `onSelect` callback as props to HexCell
  - [x] 1.6: Differentiate click from pan — only fire selection if pointer didn't move significantly between down/up (< 5px threshold)

- [x] Task 2: HexCell Selected State Visual (AC: #1)
  - [x] 2.1: Add `isSelected` and `onSelect` props to HexCell.svelte
  - [x] 2.2: When `isSelected`, apply bright gold glow border — stroke: `var(--color-army)` (#f0c040), stroke-width: 3, add SVG filter glow (reuse fortGlow)
  - [x] 2.3: Add click handler on the hex polygon — call `onSelect` when tapped, with stopPropagation
  - [x] 2.4: Add `pointer-events="none"` on text, TerrainIcon, FortMarker, BlockedOverlay to prevent click interception
  - [x] 2.5: Add `cursor: pointer` on claimed, non-blocked hexes

- [x] Task 3: EdgeSelector Component (AC: #1, #2, #4, #5)
  - [x] 3.1: Create src/components/hex-grid/EdgeSelector.svelte — renders 6 wedge-shaped SVG polygons extending outward from a selected hex
  - [x] 3.2: Calculate wedge geometry: trapezoidal wedge from two adjacent hex corners extending outward by `radius * 0.8`
  - [x] 3.3: Implement active state — translucent amber fill (`rgba(212,160,64,0.3)`) for edges pointing toward unclaimed hexes or terrain
  - [x] 3.4: Implement dimmed state — very faint fill (`rgba(255,255,255,0.05)`) for edges pointing toward already-claimed hexes
  - [x] 3.5: Implement off-map dimmed state — same faint fill as dimmed, but still tappable (AC #5)
  - [x] 3.6: Implement selected edge highlight — brighter amber fill (`rgba(212,160,64,0.6)`) with solid border when a specific edge is tapped
  - [x] 3.7: Add terrain indicator — small mountain peak icon near wedges that point toward terrain hexes (AC #4)
  - [x] 3.8: Add click handler on each wedge — calls `onEdgeSelect(edge: HexEdge)` with stopPropagation
  - [x] 3.9: Add target hex preview — dashed amber outline at target hex position rendered in HexGrid

- [x] Task 4: HexGrid Integration (AC: #1, #2, #3)
  - [x] 4.1: Render EdgeSelector inside HexGrid when a hex is selected — positioned at the selected hex's center/corners
  - [x] 4.2: Pass neighbor state data to EdgeSelector: hexStates, mapHexKeys, mapHexLookup for edge state determination
  - [x] 4.3: Render EdgeSelector AFTER all HexCells in SVG (so wedges render on top)
  - [x] 4.4: Handle click event propagation — edge wedge clicks stopPropagation, background click checks target
  - [x] 4.5: Add target hex preview overlay — dashed amber polygon at target position when selectedEdge is set

- [x] Task 5: Visual Verification (AC: #1-#5)
  - [x] 5.1: Verify claimed hex selection shows gold glow border
  - [x] 5.2: Verify 6 wedge targets appear and are tappable
  - [x] 5.3: Verify active/dimmed edge states based on neighbor status
  - [x] 5.4: Verify deselection on re-tap and background tap
  - [x] 5.5: Verify terrain indicators near mountain-adjacent edges
  - [x] 5.6: Test on phone viewport (360px) — wedges large enough to tap

## Dev Notes

### Wedge Geometry Calculation

Each wedge extends outward from an edge of the hex. For flat-top hexagons with 6 corners (from `hex.corners`), each edge connects corner[i] to corner[(i+1)%6]. The wedge for edge `i` is a quadrilateral or triangle:

```
Inner edge: corner[i] to corner[(i+1)%6]  (the hex edge itself)
Outer points: extend each corner outward from center by radius * 0.8

outerPoint(cornerIndex):
  direction = corner[cornerIndex] - hexCenter
  normalized = direction / length(direction)
  return corner[cornerIndex] + normalized * (radius * 0.8)
```

The wedge polygon points are: `corner[i], corner[(i+1)%6], outerPoint((i+1)%6), outerPoint(i)`

This creates a trapezoidal wedge extending outward. At HEX_RADIUS=30, the outer extension is 24px, giving each wedge an approximate area well above 44x44px.

### Edge State Determination

For each of the 6 edges, determine the state by checking the neighbor:

```typescript
import { getNeighborAtEdge, hexToKey } from '../../engine/hexMath'
import type { HexEdge } from '../../types/hex.types'

type EdgeState = 'active' | 'dimmed' | 'off-map'

function getEdgeState(
  sourceCoord: HexCoord,
  edge: HexEdge,
  hexStates: Map<string, HexState>,
  mapHexKeys: Set<string>
): EdgeState {
  const neighbor = getNeighborAtEdge(sourceCoord, edge)
  const neighborKey = hexToKey(neighbor)

  // Off the map boundary
  if (!mapHexKeys.has(neighborKey)) return 'off-map'

  const neighborState = hexStates.get(neighborKey)
  // Already claimed or blocked — dimmed
  if (neighborState && neighborState.status !== HexStatus.Empty) return 'dimmed'

  // Unclaimed or terrain — active
  return 'active'
}
```

The `mapHexKeys` set should be precomputed in HexGrid from `mapDefinition.hexes` to avoid per-edge iteration.

### Terrain Indicator on Wedges

When a neighbor hex has terrain (e.g., `TerrainType.Mountain`), show a small mountain icon near the edge of the wedge. Reuse the existing `TerrainIcon` SVG path but at a smaller scale (~40% of normal size), positioned at the outer edge of the wedge.

### Click vs Pan Disambiguation

The HexGrid currently uses pointer events for pan/zoom. To prevent taps from accidentally panning:

```typescript
let pointerDownPos = $state<{ x: number; y: number } | null>(null)
const CLICK_THRESHOLD = 5 // pixels

function handlePointerDown(e: PointerEvent) {
  pointerDownPos = { x: e.clientX, y: e.clientY }
  // ... existing pan logic
}

function handlePointerUp(e: PointerEvent) {
  if (pointerDownPos) {
    const dx = e.clientX - pointerDownPos.x
    const dy = e.clientY - pointerDownPos.y
    if (Math.hypot(dx, dy) < CLICK_THRESHOLD) {
      // This was a click, not a pan — check if it hit a hex or background
      handleBackgroundClick()
    }
  }
  pointerDownPos = null
  // ... existing pan logic
}
```

Hex/edge clicks should call `e.stopPropagation()` to prevent the background handler from also firing.

### Selected State Visual Treatment

Per UX spec (UX-DR21), selected hex visual:
- Stroke: `var(--color-army)` (#f0c040) — bright gold
- Stroke-width: 3px
- Filter: glow effect (reuse `fortGlow` filter from HexGrid defs, or add a `selectedGlow` filter with slightly larger blur)
- Fill: unchanged (warm parchment stays)

### Architecture Compliance

**MUST follow:**
- Selection state is LOCAL to HexGrid (not in stores) — it's a view concern
- Components receive data as props and fire callbacks up
- No game logic in components — edge state determination is rendering logic, not game logic
- All colors via CSS custom properties from app.css
- Pointer events for click handling (unified touch/mouse)

**MUST NOT do:**
- Do NOT implement dice input or game actions (Story 2.3)
- Do NOT dispatch to gameStore from hex/edge selection — that's Story 2.3/2.4
- Do NOT implement cascade animation (Story 2.5)
- Do NOT add game logic to components
- Do NOT use canvas — SVG only

### Previous Story Intelligence (Story 2.1)

**Available from prior stories:**
- `src/engine/hexMath.ts` — getNeighborAtEdge(), getNeighbors(), hexToKey(), getOppositeEdge()
- `src/engine/ruleEngine.ts` — resolveAction() with placeHex (not used in this story)
- `src/engine/turnStack.ts` — TurnStack class (not used in this story)
- `src/stores/gameStore.svelte.ts` — startGame(), dispatch(), gameState.snapshot
- `src/types/hex.types.ts` — HexCoord, HexState, HexStatus, HexEdge
- `src/types/map.types.ts` — MapDefinition, MapHex
- `src/types/terrain.types.ts` — TerrainType enum
- `src/maps/calosanti.ts` — CALOSANTI_MAP (130 hexes including map boundaries)
- `src/components/hex-grid/HexGrid.svelte` — SVG container with zoom/pan, renders HexCell in loop
- `src/components/hex-grid/HexCell.svelte` — hex polygon with all visual states, no click handler yet
- `src/components/hex-grid/TerrainIcon.svelte` — mountain peak triangle (reuse for terrain indicator)
- `src/App.svelte` — uses gameStore, passes snapshot to HexGrid

**Key patterns established:**
- HexGrid passes `cx`, `cy`, `points`, `corners`, `radius` to child components
- HEX_RADIUS = 30 (used for viewBox and component sizing)
- `hexRenderData` array contains all render info per hex
- Blocked hexes render last (sort order) — selection layer should render even later
- `claimedHexKeys` Set precomputed for neighbor checks
- `fortGlow` filter defined in HexGrid `<defs>` — can be reused or extended

**HexGrid currently handles pointer events for zoom/pan:**
- `handlePointerDown`, `handlePointerMove`, `handlePointerUp` on the SVG
- Click disambiguation needs to be added to prevent taps from triggering pan
- Edge/hex clicks need `stopPropagation()` to avoid conflicting with background handlers

### Component Boundary Rules

Components in hex-grid/ follow the architecture pattern:
- **CAN** import from: `../../types/*`, `../../engine/hexMath`
- **CAN** read from: stores (but selection state stays LOCAL in HexGrid)
- **CANNOT** import from: `../../persistence/*`, `../../sync/*`
- **CANNOT** contain game logic — rendering and interaction only

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — EdgeSelector.svelte in component structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR5 expanded edge targets, EdgeSelector.svelte spec, hex state visual language]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2 Story 2.2 Acceptance Criteria]
- [Source: _bmad-output/implementation-artifacts/2-1-game-state-management-and-turn-stack.md — Previous Story]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- EdgeSelector renders 6 trapezoidal wedges with active/dimmed/off-map states and terrain indicators
- HexCell updated with isSelected prop (gold glow, cursor pointer), pointer-events="none" on children, click handler on all hexes for deselection
- Corner offset auto-detected at runtime (CORNER_OFFSET) to map our edge indices to Honeycomb.js corner ordering — fixes wedge/number positioning
- Click vs pan disambiguation via 5px movement threshold
- Target hex preview as dashed amber polygon when edge selected
- Clicking any non-claimed hex deselects the current selection
- All 64 tests pass, zero type errors

### File List

- src/components/hex-grid/EdgeSelector.svelte (created — 6 wedge-shaped edge targets with active/dimmed/terrain states)
- src/components/hex-grid/HexCell.svelte (modified — isSelected/onSelect props, gold glow, pointer-events, click handler, cornerOffset for number positioning)
- src/components/hex-grid/HexGrid.svelte (modified — selection state, CORNER_OFFSET auto-detection, EdgeSelector integration, target preview, click/pan disambiguation, mapHexKeys/mapHexLookup precomputation)

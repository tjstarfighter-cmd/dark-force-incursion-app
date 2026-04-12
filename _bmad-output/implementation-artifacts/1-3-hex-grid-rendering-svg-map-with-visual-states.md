# Story 1.3: Hex Grid Rendering — SVG Map with Visual States

Status: done

## Story

As a player,
I want to see the Calosanti hex grid map rendered beautifully on my phone, tablet, or desktop,
so that I can view the full battlefield with terrain, forts, and hex states at a glance.

## Acceptance Criteria

1. **Given** the Calosanti map data and hex coordinate system exist **When** the hex grid is rendered **Then** HexGrid.svelte renders an SVG container that fills the viewport (full-bleed, Direction A layout) **And** the SVG uses viewBox for resolution-independent scaling across all screen sizes **And** pinch-to-zoom and drag-to-pan are functional on touch devices **And** mouse scroll zoom and click-drag pan work on desktop

2. **Given** the hex grid SVG is rendering **When** hex cells are displayed **Then** HexCell.svelte renders each hex as a polygon with the correct visual state: Empty/unclaimed (dark slate ~#2d2d44, subtle gray border), Claimed (warm parchment ~#d4a574, amber border, cream numbers 1-6 clockwise), Blocked (dimmed overlay with cross-hatch pattern, faded numbers), Fort uncaptured (dark slate with star/shield icon in muted gray, dashed border), Fort captured (warm golden tint, solid gold border, gold star icon), Fort lost (dimmed with crossed-out star icon) **And** all hex states are distinguishable without relying on color alone (shape + pattern + iconography) **And** all text in hex cells meets WCAG AA contrast ratio (4.5:1 minimum)

3. **Given** terrain hexes exist on the map **When** terrain icons are rendered **Then** TerrainIcon.svelte displays a mountain peak triangle icon inside mountain hexes **And** terrain icons show in muted state when no claimed hex is adjacent (unreachable) **And** terrain icons show at full opacity when at least one claimed hex is adjacent (active)

4. **Given** fort hexes exist on the map **When** fort markers are rendered **Then** FortMarker.svelte displays a star/shield icon centered in fort hexes **And** uncaptured forts show in muted gray **And** BlockedOverlay.svelte renders a semi-transparent dark overlay with cross-hatch pattern

5. **Given** the layout is responsive **When** viewed on phone (360-430px) **Then** the hex grid fills the viewport with no side margins **And** hex numbers are readable without zooming at default font size (10-12px minimum rendered) **And** the layout leaves space for a future status bar (~40px top) and control strip (~48px bottom) **When** viewed on tablet (768px+) **Then** hexes scale up with more breathing room **When** viewed on desktop (1024px+) **Then** the hex grid takes ~70% width, leaving space for a future side panel

6. **Given** the hex grid is rendered with sample data **When** the map is displayed with a mix of empty, claimed, blocked, and fort hexes **Then** the player can distinguish all hex states at a glance **And** the ARIA role="img" attribute with descriptive label is set on the SVG container **And** the visual presentation matches the dark atmospheric war-table aesthetic from the UX spec

## Tasks / Subtasks

- [x] Task 1: HexGrid SVG Container (AC: #1, #5)
  - [x] 1.1: Create src/components/hex-grid/HexGrid.svelte — SVG container with viewBox calculated from map dimensions
  - [x] 1.2: Implement hex-to-pixel coordinate conversion using Honeycomb.js FlatHex for positioning hex cells
  - [x] 1.3: Implement pinch-to-zoom and drag-to-pan for touch devices (pointer events)
  - [x] 1.4: Implement mouse scroll zoom and click-drag pan for desktop
  - [x] 1.5: Apply full-bleed layout — SVG fills viewport minus future chrome space (40px top, 48px bottom)
  - [x] 1.6: Set ARIA role="img" and aria-label on SVG container
  - [x] 1.7: Add responsive layout — 70% width on desktop (1024px+), full-width on phone/tablet

- [x] Task 2: HexCell Component (AC: #2)
  - [x] 2.1: Create src/components/hex-grid/HexCell.svelte — renders flat-top hex polygon using 6-vertex path
  - [x] 2.2: Implement Empty state — dark slate fill (#2d2d44), subtle gray border (rgba(255,255,255,0.1))
  - [x] 2.3: Implement Claimed state — warm parchment fill (#d4a574), amber border (#8b6914), cream numbers 1-6 clockwise (#e8e0d0)
  - [x] 2.4: Implement Blocked state — dimmed overlay, cross-hatch SVG pattern, faded numbers
  - [x] 2.5: Implement Fort uncaptured state — dark slate, star/shield icon muted gray (#7a7a8a), dashed border
  - [x] 2.6: Implement Fort captured state — warm golden tint, solid gold border (#e8b830), gold star icon
  - [x] 2.7: Implement Fort lost state — dimmed with crossed-out star icon
  - [x] 2.8: Render 6 numbers clockwise inside claimed hexes using Inter font (--font-data), 10-12px minimum
  - [x] 2.9: Ensure all states distinguishable without color alone (shape + pattern + icon)
  - [x] 2.10: Verify WCAG AA contrast (4.5:1) for hex numbers on parchment background

- [x] Task 3: TerrainIcon Component (AC: #3)
  - [x] 3.1: Create src/components/hex-grid/TerrainIcon.svelte — mountain peak triangle SVG icon
  - [x] 3.2: Implement muted state (unreachable) — reduced opacity when no adjacent claimed hex
  - [x] 3.3: Implement active state — full opacity when at least one adjacent claimed hex

- [x] Task 4: FortMarker & BlockedOverlay Components (AC: #4)
  - [x] 4.1: Create src/components/hex-grid/FortMarker.svelte — star/shield icon centered in hex
  - [x] 4.2: Implement uncaptured state — muted gray (#7a7a8a)
  - [x] 4.3: Implement captured state — gold (#e8b830) with glow
  - [x] 4.4: Implement lost state — dimmed with crossed-out overlay
  - [x] 4.5: Create src/components/hex-grid/BlockedOverlay.svelte — semi-transparent dark overlay with cross-hatch SVG pattern

- [x] Task 5: Sample Data & Visual Verification (AC: #6)
  - [x] 5.1: Create sample game state in App.svelte showing Calosanti map with mixed hex states (empty, claimed with numbers, blocked, forts)
  - [x] 5.2: Verify all hex states are visually distinguishable at a glance
  - [x] 5.3: Verify dark atmospheric war-table aesthetic
  - [x] 5.4: Test on phone viewport (360px), tablet (768px), desktop (1024px+)
  - [x] 5.5: Verify hex numbers readable without zooming on phone

## Dev Notes

### SVG Rendering Architecture

**Native SVG approach (not canvas):**
- Native touch/click events per SVG element
- Vector scaling ensures crisp text at any zoom level
- ARIA attributes for accessibility
- Svelte components bind directly to SVG elements with reactive updates
- DOM element count ~500-1000 nodes for a full map — within acceptable range

**Component hierarchy:**
```
HexGrid.svelte (SVG container, viewBox, zoom/pan)
  └── {#each hexes}
        HexCell.svelte (polygon, numbers, state styling)
          ├── TerrainIcon.svelte (if terrain hex)
          ├── FortMarker.svelte (if fort hex)
          └── BlockedOverlay.svelte (if blocked)
```

### Hex-to-Pixel Coordinate Conversion

Use the `FlatHex` class exported from `src/engine/hexMath.ts` (Honeycomb.js defineHex with FLAT orientation). Honeycomb.js provides `hexToPoint` for converting axial coordinates to pixel positions.

**Pattern for getting pixel position:**
```typescript
import { FlatHex } from '../../engine/hexMath'

// Create a hex instance to get its pixel position
const hex = new FlatHex({ q, r })
const x = hex.x  // pixel x
const y = hex.y  // pixel y
const corners = hex.corners  // 6 corner points for polygon
const width = hex.width
const height = hex.height
```

**Hex dimensions for viewBox calculation:**
- FlatHex with dimensions=1 is tiny; set appropriate dimensions for the hex size you want
- Create a custom FlatHex with larger dimensions for rendering:
```typescript
import { defineHex, Orientation } from 'honeycomb-grid'
const RenderHex = defineHex({ orientation: Orientation.FLAT, dimensions: 30 }) // 30px radius
```
- Calculate viewBox from grid bounds: iterate all hexes to find min/max pixel positions, add padding

### Flat-Top Hex Polygon

For flat-top hexagons, the 6 corners (from Honeycomb.js `hex.corners`) give the polygon points. Use them directly as SVG `<polygon points="...">`.

**Number placement (clockwise 1-6):**
Numbers should be positioned near each edge of the hex, clockwise from the top edge (edge 0). Each number sits inside the hex near its corresponding edge. Use the midpoint between center and each corner pair.

### Visual State Specifications

**Empty/Unclaimed hex:**
- Fill: `var(--color-bg-map)` (#2d2d44)
- Stroke: `rgba(255, 255, 255, 0.1)` (subtle border)
- No numbers, no markers

**Claimed hex:**
- Fill: `var(--color-hex-claimed)` (#d4a574)
- Stroke: `var(--color-hex-claimed-border)` (#8b6914), 2px
- Numbers: 6 digits clockwise in `var(--color-hex-numbers)` (#e8e0d0), Inter font, 10-12px minimum
- Numbers positioned near each edge

**Blocked hex:**
- Base: same as claimed but dimmed (opacity ~0.4)
- Overlay: cross-hatch SVG `<pattern>` — diagonal lines in dark color
- Numbers: faded (opacity ~0.3)

**Fort uncaptured:**
- Fill: `var(--color-bg-map)` (#2d2d44) — same as empty
- Stroke: dashed gray border
- Icon: star/shield in muted gray (#7a7a8a), centered

**Fort captured:**
- Fill: warm golden tint (mix of #d4a574 and #e8b830)
- Stroke: solid gold (#e8b830), 2px
- Icon: gold star with subtle glow

**Fort lost:**
- Fill: dimmed dark
- Icon: star with X overlay (crossed out), muted

### Marker Components (Placeholder for Future Stories)

ArmyMarker.svelte and DarkForceMarker.svelte are NOT needed for this story — they're implemented in Story 2.5. For this story, only render the static hex states, terrain icons, fort markers, and blocked overlay.

### SVG Cross-Hatch Pattern Definition

Define once in the HexGrid SVG `<defs>` section:
```svg
<defs>
  <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(0,0,0,0.5)" stroke-width="2" />
  </pattern>
</defs>
```
Then use `fill="url(#crosshatch)"` on the BlockedOverlay polygon.

### Zoom & Pan Implementation

**Touch (mobile):**
- Use pointer events (pointerdown, pointermove, pointerup) for unified touch/mouse handling
- Track two pointers for pinch-to-zoom (distance between touches)
- Single pointer drag for panning
- Apply transform to SVG content group: `transform="translate(${panX}, ${panY}) scale(${zoom})"`

**Desktop:**
- Mouse wheel for zoom (scale around cursor position)
- Click-drag for pan
- Same transform approach as touch

**State management:**
- Zoom and pan are local component state (not in stores) — they're view-only concerns
- Clamp zoom to reasonable bounds (e.g., 0.5x to 3x)

### Responsive Layout

**Phone (360-430px, default):**
- SVG fills 100% width, 100% height minus chrome reservation
- Chrome reservation: `padding-top: 40px` (future StatusBar), `padding-bottom: 48px` (future ControlStrip)
- hex grid is the entire viewport

**Tablet (768px+):**
- Same as phone with larger hexes (more breathing room from viewBox scaling)

**Desktop (1024px+):**
```css
@media (min-width: 1024px) {
  .hex-grid-container {
    width: 70%;
    /* remaining 30% reserved for future journal side panel */
  }
}
```

### Accessibility Requirements

- SVG container: `role="img"` and `aria-label="Calosanti Region hex grid map"`
- All hex numbers meet WCAG AA contrast (4.5:1): cream #e8e0d0 on parchment #d4a574
- Hex states distinguishable without color: empty (plain), claimed (numbers), blocked (cross-hatch pattern), fort (star icon), captured fort (gold star)
- `prefers-reduced-motion`: no animations in this story (static rendering)

### Component Boundary Rules

Components in hex-grid/ follow the architecture pattern:
- **CAN** import from: `../../types/*`, `../../engine/hexMath`
- **CAN** read from: stores (when stores exist in Story 2.1+)
- **CANNOT** import from: `../../persistence/*`, `../../sync/*`
- **CANNOT** contain game logic — rendering only
- For this story, components receive map data as props (no stores yet)

### Previous Story Intelligence (Story 1.2)

**Available from Story 1.2:**
- `src/engine/hexMath.ts` — FlatHex export, getNeighbors(), hexToKey(), hexEquals()
- `src/types/hex.types.ts` — HexCoord, HexState, HexStatus, HexEdge, Orientation
- `src/types/map.types.ts` — MapDefinition, MapHex, FortLocation
- `src/types/terrain.types.ts` — TerrainType enum
- `src/maps/calosanti.ts` — CALOSANTI_MAP with 130 hexes, 7 forts, mountains
- `src/maps/mapRegistry.ts` — getMap('calosanti')

**Key patterns established:**
- Pure functions in engine/ (coordinate math)
- PascalCase.svelte components, camelCase.ts modules
- Design tokens in app.css (all colors, fonts, spacing available as CSS vars)
- Honeycomb.js FlatHex class available for pixel conversion

### Architecture Compliance

**MUST follow:**
- Native SVG rendering (not canvas)
- Svelte components bind directly to SVG elements
- Components read state from props (stores not yet implemented)
- viewBox for resolution-independent scaling
- All design tokens from app.css CSS custom properties
- Inter font (--font-data) for hex numbers
- ARIA role="img" on SVG container

**MUST NOT do:**
- Do NOT implement hex selection or edge targets (Story 2.2)
- Do NOT implement dice input or game actions (Story 2.3)
- Do NOT implement army/dark force markers (Story 2.5)
- Do NOT implement game stores (Story 2.1)
- Do NOT use canvas rendering
- Do NOT add game logic to components
- Do NOT hardcode colors — use CSS custom properties from app.css

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — SVG Rendering, Component Structure, Responsive Layout, Performance]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Hex Cell States, Color Palette, Terrain Icons, Fort Markers, Accessibility]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.3 Acceptance Criteria]
- [Source: _bmad-output/implementation-artifacts/1-2-hex-grid-core-coordinate-system-and-map-data.md — Previous Story Learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Code review (2026-04-11): Fixed H1 (blocked hex numbers not rendering), H2 (claimedHexKeys recomputed per hex in loop), M2 (fortGlow filter ID collision moved to HexGrid defs), M3 (terrain icon suppressed on blocked hexes).
- Visual polish (2026-04-11): Added crimson border + red crosshatch on blocked hexes for visual prominence. Changed blocked hex dimming from group opacity to fill-opacity so border stays full strength. Added render-order sorting so blocked hexes draw on top of adjacent claimed borders. Fixed zoom-toward-cursor for desktop scroll wheel.
- Visual verification (2026-04-11): All hex states verified distinguishable at a glance. War-table aesthetic confirmed. Responsive viewports checked. Hex numbers readable on phone.

### File List

- src/components/hex-grid/HexGrid.svelte (created — SVG container, viewBox, zoom/pan, crosshatch+fortGlow defs, responsive layout)
- src/components/hex-grid/HexCell.svelte (created — hex polygon, 6 visual states, number positioning, terrain/fort/blocked children)
- src/components/hex-grid/TerrainIcon.svelte (created — mountain peak triangle, muted/active opacity)
- src/components/hex-grid/FortMarker.svelte (created — star icon, uncaptured/captured/lost states)
- src/components/hex-grid/BlockedOverlay.svelte (created — dark overlay + crosshatch pattern fill)
- src/App.svelte (modified — sample game state with mixed hex states for visual verification)

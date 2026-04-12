# Story 2.5: Army Detection & Status Display

Status: done

## Story

As a player,
I want to see armies automatically detected and marked when matching numbers are adjacent,
So that I can track my forces growing across the battlefield.

## Acceptance Criteria

1. **Given** a new hex has been placed **When** the rule engine checks for armies (FR8) **Then** ALL adjacent hexes are scanned (not just the source hex) **And** every pair of matching numbers on adjacent sides between any neighboring claimed hexes results in an army **And** armyDetector.ts in engine/ performs this scan as a pure function **And** armyDetector.test.ts tests single-match, multi-match, and no-match scenarios across various neighbor configurations

2. **Given** armies are detected **When** the cascade animation plays (Beat 2, ~200ms after Beat 1) **Then** ArmyMarker.svelte renders gold circle overlays on each matching number pair **And** the army markers animate into place (or appear instantly if prefers-reduced-motion is enabled)

3. **Given** the turn has resolved **When** the status display updates **Then** StatusBar.svelte renders as a translucent floating overlay at the top of the screen (~40px) **And** it displays the current turn number **And** it uses a semi-transparent background with backdrop blur (UX-DR8) **And** StatusBar has an ARIA live region for screen reader announcements

4. **Given** the turn has resolved **When** the turn summary appears **Then** TurnSummary.svelte renders a compact text strip above the control strip (e.g., "Turn 3: +1 Army") **And** the summary persists until the next turn begins **And** tapping the summary expands it to show full turn detail (UX-DR7)

5. **Given** the game view is active **When** the control strip renders **Then** ControlStrip.svelte renders as a translucent floating overlay at the bottom of the screen (~48px) **And** it contains buttons for undo (disabled until Epic 4), journal toggle (disabled until Epic 5), rules reference (disabled until Epic 4), and settings/menu **And** all buttons are at least 44x44px **And** the control strip uses the same translucent backdrop blur treatment as the status bar (UX-DR9, UX-DR25)

## Tasks / Subtasks

- [x] Task 1: Army Detector Engine Module (AC: #1)
  - [x] 1.1: Create src/engine/armyDetector.ts — pure function `detectArmies(snapshot): ArmyUpdate[]`
  - [x] 1.2: Compares numbers on shared edges between neighboring claimed hexes using getOppositeEdge
  - [x] 1.3: Returns `ArmyUpdate[]` with hexKey and edgeIndex for each army placement
  - [x] 1.4: 5 tests: single match, multiple matches, no matches, no duplicates, ignores blocked hexes

- [x] Task 2: Integrate Army Detection into Rule Engine (AC: #1)
  - [x] 2.1: After placing hex in resolvePlaceHex, calls detectArmies on the new snapshot
  - [x] 2.2: Groups army updates by hex key and merges into armies arrays
  - [x] 2.3: Runs on FULL snapshot — detects armies across all claimed neighbors
  - [x] 2.4: Covered by armyDetector tests + existing ruleEngine tests

- [x] Task 3: ArmyMarker Component (AC: #2)
  - [x] 3.1: Create src/components/hex-grid/ArmyMarker.svelte — gold circle with dark stroke
  - [x] 3.2: Positioned at same edge midpoint as numbers using cornerOffset
  - [x] 3.3: Uses `var(--color-army)` (#f0c040) fill
  - [x] 3.4: Rendered in HexCell for each entry in hexState.armies with pointer-events="none"

- [x] Task 4: StatusBar Component (AC: #3)
  - [x] 4.1: Create src/components/game/StatusBar.svelte — fixed top, 40px, translucent
  - [x] 4.2: Displays Turn N, Dark Force tally, Forts captured/total
  - [x] 4.3: Backdrop blur, z-index var(--z-chrome), dark bg
  - [x] 4.4: aria-live="polite" for screen readers
  - [x] 4.5: Rendered in App.svelte, receives snapshot data as props

- [x] Task 5: ControlStrip Component (AC: #5)
  - [x] 5.1: Create src/components/game/ControlStrip.svelte — fixed bottom, 48px, translucent
  - [x] 5.2: Undo, Journal, Rules, Menu buttons — all disabled for now
  - [x] 5.3: All buttons 44x44px minimum
  - [x] 5.4: Z-index var(--z-chrome), backdrop blur
  - [x] 5.5: Rendered in App.svelte

- [x] Task 6: TurnSummary Component (AC: #4)
  - [x] 6.1: Create src/components/game/TurnSummary.svelte — fixed above control strip
  - [x] 6.2: Displays "Turn N: +X Army" or "Turn N: No armies" or "Source blocked"
  - [x] 6.3: Persists until next turn (updated on each dispatch)
  - [x] 6.4: Tap to expand/collapse detailed breakdown
  - [x] 6.5: App.svelte tracks armiesGained and sourceBlocked per turn

- [x] Task 7: Visual Verification (AC: #1-#5)
  - [x] 7.1: Verify army ovals appear spanning matching adjacent numbers after hex placement
  - [x] 7.2: Verify StatusBar shows turn number, Dark Force tally, fort count at top
  - [x] 7.3: Verify ControlStrip shows at bottom with disabled buttons
  - [x] 7.4: Verify TurnSummary shows after each turn with army count
  - [x] 7.5: Play several turns and verify armies detected correctly

## Dev Notes

### Army Detection Algorithm

For each pair of neighboring CLAIMED hexes, compare the numbers on their shared edges:

```typescript
import { getNeighbors, hexToKey, getEdgeDirection } from './hexMath'
import type { HexEdge } from '../types/hex.types'

interface ArmyUpdate {
  hexKey: string
  edgeIndex: number
}

function detectArmies(snapshot: GameSnapshot): ArmyUpdate[] {
  const armies: ArmyUpdate[] = []
  const processed = new Set<string>() // avoid duplicate checks

  for (const [key, hex] of snapshot.hexes) {
    if (hex.status !== HexStatus.Claimed || !hex.numbers) continue

    const neighbors = getNeighbors(hex.coord)
    for (let edge = 0; edge < 6; edge++) {
      const neighborKey = hexToKey(neighbors[edge])
      const pairKey = [key, neighborKey].sort().join(':')
      if (processed.has(pairKey)) continue
      processed.add(pairKey)

      const neighbor = snapshot.hexes.get(neighborKey)
      if (!neighbor || neighbor.status !== HexStatus.Claimed || !neighbor.numbers) continue

      // Compare numbers on shared edge
      const myNumber = hex.numbers[edge]
      const theirEdge = getOppositeEdge(edge as HexEdge)
      const theirNumber = neighbor.numbers[theirEdge]

      if (myNumber === theirNumber) {
        armies.push({ hexKey: key, edgeIndex: edge })
        armies.push({ hexKey: neighborKey, edgeIndex: theirEdge })
      }
    }
  }

  return armies
}
```

### ArmyMarker Visual

Per UX spec (UX-DR22): Army markers are gold circles. They should be drawn near the matching number, at the edge midpoint. Use the same corner offset as number positioning.

```svelte
<!-- Gold circle at edge position -->
<circle
  cx={pos.x}
  cy={pos.y}
  r={radius * 0.15}
  fill="var(--color-army)"
  opacity="0.8"
  pointer-events="none"
/>
```

### Applying Army Updates to Snapshot

After detectArmies returns, update each hex's `armies` array in the snapshot:

```typescript
// Group army updates by hex key
const armiesByHex = new Map<string, number[]>()
for (const update of armyUpdates) {
  const existing = armiesByHex.get(update.hexKey) ?? []
  if (!existing.includes(update.edgeIndex)) {
    existing.push(update.edgeIndex)
  }
  armiesByHex.set(update.hexKey, existing)
}

// Update hex states
for (const [hexKey, edges] of armiesByHex) {
  const hex = newHexes.get(hexKey)!
  const existingArmies = hex.armies ?? []
  const combined = [...new Set([...existingArmies, ...edges])]
  newHexes.set(hexKey, { ...hex, armies: combined })
}
```

### StatusBar / ControlStrip Layout

Both use the same translucent overlay treatment:
```css
.chrome-bar {
  position: fixed;
  left: 0;
  right: 0;
  z-index: var(--z-chrome);
  background: rgba(26, 26, 46, 0.85);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
}
```

StatusBar: `top: 0; height: 40px;`
ControlStrip: `bottom: 0; height: 48px;`

The HexGrid container already reserves space: `margin-top: 40px` and `height: calc(100svh - 40px - 48px)`.

### Architecture Compliance

**MUST follow:**
- armyDetector in engine/ as pure function — no store/component imports
- ArmyMarker in components/hex-grid/
- StatusBar, ControlStrip, TurnSummary in components/game/
- CSS custom properties for all colors and layout
- ARIA live region on StatusBar

**MUST NOT do:**
- Do NOT implement Dark Force detection (Story 3.1)
- Do NOT implement blocked hex rules from duplicate rolls (Story 3.1)
- Do NOT implement terrain resolution (Story 3.3)
- Do NOT implement fort capture detection (Story 3.3)
- Do NOT implement undo functionality (Epic 4) — button is present but disabled

### Previous Story Intelligence (Story 2.4)

**Available from prior stories:**
- `src/engine/ruleEngine.ts` — resolveAction with placeHex, dice-determines-direction, off-map blocking
- `src/engine/hexMath.ts` — getNeighbors, getOppositeEdge, hexToKey, getEdgeDirection
- `src/stores/gameStore.svelte.ts` — startGame, dispatch, gameState
- `src/components/hex-grid/HexGrid.svelte` — CORNER_OFFSET for edge-to-corner mapping, reactive rendering
- `src/components/hex-grid/HexCell.svelte` — renders hex with numbers, pointer-events on children, isNewlyPlaced animation
- `src/types/hex.types.ts` — HexState.armies is `number[]` (edge indices with armies)
- `src/app.css` — hex-fill-appear and hex-numbers-appear animations, design tokens

**Key patterns:**
- CORNER_OFFSET maps edge indices to Honeycomb corner pairs — ArmyMarker needs this for positioning
- Numbers positioned at `corners[(i + cornerOffset) % 6]` midpoints — army markers go at same positions
- HexCell already has `pointer-events="none"` pattern for overlay elements

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — ArmyMarker, StatusBar, ControlStrip in component structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR7 TurnSummary, UX-DR8 StatusBar, UX-DR9 ControlStrip, UX-DR22 army markers]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2 Story 2.5 Acceptance Criteria]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Army detector scans all claimed hex pairs for matching adjacent numbers using getOppositeEdge. 5 tests.
- Integrated into ruleEngine — detectArmies called after placement, armies merged into hex states
- ArmyMarker renders as a single gold oval spanning both matching numbers across the shared hex edge
- Army pairs computed at HexGrid level using hex geometry + CORNER_OFFSET for correct positioning
- StatusBar: fixed top, translucent, shows Turn N / Dark Force / Forts with aria-live
- ControlStrip: fixed bottom, translucent, 4 disabled buttons (Undo/Journal/Rules/Menu)
- TurnSummary: above control strip, shows "+X Army" or "Source blocked", tap to expand
- All 76 tests pass, zero type errors

### File List

- src/engine/armyDetector.ts (created — detectArmies pure function, ArmyUpdate type)
- src/engine/armyDetector.test.ts (created — 5 tests for matching, non-matching, blocked, duplicates)
- src/engine/ruleEngine.ts (modified — calls detectArmies after placement, merges armies into snapshot)
- src/components/hex-grid/ArmyMarker.svelte (created — gold ellipse spanning two number positions)
- src/components/hex-grid/HexGrid.svelte (modified — armyPairs computed reactively, rendered after HexCells)
- src/components/hex-grid/HexCell.svelte (modified — removed per-cell army rendering)
- src/components/game/StatusBar.svelte (created — turn/DF/forts display, translucent, aria-live)
- src/components/game/ControlStrip.svelte (created — 4 disabled buttons, translucent)
- src/components/game/TurnSummary.svelte (created — turn result text, expandable)
- src/App.svelte (modified — StatusBar, ControlStrip, TurnSummary integration, army count tracking)

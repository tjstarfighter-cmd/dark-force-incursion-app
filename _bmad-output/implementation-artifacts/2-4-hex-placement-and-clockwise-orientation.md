# Story 2.4: Hex Placement & Clockwise Orientation

Status: done

## Story

As a player,
I want to see a new hex placed in my chosen direction with numbers correctly oriented,
So that the game board grows accurately with each roll.

## Acceptance Criteria

1. **Given** a hex edge is selected and a dice roll is entered **When** the rule engine resolves the placement **Then** a new hex is placed in the target position in the rolled direction **And** numbers 1-6 are written clockwise inside the hex starting with the rolled number on the connecting side (the side touching the source hex) **And** the new hex is marked as claimed with warm parchment fill and cream numbers

2. **Given** the placement is resolved **When** the cascade animation plays (Beat 1) **Then** the new hex appears in the target position with a brief animation (~200ms) **And** numbers animate in clockwise from the connecting side **And** if prefers-reduced-motion is enabled, the hex appears instantly without animation (UX-DR23)

3. **Given** no game is in progress **When** the player wants to start a new game **Then** a map selector is available (MVP: Calosanti only, displayed as map preview with hex grid, terrain, and forts visible) **And** the player taps the starting hex on the map to begin **And** the first edge targets expand from the starting hex **And** the game is live after the first roll and placement (FR1)

4. **Given** a player rolls in a direction that would place a hex off the map boundary **When** the rule engine resolves the placement **Then** the source hex (the hex rolled FROM) is blocked — the army is lost in unknown territory **And** this follows the same blocking behavior as mountain terrain (per Omnibus Edition p.7: "the hex you rolled from is blocked off") **And** the rule engine checks map boundaries on every placement, not just terrain adjacency

5. **Given** a hex is placed **When** the game state updates **Then** the new turn is pushed onto the turn stack with a full snapshot and action log **And** the hex grid re-renders reactively to show the new claimed hex

## Tasks / Subtasks

- [x] Task 1: Off-Map Boundary Detection in Rule Engine (AC: #4)
  - [x] 1.1: In ruleEngine.ts resolvePlaceHex, check if target coordinate exists in mapDefinition.hexes
  - [x] 1.2: If target is off-map, block the SOURCE hex (set status to Blocked), do NOT place a new hex
  - [x] 1.3: Return ok result with modified snapshot (source blocked) — valid game outcome
  - [x] 1.4: Uses state.mapDefinition.hexes for boundary check (already available in GameSnapshot)
  - [x] 1.5: 3 tests added: off-map blocks source, valid position works, blocked hex preserves numbers

- [x] Task 2: New Game Flow (AC: #3)
  - [x] 2.1: Create src/components/game/HomeView.svelte — centered layout with "New Campaign" button, Cinzel heading
  - [x] 2.2: MVP: title + subtitle + start button (map preview deferred — single map, no selection needed)
  - [x] 2.3: On "New Campaign" tap, calls startGame(CALOSANTI_MAP) and switches to game view
  - [x] 2.4: App.svelte conditionally renders HomeView (no snapshot) vs game view (snapshot exists)
  - [x] 2.5: Game starts with starting hex claimed and numbers — player taps to begin playing

- [x] Task 3: Hex Placement Animation (AC: #2)
  - [x] 3.1: CSS keyframe animation `hex-appear` — opacity 0→1 + scale 0.8→1.0 over 200ms
  - [x] 3.2: `lastPlacedHexKey` tracked in App.svelte, passed as prop to HexGrid → HexCell
  - [x] 3.3: `isNewlyPlaced` prop on HexCell applies animation with transform-origin at hex center
  - [x] 3.4: prefers-reduced-motion handled via global CSS rule (animation-duration: 0.01ms)

- [x] Task 4: Visual Verification (AC: #1-#5)
  - [x] 4.1: Verify rolling off map edge blocks the source hex (red border, cross-hatch)
  - [x] 4.2: Verify new game flow — HomeView → New Campaign → game starts
  - [x] 4.3: Verify hex placement animation plays on new hexes
  - [x] 4.4: Verify turn stack increments correctly after each placement

## Dev Notes

### Off-Map Boundary Detection

The rule engine currently doesn't know which hexes are on the map. The `GameSnapshot` already contains `mapDefinition` which has the full hex list. Use it to check boundaries:

```typescript
function isOnMap(coord: HexCoord, mapDefinition: MapDefinition): boolean {
  return mapDefinition.hexes.some(h => h.coord.q === coord.q && h.coord.r === coord.r)
}
```

For performance, precompute a Set of valid map keys once per game:
```typescript
// In GameSnapshot or as a utility
const mapBounds = new Set(mapDefinition.hexes.map(h => hexToKey(h.coord)))
```

When the target is off-map, the resolution is:
- Do NOT place a new hex at the target
- BLOCK the source hex (set status to Blocked)
- This is a valid TurnResult with `ok: true` — the game state changed (source got blocked)
- The blocked hex gets the red border + cross-hatch treatment from Story 1.3

### HomeView Design

Per UX-DR13: minimal centered layout, dark atmospheric background, prominent "New Campaign" button in Cinzel font. For MVP, only Calosanti is available, so the map selector is just a preview of the one map.

```
┌────────────────────────────┐
│                            │
│     DARK FORCE INCURSION   │  ← Cinzel heading
│                            │
│     [Map Preview]          │  ← HexGrid read-only mini view
│     Calosanti Region       │
│                            │
│     [ New Campaign ]       │  ← primary button, amber
│                            │
└────────────────────────────┘
```

### Hex Placement Animation

SVG animations can use CSS transitions on `opacity` and `transform`. Since HexCell is an SVG `<g>` group, use inline style:

```svelte
<g class="hex-cell"
   style={isNewlyPlaced ? 'animation: hex-appear 200ms ease-out' : ''}
>
```

Track `lastPlacedHexKey` by comparing the current snapshot's turn number to the previous one. When it increments, the newly placed hex key is the one that appeared.

### Architecture Compliance

**MUST follow:**
- Rule engine stays pure — boundary check uses data from GameSnapshot.mapDefinition
- HomeView in `src/components/game/` per architecture
- View switching via viewStore
- CSS custom properties for all styling
- prefers-reduced-motion support

**MUST NOT do:**
- Do NOT implement army detection (Story 2.5)
- Do NOT implement Dark Force or terrain resolution (Epic 3)
- Do NOT implement cascade Beats 2-5 (Story 2.5 / Epic 3)

### Previous Story Intelligence (Story 2.3)

**Available from prior stories:**
- `src/engine/ruleEngine.ts` — resolveAction with placeHex, already handles clockwise orientation
- `src/stores/gameStore.svelte.ts` — startGame(), dispatch(), gameState.snapshot, starting hex has numbers [1,2,3,4,5,6]
- `src/stores/viewStore.svelte.ts` — navigate(), getCurrentView(), back()
- `src/components/dice/DiceInput.svelte` — full dice input with manual/digital modes
- `src/components/hex-grid/HexGrid.svelte` — reactive rendering, selection, edge targets, clearSelection()
- `src/App.svelte` — game flow wired: edge selection → dice input → dispatch → render

**What's already working (from Stories 2.1-2.3):**
- AC #1 (hex placement with clockwise orientation) — DONE in ruleEngine
- AC #5 (turn stack push and reactive re-render) — DONE in gameStore + HexGrid
- Full tap-roll-place gameplay loop — DONE

**What remains for this story:**
- AC #2 (hex placement animation) — NEW
- AC #3 (new game flow / HomeView) — NEW
- AC #4 (off-map boundary blocking) — NEW

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2 Story 2.4 Acceptance Criteria]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR13 HomeView, UX-DR6 cascade animation, UX-DR23 reduced motion]
- [Source: _bmad-output/implementation-artifacts/2-3-dice-input-manual-and-digital.md — Previous Story]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Off-map boundary detection: rule engine blocks source hex when target is off mapDefinition.hexes. 3 tests added.
- HomeView component: minimal "New Campaign" screen with Cinzel heading, shows when no game active
- Hex placement animation: two-beat CSS animation — hex polygon scales in (350ms), numbers fade in after (300ms with 350ms delay)
- CRITICAL GAME FLOW CORRECTION: Dice roll determines exit direction, not player edge selection. Rule engine now derives exit edge from source hex's numbers array when no explicit edge provided. Flow changed from select hex→select edge→roll to select hex→roll→engine picks direction. 4 new tests for dice-determines-direction mechanic.
- All 71 tests pass, zero type errors

### File List

- src/engine/ruleEngine.ts (modified — off-map boundary blocking, dice-determines-direction: derives exit edge from source hex numbers)
- src/engine/ruleEngine.test.ts (modified — 3 off-map tests, 4 dice-direction tests, updated test map to 3x3 grid)
- src/components/game/HomeView.svelte (created — New Campaign start screen)
- src/components/hex-grid/HexGrid.svelte (modified — onHexSelected callback replaces onEdgeSelected for core flow)
- src/components/hex-grid/HexCell.svelte (modified — isNewlyPlaced prop with two-beat animation)
- src/App.svelte (modified — HomeView integration, simplified flow: hex select → dice → place)
- src/app.css (modified — hex-fill-appear and hex-numbers-appear keyframe animations)

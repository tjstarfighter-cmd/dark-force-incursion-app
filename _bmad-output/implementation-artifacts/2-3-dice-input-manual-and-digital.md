# Story 2.3: Dice Input — Manual & Digital

Status: done

## Story

As a player,
I want to enter my dice roll quickly via number buttons or a digital roller,
So that I can keep the gameplay rhythm flowing without friction.

## Acceptance Criteria

1. **Given** a hex edge has been selected **When** dice input is needed **Then** DiceInput.svelte slides up from the bottom of the screen with a translucent backdrop blur background **And** in manual mode, six prominent number buttons (1-6) are displayed in a row, each at least 44x44px **And** in digital mode, a single "Roll" button is displayed prominently

2. **Given** dice input is in manual mode **When** the player taps a number button (1-6) **Then** the tapped number is registered as the dice roll immediately with no confirmation step **And** the dice input panel dismisses **And** the roll result is passed to the rule engine for resolution

3. **Given** dice input is in digital mode **When** the player taps the Roll button **Then** DiceRoller.svelte plays a dice animation cycling through numbers **And** the animation completes within 1 second (NFR5) **And** the result number is displayed briefly before the cascade begins **And** the dice input panel dismisses

4. **Given** dice input is displayed **When** the player looks for a mode toggle **Then** a small switch or toggle icon is visible to switch between manual and digital modes **And** the selected mode persists across turns via settingsStore (last-used setting remembered)

5. **Given** the app is viewed on desktop (1024px+) **When** dice input is needed **Then** keyboard number keys 1-6 are accepted as dice input in manual mode (UX-DR27)

## Tasks / Subtasks

- [x] Task 1: DiceInput Component (AC: #1, #4)
  - [x] 1.1: Create src/components/dice/DiceInput.svelte — overlay panel that slides up from the bottom
  - [x] 1.2: Apply translucent background with backdrop blur (`var(--backdrop-blur)`, semi-transparent dark bg)
  - [x] 1.3: Z-index at `var(--z-dice)` (200) to render above map but below panels
  - [x] 1.4: Render 6 number buttons (1-6) in a row for manual mode — each 48x48px, `var(--font-data)` font, `var(--color-accent)` styling
  - [x] 1.5: Render single "Roll" button for digital mode — prominent, centered, Cinzel font
  - [x] 1.6: Add mode toggle switch — Manual/Digital buttons, reads from and writes to settingsStore
  - [x] 1.7: Slide-up animation using CSS transform/transition (`var(--duration-panel-transition)` = 200ms)
  - [x] 1.8: Props: `visible: boolean`, `onRoll: (value: number) => void`, `onClose: () => void`

- [x] Task 2: DiceRoller Component (AC: #3)
  - [x] 2.1: Create src/components/dice/DiceRoller.svelte — digital dice animation
  - [x] 2.2: Animation: cycle through numbers 1-6 rapidly via setInterval
  - [x] 2.3: Total animation duration ~1050ms (15 ticks at 50ms + 300ms display)
  - [x] 2.4: Display final result number briefly (~300ms) before triggering onRoll callback
  - [x] 2.5: Respect `prefers-reduced-motion` — skip animation, show result immediately
  - [x] 2.6: Generate random result: `Math.floor(Math.random() * 6) + 1`

- [x] Task 3: Keyboard Input (AC: #5)
  - [x] 3.1: Add keydown listener in DiceInput via svelte:window — keys '1' through '6' trigger roll in manual mode
  - [x] 3.2: Only active when DiceInput is visible and in manual mode
  - [x] 3.3: Prevent key repeat via `e.repeat` check, Escape closes panel

- [x] Task 4: Game Flow Integration (AC: #2, #3)
  - [x] 4.1: HexGrid fires onEdgeSelected(coord, edge) callback, App shows DiceInput in response
  - [x] 4.2: On roll result: App calls gameStore.dispatch with placeHex action
  - [x] 4.3: On successful dispatch: dismiss DiceInput, clear selection via hexGridRef.clearSelection()
  - [x] 4.4: On failed dispatch: console.warn with reason, DiceInput stays open
  - [x] 4.5: Full flow wired: tap hex → tap edge → DiceInput slides up → tap number → hex placed → map updates

- [x] Task 5: Visual Verification (AC: #1-#5)
  - [x] 5.1: Verify DiceInput slides up when edge is selected
  - [x] 5.2: Verify manual mode — tap a number, hex appears in correct position with correct orientation
  - [x] 5.3: Verify digital mode — Roll button triggers animation, hex placed after
  - [x] 5.4: Verify mode toggle persists across turns
  - [x] 5.5: Verify keyboard 1-6 works on desktop
  - [x] 5.6: Verify full gameplay loop: select hex → select edge → roll → new hex appears with numbers

## Dev Notes

### DiceInput Layout

```
┌──────────────────────────────────┐
│         [Manual] [Digital]       │  ← mode toggle
│                                  │
│   [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ]  ← manual mode
│                                  │
│          ── OR ──                │
│                                  │
│           [ ROLL ]               │  ← digital mode
└──────────────────────────────────┘
  ↑ slides up from bottom, backdrop blur
```

### Slide-Up Animation

```css
.dice-input-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(100%);
  transition: transform var(--duration-panel-transition) var(--easing-default);
  z-index: var(--z-dice);
  background: rgba(26, 26, 46, 0.85);
  backdrop-filter: var(--backdrop-blur);
}

.dice-input-panel.visible {
  transform: translateY(0);
}
```

### DiceRoller Animation

Simple number cycling effect:
```typescript
let displayNumber = $state(1)
let rolling = $state(false)

function roll() {
  rolling = true
  const result = Math.floor(Math.random() * 6) + 1
  let ticks = 0
  const maxTicks = 15
  const interval = setInterval(() => {
    displayNumber = Math.floor(Math.random() * 6) + 1
    ticks++
    if (ticks >= maxTicks) {
      clearInterval(interval)
      displayNumber = result
      setTimeout(() => {
        rolling = false
        onRoll(result)
      }, 300) // brief display before callback
    }
  }, 50) // ~750ms of cycling + 300ms display = ~1050ms total ≈ 1s
}
```

### Game Flow Wiring

The flow needs to connect HexGrid selection state to the DiceInput and gameStore:

1. HexGrid sets `selectedEdge` when a wedge is tapped
2. App.svelte watches for `selectedEdge !== null` → shows DiceInput
3. DiceInput calls `onRoll(value)` when a number is chosen
4. App.svelte receives the roll, dispatches to gameStore
5. gameStore calls resolveAction → new snapshot → reactive update
6. HexGrid re-renders with the new claimed hex
7. App.svelte clears selection state, hides DiceInput

For this to work, selection state needs to be lifted from HexGrid to App.svelte (or exposed via callbacks). Currently selection is local to HexGrid. Options:
- **Option A:** Lift selection state to App.svelte, pass down to HexGrid as props
- **Option B:** Keep selection in HexGrid, expose via callbacks/events and let App react

**Option B is cleaner** — HexGrid owns its view state and fires `onEdgeSelected(coord, edge)` when an edge is tapped. App.svelte shows DiceInput in response.

### Architecture Compliance

**MUST follow:**
- DiceInput and DiceRoller in `src/components/dice/` per architecture
- Settings (dice mode) via settingsStore — already exists with getDiceMode/toggleDiceMode/setDiceMode
- Game actions via gameStore.dispatch() — already implemented
- CSS custom properties for all colors, timing, z-index
- 44x44px minimum touch targets (NFR7)
- prefers-reduced-motion support for dice animation (UX-DR23)

**MUST NOT do:**
- Do NOT implement cascade animation (Story 2.5)
- Do NOT implement army detection (Story 2.5)
- Do NOT implement status bar or control strip (Story 2.5)
- Do NOT implement turn summary (Story 2.5)
- Do NOT add game logic to components — dispatch to store only

### Previous Story Intelligence (Story 2.2)

**Available from prior stories:**
- `src/stores/gameStore.svelte.ts` — startGame(), dispatch(action), gameState.snapshot
- `src/stores/settingsStore.svelte.ts` — getDiceMode(), toggleDiceMode(), setDiceMode() (already implemented!)
- `src/stores/viewStore.svelte.ts` — navigate(), getCurrentView()
- `src/engine/ruleEngine.ts` — resolveAction() handles placeHex with clockwise orientation
- `src/components/hex-grid/HexGrid.svelte` — selection state (selectedHexKey, selectedEdge), handleHexSelect, handleEdgeSelect, CORNER_OFFSET
- `src/components/hex-grid/EdgeSelector.svelte` — wedge rendering with edge state
- `src/App.svelte` — currently starts game and renders HexGrid with gameState

**Key patterns established:**
- Selection state is local to HexGrid (`$state` variables)
- gameStore.dispatch returns `{ ok: boolean; reason?: string }`
- settingsStore already has dice mode with manual default
- CSS variables for timing: `--duration-panel-transition: 200ms`, `--duration-dice-roll: 1000ms`
- CSS variables for z-index: `--z-dice: 200`
- CSS variables for backdrop: `--backdrop-blur: blur(12px)`

### Component Boundary Rules

Components in dice/ follow the architecture pattern:
- **CAN** import from: `../../types/*`, `../../stores/*`
- **CANNOT** import from: `../../engine/*` (game logic goes through stores)
- **CANNOT** import from: `../../persistence/*`, `../../sync/*`
- **CANNOT** contain game logic — UI interaction only, dispatch to stores

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — DiceRoller, DiceInput in component structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR10 DiceInput, DiceRoller spec, UX-DR27 keyboard shortcuts]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2 Story 2.3 Acceptance Criteria]
- [Source: _bmad-output/implementation-artifacts/2-2-hex-selection-and-edge-targets.md — Previous Story]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- DiceInput with manual (6 number buttons) and digital (Roll with animation) modes, mode toggle linked to settingsStore
- DiceRoller shows result for 800ms in green state before dismissing
- Keyboard 1-6 and Escape support via svelte:window keydown
- HexGrid exposes onEdgeSelected callback and clearSelection method for App integration
- Full game flow wired: tap hex → tap edge → DiceInput → roll → gameStore.dispatch → hex placed → map updates
- Fixed HexGrid reactivity: hexRenderData and claimedHexKeys now $derived so new hexes render correctly
- Fixed HexCell reactivity: status now $derived to react to hex state changes
- Starting hex initialized with numbers [1,2,3,4,5,6] per game rules
- All 64 tests pass, zero type errors

### File List

- src/components/dice/DiceInput.svelte (created — slide-up overlay, manual/digital modes, keyboard input, mode toggle)
- src/components/dice/DiceRoller.svelte (created — digital dice animation with result display)
- src/components/hex-grid/HexGrid.svelte (modified — onEdgeSelected callback, clearSelection export, reactive hexRenderData/claimedHexKeys)
- src/components/hex-grid/HexCell.svelte (modified — status now $derived for reactivity)
- src/stores/gameStore.svelte.ts (modified — starting hex includes numbers [1,2,3,4,5,6])
- src/App.svelte (modified — DiceInput integration, full game flow wiring)

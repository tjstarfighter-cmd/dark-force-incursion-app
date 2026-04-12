# Story 4.1: Undo & Rewind

Status: done

## Story

As a player,
I want to undo my last turn or rewind to any prior turn,
So that I can correct mistakes and explore different strategic paths.

## Acceptance Criteria

1. **Single undo:** Given at least one turn has been played, when the player taps the Undo button in the control strip, then the most recent turn is reverted — the turn stack pops the top entry, the map renders the previous turn's snapshot, the status bar (Dark Force tally, fort count, turn number) reverts, the turn summary updates, and auto-save fires with the rewound state.

2. **Sequential undo:** Given multiple turns have been played, when the player taps Undo multiple times, then each tap rewinds one additional turn in sequence, and the map/status bar/turn summary update with each rewind.

3. **Jump-to-turn rewind:** Given multiple turns have been played, when the player wants to jump to a specific turn (FR20), then a turn history view is accessible (via long-press on undo or a turn list in expanded turn summary), the player can select any prior turn number to rewind to, the game state restores to the selected turn's snapshot, and all turns after the selected turn are removed from the stack.

4. **Disabled at turn 0:** Given the game is at turn 0 (no turns played), when the control strip renders, then the Undo button is visually disabled (aria-disabled, muted styling) and tapping it has no effect.

5. **Keyboard shortcut:** Given the player is on desktop (1024px+), when the player presses Ctrl+Z, then the most recent turn is undone (same behavior as tapping the Undo button).

## Tasks / Subtasks

- [x] Task 1: Add `undo()` and `rewindTo(turnNumber)` to gameStore (AC: #1, #2, #3)
  - [x] 1.1 Add `undo()` function: call `turnStack.popTo(currentTurnNumber - 1)`, set `currentGame` to the new top entry's snapshot, trigger `autoSave()`
  - [x] 1.2 Add `rewindTo(turnNumber)` function: call `turnStack.popTo(turnNumber)`, set `currentGame` to the target entry's snapshot, trigger `autoSave()`
  - [x] 1.3 Export `canUndo` getter (derived: `turnStack.getLength() > 1` — turn 0 always stays)
  - [x] 1.4 Export `getTurnHistory()` returning the turn stack entries for the history UI
- [x] Task 2: Wire Undo button in ControlStrip (AC: #1, #2, #4)
  - [x] 2.1 Accept `canUndo: boolean` and `onUndo: () => void` props
  - [x] 2.2 Bind Undo button: enabled when `canUndo` is true, calls `onUndo` on click
  - [x] 2.3 Use `aria-disabled` attribute (not HTML `disabled`) for accessible disabled state, muted styling at 0.4 opacity
  - [x] 2.4 Keep other buttons (Journal, Rules, Menu) disabled as before
- [x] Task 3: Wire undo into App.svelte (AC: #1, #2)
  - [x] 3.1 Import `undo`, `canUndo` from gameStore
  - [x] 3.2 Pass `canUndo` and `onUndo={undo}` props to ControlStrip
  - [x] 3.3 After undo, update turn summary state (lastTurnNumber, etc.) to reflect the rewound turn, or hide turn summary if at turn 0
  - [x] 3.4 After undo, clear any pending dice input state (`diceInputVisible = false`, `pendingSourceCoord = null`)
  - [x] 3.5 Handle undo from a game-over state: if rewinding past a win/loss turn, game status returns to InProgress — hide GameOver overlay
- [x] Task 4: Implement turn history panel for jump-to-turn rewind (AC: #3)
  - [x] 4.1 Create `TurnHistory.svelte` component in `src/components/game/`
  - [x] 4.2 Display a scrollable list of turns (turn number + brief description from action type)
  - [x] 4.3 Tapping a turn calls `rewindTo(turnNumber)` and closes the panel
  - [x] 4.4 Trigger: long-press on Undo button (>500ms) opens TurnHistory as an overlay
  - [x] 4.5 Style: slide-up panel on mobile, positioned near control strip, dark translucent background matching existing overlay patterns
  - [x] 4.6 Close on outside tap or swipe down
- [x] Task 5: Keyboard shortcut Ctrl+Z (AC: #5)
  - [x] 5.1 Add global `keydown` listener in App.svelte (or ControlStrip)
  - [x] 5.2 On `Ctrl+Z` (and `Cmd+Z` on Mac), call `undo()` if `canUndo` is true
  - [x] 5.3 Only bind at desktop width (1024px+) or bind always — the AC says desktop but no harm on mobile
  - [x] 5.4 Prevent default browser undo behavior with `e.preventDefault()`
- [x] Task 6: Unit tests (all ACs)
  - [x] 6.1 Test `undo()` in gameStore: dispatches 3 turns, undo reverts to turn 2, snapshot matches turn 2
  - [x] 6.2 Test sequential undo: undo 3 times returns to turn 0
  - [x] 6.3 Test `rewindTo()`: jump from turn 5 to turn 2, stack has entries 0-2 only
  - [x] 6.4 Test `canUndo`: false at turn 0, true after dispatch
  - [x] 6.5 Test auto-save fires after undo (mock or spy on saveGame)
  - [x] 6.6 Test undo from game-over state restores InProgress status
  - [x] 6.7 Verify existing 100 tests still pass

## Dev Notes

### Architecture Compliance

- **Pure rule engine boundary:** Undo/rewind does NOT go through `resolveAction()`. It directly manipulates the turn stack and restores snapshots. The rule engine only runs when new turns are played.
- **Immutable state updates:** `currentGame` must be reassigned to the snapshot from the stack, not mutated. The TurnStack already deep-clones snapshots on push, so retrieved snapshots are safe to use directly.
- **Stores are thin wrappers:** `undo()` and `rewindTo()` go in `gameStore.svelte.ts`, not in a new file. They call TurnStack methods and update the reactive state.
- **Auto-save pattern:** Follow existing `autoSave()` call pattern — fire after state change, catch errors silently.

### Existing Code to Build On

- **`TurnStack.popTo(turnNumber)`** already exists in `src/engine/turnStack.ts:58-65` — removes entries after target turn, returns removed entries. This is the core primitive for both undo and rewind.
- **`TurnStack.peek()`** returns the current top entry — use after `popTo()` to get the restored snapshot.
- **`TurnStack.getAll()`** returns all entries — use for the turn history panel.
- **`TurnStack.getLength()`** — use for `canUndo` check (length > 1 means we have entries beyond turn 0).
- **`gameStore.restoreGame()`** at line 81 shows the pattern for setting `currentGame` from a snapshot.
- **`ControlStrip.svelte`** currently has all buttons disabled with hardcoded `disabled` attribute — needs refactoring to accept props.
- **`App.svelte`** manages `diceInputVisible`, `pendingSourceCoord`, `showTurnSummary` state that must be cleaned up on undo.

### Critical Implementation Details

- **Turn 0 must never be popped.** Turn 0 is the initial game setup (starting hex). `canUndo` should be false when `turnStack.getLength() <= 1`.
- **Undo from game-over:** The snapshot restored by undo may have `status: InProgress` (since win/loss was detected on a later turn). The GameOver overlay in App.svelte already checks `snapshot.status !== GameStatus.InProgress`, so restoring a pre-game-over snapshot will automatically hide the overlay.
- **Turn summary after undo:** After undo, `showTurnSummary` should update. Either recalculate from the new top-of-stack, or hide it. Simplest approach: set `showTurnSummary = false` on undo, or derive it from the current vs previous turn.
- **Dice input cleanup:** If the user has the dice panel open when they undo, close it and clear `pendingSourceCoord`.
- **Long-press detection:** Use `pointerdown`/`pointerup` timing. Set a timeout on pointerdown (~500ms); if pointerup fires before timeout, it's a normal tap (undo). If timeout fires, it's a long-press (open history).

### Testing Approach

- **Unit tests on gameStore functions:** Test `undo()`, `rewindTo()`, `canUndo` using the existing test patterns from `turnStack.test.ts`.
- **TurnStack already has solid tests** (9 tests covering push, peek, getAll, popTo, deep clone). No need to re-test TurnStack internals.
- **Test gameStore integration:** Start game → dispatch 3 turns → undo → verify snapshot matches turn 2, canUndo is true. Undo to turn 0 → canUndo is false.
- **Manual UI testing:** Verify undo button enables/disables, turn history panel opens on long-press, Ctrl+Z works on desktop.

### Project Structure Notes

- New file: `src/components/game/TurnHistory.svelte` — turn history overlay panel
- Modified files: `src/stores/gameStore.svelte.ts`, `src/components/game/ControlStrip.svelte`, `src/App.svelte`
- No new dependencies required
- Testing: `src/stores/gameStore.test.ts` (new file, or add to existing if one exists)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4, Story 4.1] — Full acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#Turn Stack] — Full snapshots + action log design, immutable state pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns] — Pure rule engine, thin stores
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#ControlStrip] — 48px translucent overlay, undo button spec
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Interaction Design] — "Undo: One tap to undo the last turn. Rewind to any prior turn available but not the default path."
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Principles] — "Resolve, don't ask. Undo is the correction path — not confirmation dialogs."
- [Source: src/engine/turnStack.ts] — TurnStack class with popTo(), peek(), getAll()
- [Source: src/stores/gameStore.svelte.ts] — Current game store with dispatch, restoreGame, autoSave patterns
- [Source: src/components/game/ControlStrip.svelte] — Current disabled button layout
- [Source: src/App.svelte] — Turn summary state management, dice input state, GameOver conditional

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Added `undo()`, `rewindTo()`, `canUndo`, and `getTurnHistory()` to gameStore.svelte.ts
- `undo()` pops the turn stack by one and restores the previous snapshot; `rewindTo()` jumps to any prior turn
- Both trigger auto-save after state change
- ControlStrip refactored from all-disabled to accept `canUndo`/`onUndo`/`onTurnHistoryOpen` props
- Undo button uses `aria-disabled` pattern (not HTML disabled) with long-press detection (500ms) for turn history
- Created TurnHistory.svelte — slide-up overlay panel listing all turns, tap to rewind
- App.svelte wired with handleUndo (clears dice input, hides turn summary), handleRewindTo, Ctrl+Z/Cmd+Z keyboard shortcut
- Undo from game-over state works: restoring a pre-game-over snapshot hides GameOver overlay automatically
- 16 new unit tests covering undo, sequential undo, rewindTo, canUndo, getTurnHistory, auto-save, and game-over undo
- All 116 tests pass (100 existing + 16 new), zero type errors

### Change Log

- 2026-04-12: Story 4.1 implemented — undo, rewind, turn history, keyboard shortcut

### File List

- src/stores/gameStore.svelte.ts (modified) — added undo(), rewindTo(), canUndo, getTurnHistory()
- src/stores/gameStore.svelte.test.ts (new) — 16 unit tests for undo/rewind
- src/components/game/ControlStrip.svelte (modified) — props for canUndo/onUndo/onTurnHistoryOpen, long-press detection
- src/components/game/TurnHistory.svelte (new) — turn history overlay panel
- src/App.svelte (modified) — wired undo, rewind, turn history, Ctrl+Z keyboard shortcut

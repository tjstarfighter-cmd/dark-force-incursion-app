# Story 4.2: Player Override After Rewind

Status: done

## Story

As a player,
I want to replay a turn with my own ruling after rewinding,
So that I have final authority over the rules when I disagree with the engine.

## Acceptance Criteria

1. **Normal play after rewind:** Given the player has rewound to a prior turn, when the player selects a hex and edge and enters a roll, then the rule engine resolves the turn normally, the new turn is pushed onto the stack after the rewind point, and any previously removed turns remain discarded.

2. **Undo-and-replay cycle:** Given the rule engine resolves a turn after rewind, when the player disagrees with the resolution, then the player can undo again and re-enter the roll with a different edge selection, and this cycle can repeat until satisfied.

3. **Seamless continuation:** Given the override flow is used, when the player replays from a rewound state, then the game continues seamlessly, auto-save persists the new state, and turn stack integrity is maintained (no orphaned or duplicate turns).

## Tasks / Subtasks

- [x] Task 1: Verify existing dispatch works after undo/rewind (AC: #1, #3)
  - [x] 1.1 Write test: undo to turn N, dispatch new action, verify new turn is N+1
  - [x] 1.2 Write test: verify removed turns stay discarded after new dispatch
  - [x] 1.3 Write test: verify auto-save fires after dispatch following undo
- [x] Task 2: Verify undo-and-replay cycle (AC: #2)
  - [x] 2.1 Write test: undo → dispatch → undo → dispatch cycle works without errors
  - [x] 2.2 Write test: turn stack has correct length and entries after multiple undo/replay cycles
- [x] Task 3: Verify turn stack integrity (AC: #3)
  - [x] 3.1 Write test: no duplicate turn numbers after undo and new dispatch
  - [x] 3.2 Write test: getTurnHistory() returns clean sequential entries after override flow

## Dev Notes

### Architecture Compliance

- **No new code needed.** Story 4.2 is an emergent behavior from the combination of Story 4.1's `undo()`/`rewindTo()` and the existing `dispatch()` function. After rewind, `currentGame` points to an earlier snapshot. The next `dispatch()` call runs `resolveAction()` against that snapshot, producing a new turn that naturally pushes onto the shortened stack.
- **Turn numbering is automatic.** The rule engine increments `state.turnNumber + 1` in `resolvePlaceHex()`, so after rewinding to turn 3 and dispatching, the new turn is turn 4 — regardless of what the previous turn 4 was.
- **Auto-save already fires** after every `dispatch()` call.

### Existing Code That Makes This Work

- `undo()` / `rewindTo()` in gameStore — pops turns via `TurnStack.popTo()`, restores snapshot
- `dispatch()` in gameStore — calls `resolveAction()`, pushes result onto turn stack, auto-saves
- `TurnStack.popTo()` permanently removes entries after the target — no ghost references
- `TurnStack.push()` deep-clones snapshots — no shared mutable state between turns

### Testing Approach

- All tests are integration tests on the gameStore — verify the undo→dispatch→undo→dispatch cycle produces correct state at each step.
- No UI changes needed — the existing hex selection → dice → dispatch flow works identically after rewind.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4, Story 4.2]
- [Source: src/stores/gameStore.svelte.ts] — undo(), rewindTo(), dispatch()
- [Source: src/engine/turnStack.ts] — TurnStack.popTo(), push()

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues — override flow is emergent behavior from existing undo + dispatch.

### Completion Notes List

- No new production code needed — Story 4.2 is fully satisfied by Story 4.1's undo/rewindTo + existing dispatch
- Added 6 integration tests verifying: dispatch after undo, discarded turns stay gone, undo-dispatch-undo-dispatch cycle, no duplicate turn numbers, clean sequential history, auto-save after override
- All 122 tests pass

### Change Log

- 2026-04-12: Story 4.2 verified via integration tests — override flow works as emergent behavior

### File List

- src/stores/gameStore.svelte.test.ts (modified) — added 6 override/rewind cycle tests

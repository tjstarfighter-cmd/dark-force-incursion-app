# Story 3.4: Win/Loss Detection & Game Over

Status: done

## Story

As a player,
I want the game to detect when I've won or lost and present a clean summary,
So that each campaign has a satisfying conclusion and I can quickly start another.

## Acceptance Criteria

1. **Given** the player has captured more than half the forts **When** win condition checks after a turn (FR16) **Then** game ends in victory

2. **Given** Dark Force tally reaches the limit (25) **When** lose condition checks (FR17) **Then** game ends in defeat

3. **Given** all uncaptured forts are blocked or unreachable **When** lose condition checks (FR17) **Then** game ends in defeat

4. **Given** game has ended **When** game-over screen displays **Then** GameOver.svelte shows outcome, stats (turns, forts, DF tally), "New Campaign" and map state

5. **Given** game has ended **When** player taps "New Campaign" **Then** new game starts within 2 taps

## Tasks / Subtasks

- [x] Task 1: Win/Loss Detection Engine (AC: #1, #2, #3)
  - [x] 1.1: Create src/engine/winLoss.ts — `checkWinLoss(snapshot): GameStatus` — returns InProgress, PlayerWon, or DarkForceWon
  - [x] 1.2: Win: fortsCaptured > totalForts / 2 (more than half)
  - [x] 1.3: Loss by DF limit: darkForceTally >= darkForceLimit
  - [x] 1.4: Loss by forts unreachable: all uncaptured forts are blocked (simplified — full reachability check deferred)
  - [x] 1.5: Create src/engine/winLoss.test.ts — tests: win at half+1, no win at half, loss at DF limit, loss when all forts blocked

- [x] Task 2: Integrate into Rule Engine (AC: #1-#3)
  - [x] 2.1: After each turn resolution, call checkWinLoss and update snapshot.status
  - [x] 2.2: When game is won or lost, set GameStatus accordingly
  - [x] 2.3: Prevent further rolls when game is over (dispatch returns error)

- [x] Task 3: GameOver Component (AC: #4, #5)
  - [x] 3.1: Create src/components/game/GameOver.svelte — full-screen overlay
  - [x] 3.2: Show outcome title ("Campaign Won" / "Campaign Lost")
  - [x] 3.3: Display stats: turns, forts captured/total, Dark Force tally
  - [x] 3.4: "New Campaign" primary button, warm gold for victory, muted for defeat
  - [x] 3.5: Wire in App.svelte — show GameOver when snapshot.status !== InProgress

- [x] Task 4: Visual Verification
  - [x] 4.1: Play to victory or defeat and verify GameOver screen
  - [x] 4.2: Verify "New Campaign" starts a fresh game
  - [x] 4.3: Verify can't roll after game ends

## Dev Notes

### Win/Loss Conditions (from rulebook)

- **Win:** Capture more than half the forts (4 of 7 for Calosanti)
- **Loss by DF:** Dark Force reaches 25 armies
- **Loss by forts:** All remaining forts blocked (can't reach them)
- "If you cannot reach a fort you cannot win it back and have lost it for good"

### GameOver Visual (UX-DR14)

Understated full-screen overlay. Same layout for win and loss — warm gold title for victory, muted tone for defeat. Stats + New Campaign button.

### References

- [Source: Dark Force Incursion Rules Omnibus Edition 4, pages 4, 6-7]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3 Story 3.4]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- checkWinLoss: win at >half forts, loss at DF limit or all forts blocked. Win takes priority. 8 tests.
- Integrated into ruleEngine: applyWinLossCheck wraps every return path. GAME_OVER guard prevents rolls after end.
- GameOver.svelte: full-screen overlay with outcome, stats, New Campaign button. Gold for victory, muted for defeat.
- 100 tests pass, zero type errors.

### File List

- src/engine/winLoss.ts (created — checkWinLoss pure function)
- src/engine/winLoss.test.ts (created — 8 tests)
- src/engine/ruleEngine.ts (modified — GAME_OVER guard, applyWinLossCheck on all return paths)
- src/components/game/GameOver.svelte (created — game over overlay)
- src/App.svelte (modified — GameOver rendering when game ends)

# Story 6.2: Game Detail View

Status: done

## Story

As a player,
I want to open a completed campaign and see the final battlefield with all my journal entries,
So that I can relive the campaign and mine it for writing material.

## Acceptance Criteria

1. **Game detail opens:** Given the player is in the archive list, when the player taps a campaign card, then GameDetail.svelte opens as a full-screen view with the final map state rendered as a read-only hex grid (all hexes, armies, Dark Force, forts, terrain visible). The grid is not interactive (no tap, no edge targets).

2. **Campaign stats:** Given the game detail view is open, when stats are displayed, then total turns, forts captured vs total, final Dark Force tally, and journal entry count are shown.

3. **Journal entries:** Given the game detail view is open, when journal entries are displayed, then all entries are listed chronologically below the map and stats, each showing turn number (or "Session") and text. Turn numbers in Inter, entry text in Crimson Text italic. Scrollable.

4. **Back navigation:** Given the player is in the game detail view, when the player navigates back, then back navigation returns to the archive list (not home). History API tracks Archive List -> Game Detail.

## Tasks / Subtasks

- [x] Task 1: Create GameDetail.svelte component (AC: #1, #2, #3, #4)
  - [x] 1.1 Create `src/components/archive/GameDetail.svelte`
  - [x] 1.2 Read-only hex grid: reuse HexGrid component with interaction disabled
  - [x] 1.3 Stats section: turns, forts, Dark Force tally, journal count
  - [x] 1.4 Journal entries list: chronological, turn labels, styled text
  - [x] 1.5 Back button at top, wired to onBack callback
  - [x] 1.6 Scrollable layout — map at top, stats, then journal entries
- [x] Task 2: Wire GameDetail into App.svelte (AC: #1, #4)
  - [x] 2.1 Add gameDetail view to the view switch in App.svelte
  - [x] 2.2 Load archived game data when a card is selected
  - [x] 2.3 Navigate to gameDetail view via viewStore
  - [x] 2.4 Back from detail returns to archive list
- [x] Task 3: Make HexGrid support read-only mode (AC: #1)
  - [x] 3.1 Add optional `readonly` prop to HexGrid — disables hex selection and edge targets
- [x] Task 4: Verify and test (AC: all)
  - [x] 4.1 Type check and build
  - [x] 4.2 Verify all 154 existing tests pass

## Dev Notes

- HexGrid already renders hexes from mapDefinition + hexStates props. For read-only, just skip the onHexSelected callback (pass undefined or add a readonly prop).
- GameDetail receives full archived game data (snapshot, journalEntries, metadata) via props from App.svelte.
- loadArchivedGame(id) already implemented in Story 6.1.
- viewStore already supports 'gameDetail' view.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 6, Story 6.2]
- [Source: src/components/archive/ArchiveList.svelte] — onSelectGame callback
- [Source: src/persistence/gameRepository.ts] — loadArchivedGame(id)
- [Source: src/components/hex-grid/HexGrid.svelte] — existing grid component

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered.

### Completion Notes List

- Created GameDetail.svelte — full-screen view with read-only hex grid (40vh), stats row (turns/forts/DF/entries), and chronological journal entries
- Added `readonly` prop to HexGrid — guards handleHexSelect to prevent interaction
- App.svelte wired with gameDetail view: loads archived game via loadArchivedGame(id), navigates to detail, back returns to archive list
- History API drill-down works: Archive List -> Game Detail -> back returns to list
- 154 tests pass, zero type errors, clean build

### Change Log

- 2026-04-12: Story 6.2 implemented — game detail view with read-only map and journal

### File List

- src/components/archive/GameDetail.svelte (new) — game detail view component
- src/components/hex-grid/HexGrid.svelte (modified) — added readonly prop
- src/App.svelte (modified) — gameDetail view wiring, loadArchivedGame integration

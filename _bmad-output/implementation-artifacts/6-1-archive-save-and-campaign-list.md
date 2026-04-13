# Story 6.1: Archive Save & Campaign List

Status: done

## Story

As a player,
I want completed games automatically saved and browsable as a campaign archive,
So that I can look back at my campaigns and find material for writing.

## Acceptance Criteria

1. **Auto-archive on game end:** Given a game ends in victory or defeat, when the game-over screen displays, then the completed game is automatically saved to the archive in IndexedDB with full turn stack, all journal entries, and metadata (map name, date, win/loss outcome, total turns, journal entry count). No user action required.

2. **Archive list:** Given the player navigates to the archive, when ArchiveList.svelte renders, then a full-screen card layout displays all archived campaigns. Each card shows: map name, date played, win/loss outcome, number of turns, journal entry count. Cards sorted most recent first. Wins with warm green accent, losses with muted red.

3. **Responsive layout:** Given the archive is viewed on phone, cards display single-column. On desktop (1024px+), cards display two-column.

4. **Empty state:** Given no archived games exist, the view displays "No campaigns yet." in muted centered text. No illustration, no nudge.

5. **Navigation:** Given the player is in the archive view, back navigation returns to the previous view (home or active game) via History API. HomeView shows an "Archive" button. GameOver shows a "View Archive" button.

## Tasks / Subtasks

- [x] Task 1: Add archive table and repository functions (AC: #1)
  - [x] 1.1 Add `archivedGames` table to Dexie schema (v3): id, mapId, status, mapName, date, outcome, totalTurns, journalCount, snapshotJson, turnStackJson, journalEntriesJson
  - [x] 1.2 Add `archiveGame(snapshot, turnEntries, journalEntries)` to gameRepository — creates archive record with metadata
  - [x] 1.3 Add `loadArchivedGames()` — returns list sorted by date desc (metadata only, no heavy JSON)
  - [x] 1.4 Add `loadArchivedGame(id)` — returns full game data for detail view (Story 6.2)
  - [x] 1.5 Add `ArchiveRecord` interface to db.ts with metadata fields + serialized data
- [x] Task 2: Auto-archive on game end (AC: #1)
  - [x] 2.1 In gameStore, detect when game status changes to PlayerWon or DarkForceWon
  - [x] 2.2 Call archiveGame() automatically after status change — fire-and-forget async
  - [x] 2.3 Clear the active game from IndexedDB after archiving (player starts fresh)
- [x] Task 3: Create ArchiveList.svelte component (AC: #2, #3, #4)
  - [x] 3.1 Create `src/components/archive/ArchiveList.svelte`
  - [x] 3.2 Full-screen view with card layout, back button at top
  - [x] 3.3 Each card: map name, formatted date, outcome badge (win/loss), turns count, journal count
  - [x] 3.4 Win cards: warm green accent (`--color-archive-win`). Loss cards: muted red (`--color-archive-loss`)
  - [x] 3.5 Single-column phone, two-column desktop (CSS grid)
  - [x] 3.6 Empty state: "No campaigns yet." centered muted text
  - [x] 3.7 Props: archives (metadata array), onSelectGame(id), onBack()
- [x] Task 4: Wire archive into App.svelte with view switching (AC: #2, #5)
  - [x] 4.1 Import viewStore (navigate, getCurrentView, back) and ArchiveList
  - [x] 4.2 Use viewStore to switch between game view and archive view
  - [x] 4.3 When in archive view, render ArchiveList full-screen (replace game UI)
  - [x] 4.4 Load archived games on archive view entry
- [x] Task 5: Update HomeView and GameOver with archive navigation (AC: #5)
  - [x] 5.1 HomeView: add "Archive" secondary button, wire to navigate('archive')
  - [x] 5.2 GameOver: add "View Archive" secondary button, wire to navigate('archive')
  - [x] 5.3 GameOver: trigger archive save + new game flow on "New Campaign" tap
- [x] Task 6: Unit tests (AC: all)
  - [x] 6.1 Test archiveGame creates record with correct metadata
  - [x] 6.2 Test auto-archive fires on game-over status
  - [x] 6.3 Test loadArchivedGames returns sorted metadata
  - [x] 6.4 Verify all existing 152 tests pass

## Dev Notes

### Architecture Compliance

- **Separate archive table.** The active game uses `games` table (id='active'). Archives go in a new `archivedGames` table with denormalized metadata fields for fast list rendering without JSON parsing.
- **archiveStore not needed yet.** The architecture mentions `archiveStore`, but for this story the archive data is loaded on-demand when the view opens. A store can be added if caching/reactivity is needed later.
- **View switching via viewStore.** The existing `viewStore.svelte.ts` already supports `'archive'` and `'gameDetail'` views with History API. App.svelte will conditionally render based on current view.

### Existing Code to Build On

- **`viewStore.svelte.ts`** — already has navigate('archive'), back(), History API popstate listener
- **`db.ts`** — Dexie schema, just add v3 with archivedGames table
- **`gameRepository.ts`** — existing serialize/deserialize patterns, add archive functions
- **`GameOver.svelte`** — needs "View Archive" button, currently only has "New Campaign"
- **`HomeView.svelte`** — needs "Archive" button
- **`App.svelte`** — needs view switching logic (currently only renders game view)

### Critical Implementation Details

- **Archive metadata denormalization:** Store mapName, date, outcome, totalTurns, journalCount as top-level fields in the archive record. The list view reads these without parsing the heavy snapshot/turnStack JSON. This ensures NFR4 (500ms render with 100+ games).
- **Auto-archive timing:** Archive fires when `dispatch()` produces a game-over snapshot. The archiving is async fire-and-forget — don't block the UI.
- **Active game cleanup:** After archiving, delete the active game record so `tryResumeGame()` doesn't try to restore a completed game. The game-over overlay is already showing.
- **Archive ID:** Use `crypto.randomUUID()` for archive record IDs.
- **Date formatting:** Use `new Date().toLocaleDateString()` for display, store raw timestamp for sorting.

### Project Structure Notes

- New files: `src/components/archive/ArchiveList.svelte`
- Modified files: `src/persistence/db.ts`, `src/persistence/gameRepository.ts`, `src/stores/gameStore.svelte.ts`, `src/App.svelte`, `src/components/game/HomeView.svelte`, `src/components/game/GameOver.svelte`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 6, Story 6.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Archive] — archiveStore, ArchiveList, GameDetail
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR15] — card layout, win/loss colors
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR13] — HomeView with Archive button
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR14] — GameOver with View Archive button
- [Source: src/stores/viewStore.svelte.ts] — navigate, back, History API
- [Source: src/persistence/db.ts] — Dexie schema
- [Source: src/components/game/GameOver.svelte] — current game-over UI
- [Source: src/components/game/HomeView.svelte] — current home UI

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered.

### Completion Notes List

- Added `ArchiveRecord` interface and `archivedGames` Dexie table (schema v3) with denormalized metadata fields
- Added `archiveGame()`, `loadArchivedGames()`, `loadArchivedGame()` to gameRepository
- Auto-archive triggers in gameStore dispatch() when game status changes to won/lost — fire-and-forget async, then clears active game
- Created ArchiveList.svelte — full-screen card layout, win green/loss red accents, single-column phone, two-column desktop, empty state
- App.svelte view switching via viewStore — archive view replaces game UI
- HomeView: added "Archive" secondary button
- GameOver: added "View Archive" secondary button
- 154 tests pass (152 + 2 archive mock verification), zero type errors, clean build

### Change Log

- 2026-04-12: Story 6.1 implemented — auto-archive, campaign list, view switching

### File List

- src/persistence/db.ts (modified) — ArchiveRecord, archivedGames table, schema v3
- src/persistence/gameRepository.ts (modified) — archiveGame, loadArchivedGames, loadArchivedGame
- src/stores/gameStore.svelte.ts (modified) — auto-archive on game-over
- src/stores/gameStore.svelte.test.ts (modified) — 2 archive tests
- src/components/archive/ArchiveList.svelte (new) — archive list component
- src/components/game/HomeView.svelte (modified) — Archive button
- src/components/game/GameOver.svelte (modified) — View Archive button
- src/App.svelte (modified) — view switching, archive navigation

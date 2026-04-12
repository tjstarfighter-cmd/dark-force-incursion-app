# Story 5.1: Journal Entry Creation & Turn Linking

Status: done

## Story

As a player,
I want to quickly capture a thought or narrative moment during gameplay,
So that I can build a story around my campaign without breaking the flow of play.

## Acceptance Criteria

1. **Journal button opens panel:** Given a game is in progress, when the player taps the Journal button in the control strip, then JournalPanel.svelte slides up from the bottom (~50% screen height on phone), the map compresses but stays visible above, the panel opens within 200ms, a textarea is immediately focused, and opening the journal closes the rules reference panel if open.

2. **Text/dictation input:** Given the journal panel is open, when the player types or dictates text, then the textarea is a standard `<textarea>` element (no custom input handling — compatible with Aqua Voice, Android voice input, iOS dictation), and the current turn number is displayed near the input area.

3. **Save entry:** Given the player has entered text, when the player taps "Save Entry", then the entry is saved and linked to the current turn number automatically, the textarea clears, and the saved entry appears in the list below the input area.

4. **Session-level entries:** Given the player wants to create a session-level entry, when the player creates an entry, then a toggle allows linking the entry to the overall session instead of a specific turn, and session entries are tagged distinctly.

5. **Close behavior:** Given the journal panel is open, when the player taps X, taps the map area, or swipes down, then the panel closes within 200ms, any unsaved text is auto-saved as a draft on close, and the map returns to full size.

6. **Previous entries visible:** Given the journal panel is open and previous entries exist, then they are visible below the input area, scrollable, with turn numbers displayed.

7. **Desktop layout:** Given the app is on desktop (1024px+), when the journal is displayed, then it renders as a persistent side panel (~30% width) alongside the hex grid (~70%).

## Tasks / Subtasks

- [x] Task 1: Update journal types and add journal store functions (AC: #3, #4)
  - [x] 1.1 Update `src/types/journal.types.ts`: add `scope: 'turn' | 'session'` field to JournalEntry
  - [x] 1.2 Add journal entry management to `src/stores/gameStore.svelte.ts`: `addJournalEntry(text, scope)`, `getAllJournalEntries()`, `getDraftText()`, `setDraftText(text)`
  - [x] 1.3 Store journal entries as a separate flat array (NOT inside turn entries) — entries must survive undo/rewind per Epic 4 AC
  - [x] 1.4 Generate entry IDs with `crypto.randomUUID()`
  - [x] 1.5 Auto-save after every journal add (reuse existing `autoSave()` pattern)
- [x] Task 2: Update persistence to include journal entries (AC: #3, #5)
  - [x] 2.1 Add `journalEntriesJson` field to GameRecord in `src/persistence/db.ts` (Dexie schema version bump)
  - [x] 2.2 Update `saveGame()` in gameRepository to serialize journal entries
  - [x] 2.3 Update `loadActiveGame()` to deserialize journal entries
  - [x] 2.4 Update `restoreGame()` in gameStore to accept and restore journal entries
- [x] Task 3: Create JournalPanel.svelte component (AC: #1, #2, #5, #6, #7)
  - [x] 3.1 Create `src/components/journal/JournalPanel.svelte`
  - [x] 3.2 Slide-up overlay on phone (~50% height), positioned above control strip
  - [x] 3.3 Textarea auto-focused on open (`autofocus` or `use:` directive), standard `<textarea>` (no custom input — dictation compatible)
  - [x] 3.4 Display current turn number near input area
  - [x] 3.5 "Save Entry" button below textarea — calls addJournalEntry, clears textarea
  - [x] 3.6 Toggle for turn-linked vs session-level (simple radio or toggle switch, defaults to turn-linked)
  - [x] 3.7 Scrollable list of previous entries below input, showing turn number (or "Session") and text
  - [x] 3.8 Close button (X), backdrop click to close, Escape key to close
  - [x] 3.9 On close: auto-save draft text (unsaved content preserved for next open)
  - [x] 3.10 Desktop layout: side panel ~30% width, no backdrop, persistent alongside map
  - [x] 3.11 Typography: turn numbers in Inter (--font-data), entry text in Crimson Text italic (--font-display), input in system font
- [x] Task 4: Wire Journal button in ControlStrip (AC: #1)
  - [x] 4.1 Add `onJournalOpen: () => void` prop to ControlStrip
  - [x] 4.2 Enable the Journal button (remove disabled), wire onclick to onJournalOpen
- [x] Task 5: Wire JournalPanel into App.svelte (AC: #1, #5, #7)
  - [x] 5.1 Add `showJournal` state, import JournalPanel
  - [x] 5.2 `handleJournalOpen()`: set showJournal=true, close rules panel and turn history
  - [x] 5.3 `handleJournalClose()`: set showJournal=false
  - [x] 5.4 Close journal on undo/rewind (clean overlay state)
  - [x] 5.5 Opening rules reference closes journal (mutual exclusion)
  - [x] 5.6 Pass journal entries, current turn, and handlers to JournalPanel
  - [x] 5.7 Desktop: render journal as persistent side panel when screen >= 1024px (always visible, no toggle needed)
- [x] Task 6: Unit tests (AC: all)
  - [x] 6.1 Test addJournalEntry: creates entry with correct turnNumber, scope, id, timestamp
  - [x] 6.2 Test getAllJournalEntries: returns all entries in order
  - [x] 6.3 Test journal entries survive undo: add entry on turn 3, undo to turn 1, entries still present
  - [x] 6.4 Test journal entries survive rewindTo: same as above with rewindTo
  - [x] 6.5 Test session-level entry: scope is 'session', turnNumber is current turn
  - [x] 6.6 Test draft text: setDraftText persists, getDraftText retrieves
  - [x] 6.7 Test auto-save fires after addJournalEntry
  - [x] 6.8 Verify all existing 132 tests still pass

## Dev Notes

### Architecture Compliance

- **Journal entries stored separately from turn stack.** The architecture says "journalEntries embedded in turn stack," but Epic 4's acceptance criteria (Story 5.2) explicitly requires: "journal entries that were created on turns after the rewind point are preserved (not deleted)." Since `TurnStack.popTo()` removes entries, journal data must live outside the turn stack. A flat array in gameStore is the correct approach.
- **Stores are thin wrappers.** Journal CRUD functions go in `gameStore.svelte.ts`, not a separate journalStore. The architecture mentions `journalStore` as "derived from active game" — but since entries are simple CRUD against a flat array, adding them to gameStore keeps things simpler and avoids an unnecessary store. If complexity grows in Story 5.2 (edit/delete), a separate store can be extracted then.
- **Component boundary respected.** JournalPanel reads entries via props, dispatches saves via callbacks. No direct store access from the component.
- **Persistence extended.** Dexie schema needs a version bump to add the journalEntries column. Dexie handles this via its built-in migration system.

### Existing Code to Build On

- **`JournalEntry` type** already exists in `src/types/journal.types.ts` — just needs `scope` field added
- **`TurnEntry.journalEntries`** already exists in turnStack.ts (unused) — can leave it for backward compatibility but journal data lives in the new flat array
- **`gameStore.svelte.ts`** has `autoSave()` pattern — reuse for journal saves
- **`ControlStrip.svelte`** already has props pattern (canUndo, onUndo, onRulesOpen) — add onJournalOpen
- **`App.svelte`** has overlay management pattern (showTurnHistory, showRulesReference) — add showJournal with same mutual-exclusion logic
- **`RulesReference.svelte` and `TurnHistory.svelte`** — reuse overlay/backdrop/close patterns for consistency
- **`db.ts`** uses Dexie — schema versioning is built in, just bump version and add column

### Critical Implementation Details

- **No custom input handling on textarea.** Standard HTML `<textarea>` only. No contentEditable, no rich text, no input event interception. System dictation tools (Aqua Voice) inject text directly — custom handlers break this.
- **Draft auto-save on close:** Store draft text in gameStore state (not persisted to DB, just in-memory). When journal reopens, restore draft. On successful save, clear draft.
- **Desktop persistent panel:** On desktop (1024px+), the journal should always be visible as a side panel. Use CSS media query + conditional rendering: on desktop, don't use backdrop overlay — render as a positioned side panel. The hex grid shrinks to ~70% width.
- **Entry ordering:** Show entries in reverse chronological order (newest first) so the player sees their most recent entry at the top.
- **Performance:** 200ms open/close — the panel is just a DOM element with CSS transition. No async loading needed.
- **`crypto.randomUUID()`** is available in all modern browsers and Node 19+. No polyfill needed.

### Persistence Schema Change

Current Dexie schema: `games: 'id, mapId, status'`
New schema (version 2): `games: 'id, mapId, status'` (same indexes, but GameRecord gets new `journalEntriesJson` field)

Dexie upgrade function: no data migration needed — existing records simply won't have the field, and `loadActiveGame` should default to empty array when missing.

### Testing Approach

- **Unit tests on gameStore:** Test addJournalEntry, getAllJournalEntries, draft text, undo/rewind preservation
- **Persistence tests not needed** — Dexie's schema versioning is well-tested, and the serialization follows the existing pattern
- **Manual UI testing:** Verify journal opens/closes, textarea focus, dictation compatibility, entry list, desktop layout

### Project Structure Notes

- New file: `src/components/journal/JournalPanel.svelte`
- Modified files: `src/types/journal.types.ts`, `src/stores/gameStore.svelte.ts`, `src/persistence/db.ts`, `src/persistence/gameRepository.ts`, `src/components/game/ControlStrip.svelte`, `src/App.svelte`
- No new dependencies

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5, Story 5.1] — Full acceptance criteria
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#JournalPanel] — Slide-up 50% phone, side panel 30% desktop, textarea focused, dictation-friendly
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR11] — Journal panel spec
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR19] — Desktop side panel layout
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR28] — Focus management
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management] — journalStore derived from game
- [Source: _bmad-output/planning-artifacts/architecture.md#Turn Stack] — journalEntries in schema
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — components/journal/, journalStore.ts
- [Source: src/types/journal.types.ts] — Existing JournalEntry type
- [Source: src/engine/turnStack.ts] — TurnEntry.journalEntries already defined
- [Source: src/stores/gameStore.svelte.ts] — autoSave pattern, undo/rewind functions
- [Source: src/persistence/db.ts] — Dexie schema
- [Source: src/persistence/gameRepository.ts] — serialize/deserialize patterns

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Fixed `<svelte:window>` placement — must be top-level in Svelte, not inside conditional blocks

### Completion Notes List

- Added `scope: 'turn' | 'session'` to JournalEntry type, plus JournalScope type alias
- Journal entries stored as flat array in gameStore (separate from turn stack) — entries survive undo/rewind
- Added `addJournalEntry()`, `getAllJournalEntries()`, `getDraftText()`, `setDraftText()`, `setJournalEntries()` to gameStore
- Dexie schema bumped to v2 with `journalEntriesJson` field; gameRepository updated to serialize/deserialize journal entries
- `restoreGame()` updated to accept optional journal entries parameter
- Created JournalPanel.svelte with: slide-up overlay (phone 50%), persistent side panel (desktop 30%), auto-focus textarea, turn/session toggle, save button, entry list (newest first), Escape/backdrop close, draft preservation
- ControlStrip Journal button enabled with `onJournalOpen` prop
- App.svelte: journal state, mutual exclusion with rules/turn-history overlays, desktop detection via resize listener, journal closes on undo/rewind
- 13 new unit tests covering: addJournalEntry (turnNumber, scope, id, timestamp, trimming, empty rejection), getAllJournalEntries ordering, undo/rewind survival, draft text lifecycle, auto-save
- 145 tests pass (132 existing + 13 new), zero type errors, clean build

### Change Log

- 2026-04-12: Story 5.1 implemented — journal entry creation with turn linking

### File List

- src/types/journal.types.ts (modified) — added scope field and JournalScope type
- src/stores/gameStore.svelte.ts (modified) — journal CRUD, draft text, flat entry array
- src/stores/gameStore.svelte.test.ts (modified) — 13 new journal tests
- src/persistence/db.ts (modified) — Dexie schema v2, journalEntriesJson field
- src/persistence/gameRepository.ts (modified) — journal serialization/deserialization
- src/components/journal/JournalPanel.svelte (new) — journal panel component
- src/components/game/ControlStrip.svelte (modified) — onJournalOpen prop, enabled Journal button
- src/App.svelte (modified) — journal wiring, mutual exclusion, desktop detection

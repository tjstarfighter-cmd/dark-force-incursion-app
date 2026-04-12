# Story 5.2: Journal Review, Edit & Delete

Status: done

## Story

As a player,
I want to review, edit, and delete my journal entries,
So that I can refine my campaign narrative and correct mistakes.

## Acceptance Criteria

1. **Display formatting:** Given journal entries exist, when the player views the journal panel, then entries are displayed chronologically with turn number labels, turn numbers use Inter font, entry text uses Crimson Text italic, and each entry shows turn number (or "Session") and text.

2. **Edit entry:** Given the player wants to edit an entry, when the player taps on an existing entry, then the entry becomes editable in the textarea, the player can change text and tap "Save" to update it, and the turn link is preserved.

3. **Delete entry:** Given the player wants to delete an entry, when the player initiates a delete action, then a brief confirmation is requested, upon confirmation the entry is removed, and deletion persists through auto-save.

4. **Entries survive undo/rewind:** Given the player undoes or rewinds a turn, when the game state reverts, then journal entries created on turns after the rewind point are preserved, and entries remain accessible regardless of current turn position.

5. **Responsive scrolling:** Given journal entries exist, when the panel renders on any device, then entries are readable and scrollable, and the scroll area does not interfere with map interaction.

## Tasks / Subtasks

- [x] Task 1: Add editJournalEntry and deleteJournalEntry to gameStore (AC: #2, #3)
  - [x] 1.1 Add `editJournalEntry(id, newText)` — finds entry by id, updates text, triggers autoSave
  - [x] 1.2 Add `deleteJournalEntry(id)` — removes entry by id, triggers autoSave
- [x] Task 2: Update JournalPanel with edit and delete UI (AC: #1, #2, #3, #5)
  - [x] 2.1 Tap entry to edit: load entry text into textarea, show "Update" button instead of "Save Entry"
  - [x] 2.2 Cancel edit: button to discard edit and return to compose mode
  - [x] 2.3 Delete button on each entry (small X or trash icon)
  - [x] 2.4 Delete confirmation: inline "Delete? Yes / No" prompt
- [x] Task 3: Wire edit/delete into App.svelte (AC: #2, #3)
  - [x] 3.1 Pass editJournalEntry and deleteJournalEntry handlers to JournalPanel
- [x] Task 4: Unit tests (AC: all)
  - [x] 4.1 Test editJournalEntry: updates text, preserves turnNumber and id
  - [x] 4.2 Test deleteJournalEntry: removes entry, triggers autoSave
  - [x] 4.3 Test entries survive undo (already covered in 5.1 tests — verify still passing)
  - [x] 4.4 Verify all existing tests pass

## Dev Notes

- AC #1 (display formatting) and AC #4 (undo survival) and AC #5 (responsive scrolling) are already satisfied by Story 5.1's implementation
- Edit mode: track `editingEntryId` state in JournalPanel. When set, textarea shows that entry's text, save button says "Update"
- Delete confirmation: inline per-entry, not a modal. Track `deletingEntryId` state
- `editJournalEntry` and `deleteJournalEntry` follow same pattern as `addJournalEntry` — mutate flat array, autoSave

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5, Story 5.2]
- [Source: src/stores/gameStore.svelte.ts] — journal flat array, autoSave
- [Source: src/components/journal/JournalPanel.svelte] — existing entry list

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered.

### Completion Notes List

- Added `editJournalEntry(id, newText)` and `deleteJournalEntry(id)` to gameStore — both trigger autoSave
- JournalPanel updated with edit mode (tap entry → loads in textarea, "Update"/"Cancel" buttons) and inline delete confirmation ("Delete? Yes / No")
- Edit/delete action buttons appear on each entry (pencil icon, X), subtle opacity until hover
- Entry being edited gets highlighted background
- 7 new tests: edit preserves id/turnNumber, trims text, rejects empty, triggers autoSave; delete removes entry, triggers autoSave, no-op for bad id
- 152 tests pass, zero type errors

### Change Log

- 2026-04-12: Story 5.2 implemented — journal edit and delete with inline confirmation

### File List

- src/stores/gameStore.svelte.ts (modified) — editJournalEntry, deleteJournalEntry
- src/stores/gameStore.svelte.test.ts (modified) — 7 new tests
- src/components/journal/JournalPanel.svelte (modified) — edit mode, delete confirmation UI
- src/App.svelte (modified) — pass edit/delete handlers to JournalPanel

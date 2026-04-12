# Story 3.5: Persistence, Pause & Resume

Status: done

## Story

As a player,
I want my game to save automatically and be there when I come back,
So that I can pick up the phone, play for a few minutes, put it down, and never worry about losing progress.

## Acceptance Criteria

1. **Given** Dexie.js is installed **When** persistence is set up **Then** db.ts creates Dexie instance with schema, gameRepository.ts provides save/load/delete

2. **Given** a game is in progress **When** each turn resolves **Then** auto-save triggers invisibly to IndexedDB after every turn

3. **Given** player closes app mid-game **When** player reopens **Then** app opens directly to in-progress game at exact state

4. **Given** no game in progress **When** player opens app **Then** HomeView shows

5. **Given** game completed **When** player starts new game **Then** 2 taps or fewer, previous game preserved

## Tasks / Subtasks

- [x] Task 1: Install Dexie.js and Create DB (AC: #1)
  - [x] 1.1: Install dexie
  - [x] 1.2: Create src/persistence/db.ts — Dexie instance with games table
  - [x] 1.3: Schema: id, mapId, snapshot (serialized), turnStack (serialized), status, updatedAt

- [x] Task 2: Game Repository (AC: #1)
  - [x] 2.1: Create src/persistence/gameRepository.ts — saveGame, loadActiveGame, deleteGame
  - [x] 2.2: Serialize Map objects to arrays for IndexedDB storage
  - [x] 2.3: Deserialize back to Maps on load

- [x] Task 3: Auto-Save (AC: #2)
  - [x] 3.1: In gameStore, call saveGame after each dispatch that succeeds
  - [x] 3.2: Save is silent — no UI feedback on success
  - [x] 3.3: Console.warn on save failure (Toast for later)

- [x] Task 4: Resume on Load (AC: #3, #4)
  - [x] 4.1: On app start, check for active game in IndexedDB
  - [x] 4.2: If found, restore game state and render directly (no splash)
  - [x] 4.3: If not found, show HomeView

- [x] Task 5: Visual Verification
  - [x] 5.1: Play a few turns, close browser, reopen — game resumes
  - [x] 5.2: Complete a game, start new — old game preserved
  - [x] 5.3: Fresh browser shows HomeView

## Dev Notes

### Dexie Schema

```typescript
const db = new Dexie('DarkForceIncursion')
db.version(1).stores({
  games: 'id, mapId, status, updatedAt'
})
```

### Serialization

IndexedDB can't store Map objects. Convert hexes Map to array of entries for storage, restore on load.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Dexie.js 4.4.2, persistence boundary]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Dexie.js 4.4.2 installed, db.ts with games table schema
- gameRepository: saveGame/loadActiveGame/deleteActiveGame with Map serialization
- Auto-save: gameStore calls saveGame after every dispatch and startGame
- Resume: tryResumeGame loads active game on app start, restores state directly
- App waits for initialization before rendering (no flash of wrong state)
- 100 tests pass, zero type errors

### File List

- src/persistence/db.ts (created — Dexie instance, GameRecord schema)
- src/persistence/gameRepository.ts (created — save/load/delete with Map serialization)
- src/stores/gameStore.svelte.ts (modified — auto-save, tryResumeGame, restoreGame, isInitialized)
- src/App.svelte (modified — tryResumeGame on load, wait for initialization)
- package.json (modified — dexie dependency)
- package-lock.json (modified)

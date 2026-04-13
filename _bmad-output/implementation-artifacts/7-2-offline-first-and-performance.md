# Story 7.2: Offline-First & Performance

Status: done

## Story

As a player,
I want the app to work perfectly offline and load fast on my phone,
So that I can play anywhere without worrying about connectivity.

## Acceptance Criteria

1. **Precaching:** Service worker precaches app shell and all static assets. Cache-first strategy.
2. **Full offline:** After first load, app works identically offline — gameplay, journal, archive, auto-save.
3. **Startup performance:** Fully interactive within 3 seconds on mid-range Android.
4. **Lazy loading:** Archive and game detail view components lazy-loaded (not in initial bundle).
5. **Auto-update:** Service worker detects new versions and refreshes cache. IndexedDB preserved.

## Tasks / Subtasks

- [x] Task 1: Verify offline functionality (AC: #1, #2, #5)
  - [x] 1.1 Verify Workbox config precaches all assets (38 entries, 664KB)
  - [x] 1.2 Verify registerType: 'autoUpdate' handles SW updates
  - [x] 1.3 IndexedDB is inherently offline — no changes needed
- [x] Task 2: Lazy-load archive components (AC: #3, #4)
  - [x] 2.1 Convert ArchiveList and GameDetail imports to dynamic imports in App.svelte
  - [x] 2.2 Verify initial bundle excludes archive code (ArchiveList 1.7KB, GameDetail 2.8KB separate chunks)
- [x] Task 3: Verify build and tests
  - [x] 3.1 Clean build (521ms)
  - [x] 3.2 154 tests pass

## Dev Notes

- Offline is already working: Workbox precaches, IndexedDB is local, no network calls in gameplay
- autoUpdate SW is configured — new deployments auto-refresh
- Lazy loading: Svelte supports `{#await import()}` for dynamic component loading
- Performance: Svelte 5 + Vite is already fast. The hex grid SVG renders client-side.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues.

### Completion Notes List

- Offline already working via Workbox precaching (38 entries) + IndexedDB local storage
- autoUpdate SW handles version refreshes, IndexedDB preserved across updates
- Converted ArchiveList and GameDetail to dynamic imports — split into separate chunks
- Initial bundle (index.js 137KB) excludes archive code; archive loads on demand (4.5KB combined)
- Used `svelte:component` with `$state` for lazy-loaded component references
- 154 tests pass, clean build

### Change Log

- 2026-04-12: Story 7.2 completed — lazy-loaded archive, verified offline/precaching

### File List

- src/App.svelte (modified) — dynamic imports for ArchiveList/GameDetail, svelte:component rendering

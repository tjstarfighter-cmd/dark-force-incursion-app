---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
  - step-08-complete
lastStep: 8
status: 'complete'
completedAt: '2026-04-10'
inputDocuments:
  - prd.md
  - product-brief-dark-force-incursion-app.md
  - product-brief-dark-force-incursion-app-distillate.md
  - prd-validation-report.md
workflowType: 'architecture'
project_name: 'dark-force-incursion-app'
user_name: 'Taylor'
date: '2026-04-10'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
47 FRs across 8 capability areas:
- Hex Grid Gameplay (FR1-FR18): Core game engine — hex placement, orientation, army detection, Dark Force spawning/escalation, terrain interactions, fort capture/loss, win/loss detection
- Undo & Override (FR19-FR22): Turn-level rewind and player override of automated resolution
- Rules Reference (FR23-FR24): Contextual and browsable rules help
- Campaign Journal (FR25-FR29): Per-turn and per-session text entries, dictation-friendly, linked to game state
- Campaign Archive (FR30-FR33): Completed game storage with metadata, browsable, viewable
- Pause & Resume (FR34-FR37): Auto-save every turn, seamless close/reopen, fast new-game flow
- PWA (FR38-FR41): Installable, offline-first, local persistence
- Cross-Device Sync (FR42-FR47): Cloud storage file sync with conflict detection

**Non-Functional Requirements:**
17 NFRs across 4 categories:
- Performance (NFR1-5): 100ms tap-to-result, 3s load, 200ms journal open/close, 500ms archive render, 1s dice animation
- Accessibility (NFR6-10): WCAG AA contrast, 44px touch targets, color-independent state, dictation compatibility, phone-readable text
- Reliability (NFR11-14): Auto-save every turn, archive survives browser clears, atomic cloud writes, offline-first parity
- Integration (NFR15-17): Google Drive and Dropbox sync, non-blocking sync operations, explicit conflict warnings

**Scale & Complexity:**
- Primary domain: Client-side SPA / Progressive Web App
- Complexity level: Low-Medium (concentrated in hex engine and rule resolution, not infrastructure)
- Estimated architectural components: 6-8 major modules (hex grid renderer, rule engine, state manager, persistence layer, sync adapter, journal system, archive/replay, PWA shell)

### Technical Constraints & Dependencies

- **Zero budget:** All tooling, hosting, and services must be free/open-source
- **No backend:** All logic runs client-side. Static hosting only (GitHub Pages, Netlify, or similar)
- **Offline-first:** IndexedDB as primary store, service worker for app shell caching. Network is optional.
- **Cross-browser:** Chrome (Android), Firefox (Windows), Safari (iOS) — Chromium, Gecko, WebKit engines
- **Mobile-first performance:** Mid-range Android phone is the benchmark device. 100ms interaction budget.
- **Single user:** No auth, no multi-tenancy, no user management
- **Map digitization:** PDF hex maps must be converted to structured data. MVP: one map (Calosanti). This is manual data entry work that constrains content velocity.

### Cross-Cutting Concerns Identified

- **Turn stack as central data structure:** Game state history is consumed by gameplay (undo/rewind), archive (storage/browsing), replay (Phase 2 visual playback), journal (turn-linked entries), and sync (serialization). The turn stack schema is the single most consequential data design decision.
- **Persistence & serialization:** IndexedDB and cloud file sync both need the same game state format. Schema must be version-tolerant for future terrain types, alternative rules, and map packs.
- **Terrain extensibility:** MVP is mountains-only, but Phase 2 adds 5 terrain types with fundamentally different resolution algorithms. The rule engine must support terrain as a pluggable strategy, not hardcoded branches.
- **Rendering at scale:** Each hex displays 6 oriented numbers plus state overlays (army, Dark Force, blocked, fort). On phone screens, this is the critical UX risk. Rendering approach must support zoom/pan and maintain legibility.
- **Dictation compatibility:** Journal inputs must work with external voice tools (Aqua Voice). No custom input handling that blocks system-level dictation.

## Starter Template Evaluation

### Primary Technology Domain

Client-side SPA / Progressive Web App — all logic runs in the browser. No backend, no server-side rendering. Static hosting only.

### Starter Options Considered

| Option | Bundle Size | Mobile Load | Ecosystem | Fit for Project |
|---|---|---|---|---|
| Svelte + Vite + TS | ~1.5-3KB | Fastest (30% faster than React) | Growing, smaller | Best fit |
| React + Vite + TS | ~40KB+ | Adequate but heaviest | Largest | Overkill for constraints |
| Preact + Vite + TS | ~3KB | Fast | Smallest | Compat shim friction |

### Selected Starter: Svelte + Vite + TypeScript

**Rationale for Selection:**
Mobile performance is the project's #1 technical risk (NFR1: 100ms tap-to-result, NFR2: 3s load on mid-range Android). Svelte's compile-time approach produces the smallest bundle and fastest mobile paint of the three options. The hex grid — the most performance-critical element — will render on Canvas or SVG, bypassing the framework's component model entirely, so React's virtual DOM adds weight without value. TypeScript provides type safety for the complex game state (hex orientation, turn stacks, Dark Force cascading resolution). The developer is learning from scratch, and Svelte's syntax is closer to plain HTML/JS with less framework abstraction to internalize.

**Initialization Command:**
```bash
npm create vite@latest dark-force-incursion -- --template svelte-ts
npm install -D vite-plugin-pwa
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript 6.x with Svelte's built-in TS support. Strict mode enabled. Svelte compiler handles TS in `.svelte` files natively.

**Styling Solution:**
Scoped CSS in Svelte components (built-in, no additional library). Global styles via standard CSS. No CSS-in-JS overhead.

**Build Tooling:**
Vite 8.x with Rollup-based production builds. Tree-shaking, code splitting, and minification out of the box. vite-plugin-pwa (v1.2.0) wraps Workbox 7.x for service worker generation and precaching.

**Testing Framework:**
To be determined in architectural decisions — Vitest is the natural fit for a Vite project (same config, same transform pipeline).

**Code Organization:**
Vite's default Svelte-TS template provides `src/` with components, `public/` for static assets, and `vite.config.ts` for build configuration. Extended with domain-specific organization in the architecture decisions step.

**Development Experience:**
Vite dev server with hot module replacement (HMR). Instant reflection of code changes. TypeScript errors surfaced in terminal and editor. PWA development mode available via vite-plugin-pwa for testing offline behavior during development.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Hex coordinate system → Axial (q, r)
2. Turn stack structure → Full snapshots + action log (hybrid)
3. Hex grid rendering → SVG
4. State management → Svelte built-in stores

**Important Decisions (Shape Architecture):**
5. IndexedDB access → Dexie.js wrapper
6. Cloud sync format → File-per-game with manifest, JSON, schema-versioned
7. Routing → Simple view switching with History API
8. Testing → Vitest, rule-engine-heavy strategy

**Deferred Decisions (Post-MVP):**
- Cloud sync OAuth implementation (Google Drive / Dropbox API integration)
- Campaign replay playback engine
- CI/CD pipeline (GitHub Actions)

### Data Architecture

**Hex Coordinate System: Axial (q, r)**
- Rationale: Honeycomb.js uses axial coordinates natively. Six neighbors are constant offsets — no conditional logic for adjacency. Edge identification maps directly to the clockwise numbering mechanic. Cube coordinates available via conversion `(q, r, -q-r)` when needed for terrain traversal (forest contour counting, lake line-of-sight).
- Affects: Hex grid engine, map data format, terrain resolution, rendering

**Turn Stack: Full Snapshots + Action Log (Hybrid)**
- Rationale: Storage cost is trivial (~100-500KB per game for 60-80 turns). Full snapshots enable instant random-access rewind to any turn with zero reconstruction logic. Action log provides human-readable turn narration for replay (Phase 2) and debugging. Eliminates delta-reconstruction bugs — critical for a solo developer.
- Schema per turn: `{ turnNumber, action: { type, from, direction, roll, ... }, snapshot: { hexes, armies, darkForce, forts, tally, ... }, journalEntries: [...] }`
- Affects: Undo/rewind (FR19-22), archive (FR30-33), replay (Phase 2), persistence, sync

**IndexedDB Access: Dexie.js v4.4.2**
- Rationale: Raw IndexedDB API is verbose and callback-based. Dexie provides promise-based access, TypeScript types, schema versioning with built-in migrations (critical as terrain types and rules expand across phases), and query capabilities for archive browsing (FR31).
- Affects: All persistence operations, schema evolution across phases

**Cloud Sync: File-Per-Game with Manifest**
- Format: JSON with `schemaVersion` field for forward/backward compatibility
- Structure: `manifest.json` (game list + metadata + settings) + individual `game-{id}.json` files
- Atomic writes: Write-to-temp-then-rename pattern to prevent corruption (NFR13)
- Rationale: Sync operations are proportional to changes, not total archive size. Conflict detection (FR46) is per-file — simultaneous edits to different games don't conflict. Scales naturally to 100+ games.
- Affects: Cross-device sync (FR42-47), archive storage, backup/restore

### Authentication & Security

Not applicable. Single-user client-side app with no backend. Cloud sync OAuth (Google Drive/Dropbox) deferred to implementation phase — architecture is sync-adapter-ready but auth flow is not pre-decided.

### API & Communication Patterns

Not applicable. No backend, no API layer. All logic runs client-side. Cloud sync uses third-party storage APIs (Google Drive/Dropbox) via their respective JavaScript SDKs.

### Frontend Architecture

**State Management: Svelte Built-in Stores**
- Organized by domain: `gameStore` (active game state + turn stack), `archiveStore` (completed games list), `journalStore` (derived from active game), `settingsStore` (app preferences, sync config)
- Rationale: Single user, one active game, sequential turns — no concurrent mutation or server reconciliation. Svelte's reactive stores are right-sized. Derived stores compute values automatically (forts captured, Dark Force tally, win/loss status).
- Affects: All UI components, game engine integration

**Hex Grid Rendering: SVG**
- Rationale: Native touch/click events per element (critical for tap-a-hex-edge interaction on phone). Vector scaling ensures crisp text at any zoom level (6 numbers per hex must be legible). ARIA attributes support accessibility (NFR6-8). Svelte components bind directly to SVG elements with reactive updates. DOM element count (~500-1000 nodes for a full map) is within acceptable range for 50-80 hex maps. Performance validated during hex grid prototype on real phone before building game logic.
- Affects: All hex grid interaction, accessibility, zoom/pan, visual state overlays

**Routing: Simple View Switching + History API**
- Views: Active gameplay, campaign archive, game detail, settings (~4-5 total)
- Browser History API integration (~15 lines) for Android back button support
- Rationale: App has too few views to justify a routing library. Home-screen PWA users don't see or use the URL bar. Back button is the only real navigation UX concern, solved with minimal History API code.
- Affects: Navigation, PWA behavior

### Infrastructure & Deployment

**Hosting: GitHub Pages (Free Static Hosting)**
- Rationale: Zero cost, Taylor has GitHub account, static files only (no server needed). Vite builds to static assets. GitHub Pages serves them with HTTPS.
- Affects: Deployment workflow, PWA service worker scope

**Testing: Vitest v4.1.4**
- Strategy: Rule-engine-heavy testing. Pure logic functions (hex placement, orientation, army detection, Dark Force cascading, terrain resolution, win/loss) get extensive unit test suites. Persistence layer gets light integration tests. UI validated manually on real devices. Cloud sync tested when implemented.
- Rationale: Rule engine is where bugs hide and hurt most — complex cascading state mutations that must be deterministic and rewindable. UI testing adds maintenance without catching real bugs for this project scale.
- Affects: Rule engine reliability, Phase 2 terrain confidence

**CI/CD: Deferred**
- GitHub Actions pipeline deferred until core gameplay is stable. Manual deployment initially.

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffolding (Vite + Svelte + TS + PWA plugin)
2. Hex grid SVG prototype on real phone (validate rendering + touch UX risk)
3. Hex coordinate system + Honeycomb.js integration
4. Rule engine core (placement, orientation, army detection, blocking, Dark Force)
5. Turn stack (snapshot + action log per turn)
6. Dexie.js persistence (save/load/auto-save)
7. State management (Svelte stores wired to engine + persistence)
8. Mountain terrain resolution
9. Journal system
10. Campaign archive
11. View switching + app shell
12. PWA configuration (service worker, manifest, offline)
13. Cloud sync adapter

**Cross-Component Dependencies:**
- Rule engine depends on hex coordinate system (axial)
- Turn stack depends on rule engine (produces snapshots) and persistence (Dexie stores them)
- Rendering (SVG) depends on hex coordinates and game state (Svelte stores)
- Archive depends on turn stack format and persistence
- Sync depends on persistence format (JSON serialization of Dexie data)
- Testing depends on rule engine being pure functions (no DOM, no async)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**5 critical conflict areas identified** where AI agents could make inconsistent choices: naming conventions, project organization, state management patterns, error handling approach, and TypeScript strictness.

### Naming Patterns

**File Naming:**
- Svelte components: `PascalCase.svelte` — `HexGrid.svelte`, `JournalPanel.svelte`
- TypeScript modules: `camelCase.ts` — `ruleEngine.ts`, `hexMath.ts`
- Test files: `{module}.test.ts` co-located — `ruleEngine.test.ts`
- Type definitions: `camelCase.types.ts` — `game.types.ts`

**Code Naming:**
- Variables/functions: `camelCase` — `getDarkForceTally()`, `isHexBlocked()`
- Types/interfaces: `PascalCase` — `HexState`, `TurnSnapshot`, `GameAction`
- Constants: `UPPER_SNAKE_CASE` — `MAX_DARK_FORCE_ARMIES`, `HEX_DIRECTIONS`
- Enums: `PascalCase` name and members — `TerrainType.Mountain`, `GameStatus.InProgress`
- Svelte stores: `camelCase` — `gameStore`, `archiveStore`, `settingsStore`

**Data Naming:**
- Dexie tables: `camelCase` plural — `games`, `settings`
- JSON/serialization fields: `camelCase` — direct TypeScript object mapping, no transformation

### Structure Patterns

**Project Organization: Feature-based**
```
src/
  engine/          — Rule engine, hex math, terrain resolvers (pure logic, no UI)
  stores/          — Svelte stores (gameStore, archiveStore, etc.)
  components/
    hex-grid/      — HexGrid.svelte, HexCell.svelte, EdgeSelector.svelte
    journal/       — JournalPanel.svelte, JournalEntry.svelte
    archive/       — ArchiveList.svelte, GameDetail.svelte
    dice/          — DiceRoller.svelte, DiceInput.svelte
    rules/         — RulesReference.svelte
    shared/        — Button.svelte, Modal.svelte (truly shared UI)
  persistence/     — Dexie setup, save/load operations
  sync/            — Cloud sync adapter (later)
  types/           — Shared type definitions
  maps/            — Map data files (Calosanti, etc.)
  App.svelte       — Root component + view switching
  main.ts          — Entry point
```

**Test files co-located** with source code — `ruleEngine.test.ts` next to `ruleEngine.ts`.

### State Management Patterns

**Immutable updates only.** Store updates always produce new objects, never mutate existing ones. Critical because turn stack snapshots must be independent — shared mutable references break undo/rewind.

**Rule engine is a pure function.** Signature: `resolveAction(state: GameSnapshot, action: GameAction): TurnResult`. No side effects, no store access, no persistence calls. Input → output. Testable in isolation.

**Stores are thin wrappers.** Stores call the rule engine, push results onto the turn stack, and trigger persistence. Zero game logic inside stores.

### Error Handling Patterns

**Rule violations are typed results, not exceptions.**
```typescript
type TurnResult =
  | { ok: true; snapshot: GameSnapshot; action: GameAction }
  | { ok: false; reason: RuleViolation }
```
Exceptions reserved for unexpected bugs. Rule violations (illegal move, blocked hex) are expected game states returned as data.

**Persistence errors surface to the user.** Auto-save failures display a visible warning — never silently swallowed. Data loss is the one failure mode the PRD explicitly calls unacceptable.

**UI errors use Svelte's built-in handling.** Toast/banner pattern for user-facing messages. No global error modals for recoverable actions.

### TypeScript Strictness

**`strict: true`, no escape hatches.** No `any` types (use `unknown` and narrow). No `// @ts-ignore`. No suppressing the type checker — fix the types instead.

**Explicit return types on public functions.** Rule engine and store functions declare return types. Internal helpers use inference.

**No optional chaining as null suppression.** `?.` is for genuinely optional data, not for skipping null checks on data that must exist.

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow naming conventions exactly as documented (PascalCase components, camelCase modules, UPPER_SNAKE constants)
- Keep game logic in `engine/` — never in components or stores
- Use immutable state updates — never mutate store values or snapshots
- Return typed results from the rule engine — never throw for rule violations
- Co-locate test files with source files
- Maintain TypeScript strict mode — no `any`, no `@ts-ignore`

**Anti-Patterns to Avoid:**
- Game logic inside Svelte components (move to engine/)
- Mutable state updates (`state.hexes.push()` instead of spreading)
- Thrown exceptions for expected game states (blocked hex, illegal move)
- Separate `__tests__/` directory mirroring source tree
- `any` types to "fix" TypeScript errors
- Store functions that bypass the rule engine to modify game state directly

## Project Structure & Boundaries

### Requirements to Structure Mapping

| FR Category | Primary Location | Key Files |
|---|---|---|
| Hex Grid Gameplay (FR1-FR18) | `engine/`, `components/hex-grid/`, `maps/` | `ruleEngine.ts`, `hexMath.ts`, `terrainResolver.ts`, `HexGrid.svelte` |
| Undo & Override (FR19-FR22) | `engine/`, `stores/` | `turnStack.ts`, `gameStore.ts` |
| Rules Reference (FR23-FR24) | `components/rules/`, `data/` | `RulesReference.svelte`, `rulesContent.ts` |
| Campaign Journal (FR25-FR29) | `components/journal/`, `stores/` | `JournalPanel.svelte`, `journalStore.ts` |
| Campaign Archive (FR30-FR33) | `components/archive/`, `persistence/` | `ArchiveList.svelte`, `gameRepository.ts` |
| Pause & Resume (FR34-FR37) | `persistence/`, `stores/` | `autoSave.ts`, `gameStore.ts` |
| PWA (FR38-FR41) | Root config, `public/` | `vite.config.ts`, `manifest.webmanifest`, `sw.ts` |
| Cross-Device Sync (FR42-FR47) | `sync/` | `syncAdapter.ts`, `conflictDetector.ts`, `syncManifest.ts` |

### Complete Project Directory Structure

```
dark-force-incursion/
├── index.html                          — SPA entry point (Vite convention)
├── package.json                        — Dependencies and scripts
├── tsconfig.json                       — TypeScript config (strict: true)
├── vite.config.ts                      — Vite + vite-plugin-pwa config
├── svelte.config.js                    — Svelte compiler config
├── .gitignore
├── .env.example                        — Environment template (sync API keys, if needed later)
│
├── public/
│   ├── manifest.webmanifest            — PWA manifest (app name, icons, theme)
│   ├── icons/                          — PWA icons (192x192, 512x512)
│   └── favicon.svg
│
├── src/
│   ├── main.ts                         — App entry point, mounts Svelte
│   ├── App.svelte                      — Root component, view switching + History API
│   ├── app.css                         — Global styles, CSS variables, hex color palette
│   │
│   ├── engine/                         — Pure game logic (NO UI, NO side effects)
│   │   ├── ruleEngine.ts               — Core: resolveAction(state, action) → TurnResult
│   │   ├── ruleEngine.test.ts          — Extensive unit tests for all rule resolution
│   │   ├── hexMath.ts                  — Axial coordinate math, adjacency, edge mapping
│   │   ├── hexMath.test.ts             — Coordinate and adjacency tests
│   │   ├── turnStack.ts               — Snapshot + action log management
│   │   ├── turnStack.test.ts          — Undo, rewind, stack integrity tests
│   │   ├── armyDetector.ts             — Matching number scan across all neighbors
│   │   ├── armyDetector.test.ts
│   │   ├── darkForce.ts               — Dark Force spawning and escalation cascades
│   │   ├── darkForce.test.ts
│   │   ├── fortResolver.ts            — Fort capture, loss, reachability
│   │   ├── fortResolver.test.ts
│   │   ├── winLoss.ts                 — Win/loss condition detection
│   │   ├── winLoss.test.ts
│   │   └── terrain/                   — Terrain resolvers (pluggable per type)
│   │       ├── terrainResolver.ts     — Terrain strategy dispatcher
│   │       ├── terrainResolver.test.ts
│   │       ├── mountain.ts            — Mountain: blocks source hex (MVP)
│   │       ├── mountain.test.ts
│   │       ├── forest.ts             — Forest: clockwise contour traversal (Phase 2)
│   │       ├── lake.ts               — Lake: straight-line crossing (Phase 2)
│   │       ├── marsh.ts              — Marsh: spreading blocks (Phase 2)
│   │       ├── muster.ts             — Muster: bonus adjacent claims (Phase 2)
│   │       └── ambush.ts             — Ambush: lose last 2 armies (Phase 2)
│   │
│   ├── types/                         — Shared TypeScript type definitions
│   │   ├── hex.types.ts               — HexCoord, HexState, HexEdge, Orientation
│   │   ├── game.types.ts              — GameSnapshot, GameAction, TurnResult, GameStatus
│   │   ├── terrain.types.ts           — TerrainType, TerrainResolver interface
│   │   ├── journal.types.ts           — JournalEntry, JournalScope
│   │   ├── map.types.ts               — MapDefinition, MapHex, FortLocation
│   │   └── sync.types.ts             — SyncManifest, SyncConflict, SyncStatus
│   │
│   ├── stores/                        — Svelte stores (thin wrappers, no game logic)
│   │   ├── gameStore.ts               — Active game state, calls ruleEngine, triggers save
│   │   ├── archiveStore.ts            — Completed games list, metadata
│   │   ├── settingsStore.ts           — App preferences (dice mode, sync config)
│   │   └── viewStore.ts              — Current view + History API integration
│   │
│   ├── persistence/                   — Dexie.js database layer
│   │   ├── db.ts                      — Dexie instance, schema definition, version migrations
│   │   ├── db.test.ts                 — Schema migration tests
│   │   ├── gameRepository.ts          — Save/load/delete games, archive queries
│   │   ├── gameRepository.test.ts     — Persistence integration tests
│   │   └── autoSave.ts               — Auto-save on every turn, debounced writes
│   │
│   ├── sync/                          — Cloud sync adapter (Phase 1 late / Phase 2)
│   │   ├── syncAdapter.ts            — Abstract sync interface
│   │   ├── googleDrive.ts            — Google Drive implementation
│   │   ├── dropbox.ts                — Dropbox implementation
│   │   ├── conflictDetector.ts        — Detect and surface sync conflicts
│   │   └── syncManifest.ts           — Manifest.json read/write for file-per-game sync
│   │
│   ├── maps/                          — Map data files (structured from PDF digitization)
│   │   ├── mapLoader.ts               — Load and validate map definitions
│   │   ├── calosanti.ts               — Calosanti Region map data (MVP)
│   │   └── mapRegistry.ts            — Available maps registry
│   │
│   ├── components/
│   │   ├── hex-grid/                  — Hex grid SVG rendering and interaction
│   │   │   ├── HexGrid.svelte         — SVG container, zoom/pan, hex layout
│   │   │   ├── HexCell.svelte         — Single hex: polygon, 6 numbers, state overlays
│   │   │   ├── EdgeSelector.svelte    — Tap target for hex edge selection
│   │   │   ├── ArmyMarker.svelte      — Army indicator overlay
│   │   │   ├── DarkForceMarker.svelte — Dark Force indicator overlay
│   │   │   ├── FortMarker.svelte      — Fort status indicator
│   │   │   └── BlockedOverlay.svelte  — Blocked hex visual treatment
│   │   │
│   │   ├── dice/                      — Dice input components
│   │   │   ├── DiceRoller.svelte      — Digital dice with animation
│   │   │   └── DiceInput.svelte       — Manual number entry (1-6 buttons)
│   │   │
│   │   ├── journal/                   — Campaign journal components
│   │   │   ├── JournalPanel.svelte    — Slide-out journal panel
│   │   │   ├── JournalEntry.svelte    — Single entry display/edit
│   │   │   └── JournalComposer.svelte — New entry input (dictation-friendly textarea)
│   │   │
│   │   ├── archive/                   — Campaign archive components
│   │   │   ├── ArchiveList.svelte     — Game list with metadata (date, map, win/loss)
│   │   │   └── GameDetail.svelte      — View completed game state + journal entries
│   │   │
│   │   ├── rules/                     — Rules reference components
│   │   │   └── RulesReference.svelte  — Contextual + browsable rules display
│   │   │
│   │   ├── game/                      — Game session UI components
│   │   │   ├── GameView.svelte        — Main gameplay view (grid + controls + status)
│   │   │   ├── GameStatus.svelte      — Dark Force tally, fort count, turn number
│   │   │   ├── GameControls.svelte    — Undo, rules ref, journal toggle, settings
│   │   │   └── GameOver.svelte        — Win/loss screen with stats
│   │   │
│   │   ├── settings/                  — App settings components
│   │   │   └── SettingsView.svelte    — Dice mode, sync config, about
│   │   │
│   │   └── shared/                    — Truly shared UI primitives
│   │       ├── Toast.svelte           — User-facing messages (errors, confirmations)
│   │       └── Modal.svelte           — Reusable modal overlay
│   │
│   └── data/                          — Static data (rules text, terrain descriptions)
│       └── rulesContent.ts            — Rules reference text organized by mechanic/terrain
│
└── dist/                              — Vite build output (gitignored, deployed to GitHub Pages)
```

### Architectural Boundaries

**Engine Boundary (Pure Logic):**
`src/engine/` is a hard boundary. Nothing inside imports from `stores/`, `components/`, `persistence/`, or `sync/`. It takes typed inputs and returns typed outputs. Any AI agent working on the rule engine can work in complete isolation from the UI.

**Persistence Boundary:**
`src/persistence/` owns all Dexie interactions. No other module calls Dexie directly. Stores access persistence through the repository pattern (`gameRepository.ts`). Storage implementation can change without touching game logic or UI.

**Sync Boundary:**
`src/sync/` is isolated from both the engine and the UI. It reads/writes the same game data format that persistence uses. The sync adapter interface is abstract — Google Drive and Dropbox are interchangeable implementations. Sync is invoked by stores, never by components directly.

**Component Boundary:**
Components render state from stores and dispatch actions to stores. They never call the rule engine directly, never call persistence directly, never contain game logic. A component's job: read store → render UI → capture user input → dispatch to store.

### Data Flow

```
User Interaction → Component → Store → Rule Engine → New Snapshot
                                    → Persistence (auto-save)
                                    → Sync (background, non-blocking)
                              ← Store (reactive update) ← Component (re-render)
```

### Integration Points

**Internal Communication:**
- Components → Stores: Svelte store subscriptions (reactive `$store` syntax) and store method calls
- Stores → Engine: Direct function calls (`resolveAction(state, action)`)
- Stores → Persistence: Async calls to `gameRepository` (save, load, query)
- Stores → Sync: Background async calls, non-blocking (NFR16)

**External Integrations:**
- Google Drive API (Phase 1 late / Phase 2) — via `sync/googleDrive.ts`
- Dropbox API (Phase 1 late / Phase 2) — via `sync/dropbox.ts`
- Honeycomb.js — imported in `engine/hexMath.ts` for coordinate math
- Dexie.js — imported only in `persistence/db.ts`
- Workbox — configured via `vite-plugin-pwa`, no direct imports in app code

### Development Workflow

- `npm run dev` — Vite dev server with HMR
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally
- `npm run test` — Vitest (co-located test files)

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices are compatible and mutually reinforcing. Svelte 5.55 + Vite 8.0 + TypeScript 6.0 + vite-plugin-pwa 1.2.0 (Workbox 7.4) + Dexie.js 4.4.2 + Honeycomb.js 4.1.5 + Vitest 4.1.4. No version conflicts. No contradictory decisions.

**Pattern Consistency:** Naming conventions, test organization, state management patterns, and error handling all align with Svelte/TypeScript conventions and support the architectural boundaries.

**Structure Alignment:** Project structure directly enables the engine boundary (pure logic isolation), persistence boundary (Dexie encapsulation), sync boundary (adapter pattern), and component boundary (store-mediated UI).

### Requirements Coverage Validation

**Functional Requirements:** 47/47 FRs covered. Every FR category maps to specific directories, files, and architectural patterns. No orphan requirements.

**Non-Functional Requirements:** 17/17 NFRs architecturally addressed. Performance targets served by Svelte's compiled output + SVG native events + synchronous pure engine. Reliability served by Dexie auto-save + service worker. Accessibility served by SVG ARIA + dedicated overlay components. Integration served by abstract sync adapter pattern.

### Implementation Readiness Validation

**Decision Completeness:** All 8 critical and important decisions documented with verified versions, rationale, and affected components. 3 decisions explicitly deferred with justification.

**Structure Completeness:** Full project tree with every file and directory defined. Requirements mapped to specific locations. Architectural boundaries with clear import rules.

**Pattern Completeness:** Naming conventions cover files, code, data, and stores. State management pattern (immutable + pure engine + thin stores) specified with code examples. Error handling pattern distinguishes rule violations (typed results) from unexpected errors (exceptions). Anti-patterns explicitly listed.

### Gap Analysis Results

**Critical Gaps:** None

**Important Gaps:**
1. Honeycomb.js v4.1.5 now verified and recorded in Technology Reference
2. Map data schema (`MapDefinition` type structure) deferred to implementation — exact shape depends on hex coordinate system integration and will be defined in the map digitization story

**Nice-to-Have Gaps:**
- PWA icon generation strategy — standard tooling, not architectural
- CSS color palette — deferred to UX design phase
- Error logging strategy — surface-to-user via Toast is sufficient for single-user app

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed (47 FRs, 17 NFRs, 4 user journeys)
- [x] Scale and complexity assessed (Low-Medium, client-side SPA)
- [x] Technical constraints identified (zero budget, no backend, offline-first, mobile-first)
- [x] Cross-cutting concerns mapped (turn stack, persistence, terrain extensibility, rendering, dictation)

**Architectural Decisions**
- [x] Critical decisions documented with versions (8 decisions, all verified)
- [x] Technology stack fully specified (Svelte + Vite + TS + PWA + Dexie + Honeycomb + Vitest)
- [x] Integration patterns defined (stores mediate all communication)
- [x] Performance considerations addressed (Svelte compile-time, SVG native events, pure engine)

**Implementation Patterns**
- [x] Naming conventions established (files, code, data, stores)
- [x] Structure patterns defined (feature-based, co-located tests)
- [x] State management patterns specified (immutable, pure engine, thin stores)
- [x] Error handling patterns documented (typed results, surface persistence failures)

**Project Structure**
- [x] Complete directory structure defined (every file mapped)
- [x] Component boundaries established (engine, persistence, sync, UI)
- [x] Integration points mapped (internal and external)
- [x] Requirements to structure mapping complete (8 FR categories → specific directories)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all requirements covered, all decisions coherent, all boundaries defined, no critical gaps.

**Key Strengths:**
- Pure rule engine boundary makes the most complex code the most testable
- Turn stack snapshot design eliminates entire classes of undo/rewind bugs
- Terrain resolver strategy pattern ensures Phase 2 terrain types plug in without rewriting core
- Svelte's compile-time approach directly serves the #1 technical risk (mobile performance)
- File-per-game sync scales naturally and simplifies conflict detection

**Areas for Future Enhancement:**
- Map data schema will be refined during Calosanti digitization
- CSS design system/color palette to be defined during UX design
- CI/CD pipeline to be added when deployment workflow stabilizes
- Cloud sync OAuth flow to be designed during sync implementation

### Technology Reference

| Technology | Version | Purpose |
|---|---|---|
| Svelte | 5.55.3 | UI framework (compile-time reactivity) |
| Vite | 8.0.8 | Build tool + dev server |
| TypeScript | 6.0.2 | Type safety for complex game state |
| vite-plugin-pwa | 1.2.0 | PWA service worker + manifest generation |
| Workbox | 7.4.0 | Service worker caching strategies |
| Dexie.js | 4.4.2 | IndexedDB wrapper with schema migrations |
| Honeycomb.js | 4.1.5 | Hex grid coordinate math (axial) |
| Vitest | 4.1.4 | Unit testing (same Vite pipeline) |

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and architectural boundaries (engine imports nothing from UI/stores/persistence)
- Refer to this document for all architectural questions
- When in doubt about a pattern, check the Enforcement Guidelines section

**First Implementation Priority:**
```bash
npm create vite@latest dark-force-incursion -- --template svelte-ts
npm install -D vite-plugin-pwa
```
Then: prototype the hex grid SVG on a real phone before building game logic.

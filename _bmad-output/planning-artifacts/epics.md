---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
status: complete
completedAt: '2026-04-11'
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
  - product-brief-dark-force-incursion-app-distillate.md
---

# Dark Force Incursion Companion App - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the Dark Force Incursion Companion App, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Player can select a map to start a new game on
FR2: Player can view the hex grid map with all hex positions, terrain features, fort locations, and starting point clearly displayed
FR3: Player can select a claimed, non-blocked hex to roll from
FR4: Player can select a hex edge/direction to roll toward
FR5: Player can input a dice roll via manual number entry
FR6: Player can input a dice roll via digital dice roller with animation
FR7: System places a new hex in the rolled direction with numbers 1-6 oriented clockwise starting with the rolled number on the connecting side
FR8: System detects and marks armies when matching numbers are adjacent between any neighboring hexes (not just the source hex)
FR9: System detects and applies blocked hex rules when a duplicate number is rolled
FR10: System detects and spawns Dark Force armies when non-matching adjacent numbers trigger Dark Force placement
FR11: System resolves Dark Force escalation when rolling a number that already has a Dark Force army on it (cascading defeats and blocks)
FR12: System detects and resolves mountain terrain interactions (rolling into a mountain blocks the source hex)
FR13: System detects fort capture when an army is placed in a fort hex
FR14: System detects fort loss when a fort hex is blocked before capture or becomes unreachable
FR15: System maintains a running Dark Force army tally
FR16: System detects win condition (more than half the forts captured)
FR17: System detects lose conditions (Dark Force army limit reached or all remaining forts unreachable/blocked)
FR18: Player can view the current game state at a glance — claimed hexes, blocked hexes, fort status, army positions, and Dark Force armies distinguishable visually without relying on color alone
FR19: Player can undo the most recent turn
FR20: Player can rewind to any prior turn in the current game
FR21: Player can manually override the system's automated rule resolution after rewinding
FR22: System stores game state as a stack of turns, preserving the complete history for undo and replay
FR23: Player can access a quick rules reference relevant to the current game action or most recent rule that triggered
FR24: Player can browse the complete rules reference for all game mechanics and terrain types
FR25: Player can create a journal entry linked to the current turn during gameplay
FR26: Player can create a journal entry linked to the overall game session (not turn-specific)
FR27: Player can input journal entries via text (compatible with system-level dictation tools including Aqua Voice)
FR28: Player can view journal entries during gameplay to review prior notes
FR29: Player can edit or delete existing journal entries
FR30: System automatically saves the completed game to the campaign archive upon win or loss
FR31: Player can browse the campaign archive with visible metadata (date, map name, win/loss outcome, number of journal entries)
FR32: Player can open a completed game from the archive and view the final game state
FR33: Player can read all journal entries from an archived game
FR34: System automatically saves game state on every turn (no manual save required)
FR35: Player can close the app mid-game and resume from the exact turn they left off
FR36: Player can see an unfinished game and resume it when opening the app
FR37: Player can start a new game after completing or abandoning a game in 2 taps or fewer
FR38: Player can install the app on their device (Android, desktop)
FR39: Player can use the app with full functionality while offline (no network connection)
FR40: System persists all game data, journal entries, and archive locally on the device
FR41: App loads and is interactive within performance targets on mobile devices
FR42: Player can configure a cloud storage location (Google Drive or Dropbox folder) to store app data during initial setup
FR43: Player can use the app in local-only mode without configuring cloud storage
FR44: System reads and writes all game data, journal entries, and archive to the configured cloud storage location
FR45: System detects when the data file has been modified externally (by another device) and reloads the current state
FR46: System warns the player if a conflict is detected (data changed on another device while the app was in use)
FR47: Player can switch between local-only and cloud-synced storage in app settings

### NonFunctional Requirements

NFR1: Tap-to-result interaction (select hex edge -> roll -> see placed hex) completes in under 100ms on a mid-range Android phone
NFR2: App is fully interactive within 3 seconds of launch on a mid-range Android phone
NFR3: Journal open/close (tap to open, dictate, tap to close) completes in under 200ms
NFR4: Campaign archive list renders in under 500ms with 100+ saved games
NFR5: Digital dice roller animation completes within 1 second
NFR6: All text in hex cells meets WCAG AA contrast ratio (4.5:1 minimum)
NFR7: All interactive touch targets are at least 44x44px
NFR8: Hex state (claimed, blocked, fort, Dark Force) is distinguishable without relying on color alone (icons, patterns, or labels supplement color)
NFR9: Journal input fields accept text from system-level dictation tools (Aqua Voice, Android voice input, iOS dictation) without interference
NFR10: UI text is readable without zooming on phone screens at default font size
NFR11: Game state auto-saves on every turn — no data loss if the app is closed, crashes, or loses power mid-game
NFR12: Campaign archive data survives app updates, browser cache clears (within IndexedDB persistence limits), and device restarts
NFR13: Cloud-synced data file is written atomically — partial writes do not corrupt the archive
NFR14: The app functions identically with or without a network connection (offline-first, not offline-capable)
NFR15: Cloud storage sync supports Google Drive and Dropbox
NFR16: Sync operations do not block gameplay — reads and writes happen in the background
NFR17: Sync conflicts are surfaced to the player with a clear warning, never silently resolved

### Additional Requirements

- Starter template: Svelte 5.55 + Vite 8.0 + TypeScript 6.0 initialized via `npm create vite@latest dark-force-incursion -- --template svelte-ts` with `vite-plugin-pwa` added
- Hex coordinate system: Axial (q, r) using Honeycomb.js 4.1.5 for coordinate math
- Hex grid rendering via SVG with native touch/click events per element
- State management via Svelte built-in stores organized by domain (gameStore, archiveStore, settingsStore, viewStore)
- IndexedDB access via Dexie.js 4.4.2 with schema versioning and migrations
- Cloud sync format: file-per-game with manifest (manifest.json + individual game-{id}.json files), JSON with schemaVersion, atomic write-to-temp-then-rename
- Routing: Simple view switching with History API (~15 lines) for Android back button support
- Testing: Vitest 4.1.4 with rule-engine-heavy strategy, co-located test files
- Pure rule engine boundary: engine/ directory imports nothing from stores, components, persistence, or sync. Signature: `resolveAction(state: GameSnapshot, action: GameAction): TurnResult`
- Immutable state updates only — store updates always produce new objects, never mutate existing
- Rule violations are typed results, not exceptions: `TurnResult = { ok: true; snapshot; action } | { ok: false; reason: RuleViolation }`
- Persistence errors surface to the user — auto-save failures display visible warning, never silently swallowed
- Feature-based project organization with engine/, stores/, components/, persistence/, sync/, types/, maps/ directories
- Terrain resolver strategy pattern — terrain as pluggable strategy for Phase 2 extensibility
- Map data: Calosanti Region map from Mountain Map Pack digitized as structured data (hex positions, terrain type, fort locations, starting point)
- TypeScript strict mode: `strict: true`, no `any` types, no `@ts-ignore`, explicit return types on public functions
- Naming conventions: PascalCase.svelte for components, camelCase.ts for modules, {module}.test.ts co-located, UPPER_SNAKE_CASE for constants, PascalCase for types/interfaces/enums

### UX Design Requirements

UX-DR1: Design token system implemented as CSS custom properties in app.css — color palette (player warm, enemy cold, terrain earthy, UI accent), typography scale, spacing scale (8px base), border/shadow system, animation timing tokens, breakpoint tokens
UX-DR2: Dual-font typography — Inter or IBM Plex Sans for hex grid numbers and game data (legible at 10-12px minimum), Cinzel for headings + Crimson Text/Cormorant Garamond for body text (fantasy manuscript atmosphere)
UX-DR3: Dark atmospheric color palette — deep charcoal app background (~#1a1a2e), warm parchment claimed hexes (~#d4a574), gold army markers (~#f0c040), deep crimson Dark Force (~#8b1a1a), stone gray mountains (~#6a6a7a), cream text (~#e8e0d0)
UX-DR4: Immersive full-bleed layout (Direction A) — hex grid SVG fills entire viewport, StatusBar and ControlStrip float as translucent overlays with backdrop blur
UX-DR5: Expanded edge targets — six wedge-shaped tap zones extending outward beyond hex boundary when hex is selected, 44x44px minimum effective tap area per wedge, with active/dimmed/terrain-warning states
UX-DR6: Consequence cascade animation — 5-beat sequential visual sequence (hex placed ~200ms, armies detected ~200ms, Dark Force checked ~200ms, terrain resolved ~200-400ms, fort status ~100ms) completing in 1-2 seconds total
UX-DR7: TurnSummary component — compact text strip above control strip after each cascade ("Turn 14: +1 Army, +1 Dark Force, Mountain blocked source"), persists until next turn, tappable for expanded detail
UX-DR8: StatusBar component — translucent floating overlay top of screen ~40px, Dark Force tally (progressively redder as approaching 25), fort count, turn number, map name, ARIA live region
UX-DR9: ControlStrip component — translucent floating overlay bottom of screen ~48px, buttons for undo, journal toggle, rules reference, settings/menu, undo disabled at turn 0
UX-DR10: DiceInput component — slides up from bottom when edge selected, translucent backdrop blur, six prominent number buttons (1-6) for manual mode, Roll button for digital mode, mode toggle switch
UX-DR11: JournalPanel component — slides up from bottom ~50% screen height on phone, map compresses but stays visible above, textarea immediately focused, turn number auto-linked, auto-save on close, previous entries visible below
UX-DR12: RulesReference component — overlay panel with contextual mode (auto-shows rule for most recent action/terrain) and browse mode (all rules by category), "Browse all rules" link to switch modes
UX-DR13: HomeView component — minimal centered layout with prominent "New Campaign" primary button, secondary "Archive" button with campaign count, Cinzel font, dark atmospheric background
UX-DR14: GameOver component — understated full-screen overlay with outcome title, map thumbnail, four stats (turns, forts, Dark Force, journal entries), "New Campaign" and "View Archive" buttons, warm gold for victory, muted tone for defeat
UX-DR15: ArchiveList component — full-screen card layout with metadata (map name, date, win/loss, turns, journal count), sorted most recent first, single-column phone, two-column desktop, warm green for wins, muted red for losses
UX-DR16: GameDetail component — full-screen view with final rendered map state (read-only), campaign stats, chronological journal entries with turn numbers
UX-DR17: Toast component — appears below status bar, auto-dismisses 3 seconds, three severity levels (info/neutral, warning/amber, error/red), escalates to persistent warning strip if retries fail
UX-DR18: Responsive three-breakpoint system — phone default (360-430px), tablet (min-width: 768px), desktop (min-width: 1024px), mobile-first CSS, SVG scales via viewBox
UX-DR19: Desktop side panel layout — journal as persistent ~30% width panel alongside hex grid (~70%), solid bars replacing translucent overlays, mouse hover states on hex cells and edge wedges
UX-DR20: TerrainIcon component — terrain type icons matching paper game visual language (mountain peak triangle, tree for forest, water waves for lake, marsh symbol, shield for muster, skull for ambush) with unreachable/active/resolved states
UX-DR21: HexCell state visual language — empty (dark slate, subtle border), claimed (warm parchment, amber border, cream numbers), selected (bright gold glow, edge wedges expand), blocked (dimmed overlay, cross-hatch, faded numbers), fort uncaptured (dashed gray, star icon), fort captured (gold tint, solid gold border, gold star)
UX-DR22: Markers use shape + color (never color alone) — army as gold circles, Dark Force as crimson rectangles, blocked as cross-hatch pattern, fort as star/shield icon (gray/gold/crossed)
UX-DR23: Reduced motion support — cascade animation respects prefers-reduced-motion, consequences appear instantly when enabled, wrapped in @media (prefers-reduced-motion: no-preference)
UX-DR24: Bookmark resume pattern — app opens directly to in-progress game with no splash screen, no welcome back modal, no intermediary navigation
UX-DR25: Overlay pattern consistency — all overlays use translucent dark background with backdrop-filter blur, slide-up on phone, side panel on desktop, only one content overlay (journal OR rules) open at a time
UX-DR26: Three-tier action hierarchy — primary (large, amber, Cinzel), secondary (outlined, subtle, Inter), tertiary (text-only, muted), never more than one primary action visible
UX-DR27: Desktop keyboard shortcuts — number keys 1-6 for dice input, Ctrl+Z for undo
UX-DR28: Focus management — focus moves to textarea when journal opens, returns to control strip on close, visible focus rings on all interactive elements
UX-DR29: Semantic HTML — proper `<button>`, `<textarea>`, `<nav>` elements, ARIA role="img" + aria-label on hex grid SVG, aria-live="polite" on status bar, aria-disabled on disabled undo

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 2 | Select map to start new game |
| FR2 | Epic 1 | View hex grid map with all features |
| FR3 | Epic 2 | Select claimed, non-blocked hex to roll from |
| FR4 | Epic 2 | Select hex edge/direction |
| FR5 | Epic 2 | Manual dice input |
| FR6 | Epic 2 | Digital dice roller |
| FR7 | Epic 2 | Place hex with correct orientation |
| FR8 | Epic 2 | Army detection across all neighbors |
| FR9 | Epic 3 | Blocked hex rules |
| FR10 | Epic 3 | Dark Force spawning |
| FR11 | Epic 3 | Dark Force escalation cascades |
| FR12 | Epic 3 | Mountain terrain interactions |
| FR13 | Epic 3 | Fort capture |
| FR14 | Epic 3 | Fort loss |
| FR15 | Epic 3 | Dark Force army tally |
| FR16 | Epic 3 | Win condition detection |
| FR17 | Epic 3 | Lose condition detection |
| FR18 | Epic 1 | Visual game state at a glance |
| FR19 | Epic 4 | Undo most recent turn |
| FR20 | Epic 4 | Rewind to any prior turn |
| FR21 | Epic 4 | Manual override after rewind |
| FR22 | Epic 2 | Turn stack history |
| FR23 | Epic 4 | Contextual rules reference |
| FR24 | Epic 4 | Browsable rules reference |
| FR25 | Epic 5 | Journal entry linked to turn |
| FR26 | Epic 5 | Journal entry linked to session |
| FR27 | Epic 5 | Text/dictation journal input |
| FR28 | Epic 5 | View journal entries during play |
| FR29 | Epic 5 | Edit/delete journal entries |
| FR30 | Epic 6 | Auto-save completed game to archive |
| FR31 | Epic 6 | Browse archive with metadata |
| FR32 | Epic 6 | View completed game final state |
| FR33 | Epic 6 | Read archived journal entries |
| FR34 | Epic 3 | Auto-save every turn |
| FR35 | Epic 3 | Resume from exact turn after close |
| FR36 | Epic 3 | See and resume unfinished game |
| FR37 | Epic 3 | New game in 2 taps or fewer |
| FR38 | Epic 7 | Install app on device |
| FR39 | Epic 7 | Full offline functionality |
| FR40 | Epic 7 | Local data persistence |
| FR41 | Epic 7 | Performance targets on mobile |
| FR42 | Epic 8 | Configure cloud storage |
| FR43 | Epic 8 | Local-only mode |
| FR44 | Epic 8 | Read/write to cloud storage |
| FR45 | Epic 8 | Detect external data changes |
| FR46 | Epic 8 | Conflict warning |
| FR47 | Epic 8 | Switch between local and cloud |

## Epic List

### Epic 1: Interactive Hex Map
Player can view the Calosanti hex grid map on any device — terrain, forts, starting point beautifully rendered and responsive. This is the foundation and the #1 technical risk (hex grid on a phone screen). Project scaffolding, design system, hex coordinate math, SVG rendering, map data digitization, and the full-bleed responsive layout all land here.
**FRs covered:** FR2, FR18
**Also addresses:** Architecture starter template, Honeycomb.js integration, design tokens (UX-DR1-4), hex cell visual language (UX-DR20-22), responsive layout (UX-DR18)

### Epic 2: Roll and Claim — The Core Turn Loop
Player can select a hex, pick a direction, roll the dice, and see a new hex placed with correct orientation and armies detected. The basic gameplay loop works. This is the tap-roll-cascade loop — the defining experience. Hex selection, expanded edge targets, dice input (manual + digital), hex placement with clockwise orientation, army detection across all neighbors, the cascade animation, turn summary, and the status bar. Game state stored as a turn stack.
**FRs covered:** FR1, FR3-FR8, FR22
**Also addresses:** Edge targets (UX-DR5), cascade animation (UX-DR6), turn summary (UX-DR7), status bar (UX-DR8), control strip (UX-DR9), dice input (UX-DR10), action hierarchy (UX-DR26)

### Epic 3: Complete Game — Dark Force, Terrain & Victory
Player can play a full game of DFI to win or loss — blocking, Dark Force spawning and escalation, mountain terrain, fort capture/loss, win/loss detection. Games auto-save and can be paused/resumed. This completes the game engine with all remaining consequence types, the Dark Force tally, mountain terrain resolution, fort mechanics, win/loss conditions, and persistence via Dexie.js.
**FRs covered:** FR9-FR17, FR34-FR37
**Also addresses:** Game over screen (UX-DR14), bookmark resume (UX-DR24), Dexie.js persistence, terrain resolver (mountain), home view (UX-DR13)

### Epic 4: Undo, Override & Rules Reference
Player can undo mistakes, rewind to any prior turn, override automated rule resolution, and access contextual or browsable rules reference. The trust-building and error-correction layer. Undo is one tap. Rewind jumps to any prior turn. After rewinding, the player can replay with their own ruling.
**FRs covered:** FR19-FR21, FR23-FR24
**Also addresses:** Rules reference component (UX-DR12)

### Epic 5: Campaign Journal
Player can capture narrative moments during gameplay via text or dictation, with entries linked to turns, viewable and editable. The creative on-ramp. Journal panel opens fast, stays out of the map's way, accepts freeform text or dictation via Aqua Voice, and closes without ceremony.
**FRs covered:** FR25-FR29
**Also addresses:** Journal panel component (UX-DR11), dictation compatibility (NFR9), focus management (UX-DR28)

### Epic 6: Campaign Archive
Player can browse completed campaigns, view final game states, and read journal entries from past games. The trophy case. Completed games auto-save to the archive with metadata. Card-based browsable list with final map state and journal entries.
**FRs covered:** FR30-FR33
**Also addresses:** Archive list (UX-DR15), game detail (UX-DR16), archive performance (NFR4)

### Epic 7: PWA & Offline Experience
App is installable on Android and desktop, works fully offline with no degradation, loads fast on mobile. Service worker with cache-first strategy, PWA manifest for installation, offline-first architecture where IndexedDB is the default.
**FRs covered:** FR38-FR41
**Also addresses:** NFR2 (3s load), NFR14 (offline-first), PWA manifest, service worker config

### Epic 8: Cross-Device Sync
Player can sync game data across devices via Google Drive or Dropbox, with conflict detection and resolution. Configure a cloud storage location, sync in the background, detect conflicts, surface clear warnings. Local-only mode by default — sync is opt-in.
**FRs covered:** FR42-FR47
**Also addresses:** NFR13 (atomic writes), NFR15-17 (sync requirements), file-per-game format, sync adapter pattern

---

## Epic 1: Interactive Hex Map

Player can view the Calosanti hex grid map on any device — terrain, forts, starting point beautifully rendered and responsive. This is the foundation and the #1 technical risk (hex grid on a phone screen).

### Story 1.1: Project Scaffolding & Design System Foundation

As a developer,
I want to initialize the project with the correct tech stack and a complete design token system,
So that all future stories build on a consistent visual and technical foundation.

**Acceptance Criteria:**

**Given** no project exists yet
**When** the project is initialized
**Then** a Svelte 5 + Vite + TypeScript project is created using `npm create vite@latest dark-force-incursion -- --template svelte-ts`
**And** `vite-plugin-pwa` is installed as a dev dependency
**And** TypeScript strict mode is enabled (`strict: true`, no `any`, no `@ts-ignore`)
**And** the project directory structure matches the architecture document (engine/, stores/, components/, persistence/, sync/, types/, maps/, data/ directories under src/)
**And** Vitest is installed and configured with a passing sample test

**Given** the project is initialized
**When** app.css is created
**Then** CSS custom properties define the complete dark atmospheric color palette (app background ~#1a1a2e, surface ~#25253e, claimed hex ~#d4a574, army gold ~#f0c040, Dark Force crimson ~#8b1a1a, mountain gray ~#6a6a7a, text cream ~#e8e0d0, accent amber ~#d4a040, and all other palette colors from UX spec)
**And** typography tokens define the dual-font system (Inter or IBM Plex Sans for data, Cinzel for headings, Crimson Text for body)
**And** Inter, Cinzel, and Crimson Text fonts are self-hosted (downloaded and served from the app's static assets, not loaded from Google Fonts CDN) to ensure offline availability
**And** spacing scale tokens are defined (4px xs, 8px sm, 16px md, 24px lg, 32px xl)
**And** animation timing tokens are defined for cascade sequence and panel transitions
**And** breakpoint tokens are defined (phone default, tablet 768px, desktop 1024px)

**Given** the design system is in place
**When** `npm run dev` is executed
**Then** the Vite dev server starts with HMR
**And** the app renders with the correct background color and font loading
**And** z-index layer tokens are defined for the 6-layer overlay stack (map base, status/control strip, dice input, journal/rules panel, toast, modal)
**And** `npm run build` produces a production build to dist/

### Story 1.2: Hex Grid Core — Coordinate System & Map Data

As a developer,
I want the axial hex coordinate system and Calosanti map data in place,
So that the hex grid can be rendered with accurate positions, terrain, and fort locations.

**Acceptance Criteria:**

**Given** the project foundation from Story 1.1 exists
**When** Honeycomb.js is installed and integrated
**Then** hexMath.ts in engine/ implements axial coordinate (q, r) operations using Honeycomb.js
**And** neighbor calculation returns all 6 adjacent hex coordinates for any given hex
**And** edge identification maps the 6 edges to the clockwise numbering mechanic (edge 0-5)
**And** all hex math functions are pure functions with no side effects

**Given** hexMath.ts is implemented
**When** unit tests are run
**Then** hexMath.test.ts contains tests for adjacency calculation, edge mapping, coordinate conversion, and boundary conditions
**And** all tests pass

**Given** hex coordinate math is working
**When** the Calosanti Region map is digitized
**Then** calosanti.ts in maps/ defines a MapDefinition with all hex positions, terrain types (mountains), fort locations, and the starting hex
**And** the map data matches the physical Calosanti map from the Mountain Map Pack PDF
**And** mapLoader.ts validates map definitions against the MapDefinition type
**And** mapRegistry.ts registers Calosanti as an available map

**Given** the types/ directory is set up
**When** type definitions are created
**Then** hex.types.ts defines HexCoord, HexState, HexEdge, and Orientation types
**And** game.types.ts defines GameSnapshot, GameAction, TurnResult, and GameStatus types
**And** terrain.types.ts defines TerrainType enum and TerrainResolver interface
**And** map.types.ts defines MapDefinition, MapHex, and FortLocation types
**And** all types use PascalCase names and follow the architecture naming conventions

### Story 1.3: Hex Grid Rendering — SVG Map with Visual States

As a player,
I want to see the Calosanti hex grid map rendered beautifully on my phone, tablet, or desktop,
So that I can view the full battlefield with terrain, forts, and hex states at a glance.

**Acceptance Criteria:**

**Given** the Calosanti map data and hex coordinate system exist
**When** the hex grid is rendered
**Then** HexGrid.svelte renders an SVG container that fills the viewport (full-bleed, Direction A layout)
**And** the SVG uses viewBox for resolution-independent scaling across all screen sizes
**And** pinch-to-zoom and drag-to-pan are functional on touch devices
**And** mouse scroll zoom and click-drag pan work on desktop

**Given** the hex grid SVG is rendering
**When** hex cells are displayed
**Then** HexCell.svelte renders each hex as a polygon with the correct visual state:
- Empty/unclaimed: dark slate fill (~#2d2d44), subtle gray border
- Claimed: warm parchment fill (~#d4a574), amber border, cream numbers 1-6 clockwise
- Blocked: dimmed overlay with cross-hatch pattern, faded numbers
- Fort uncaptured: dark slate with star/shield icon in muted gray, dashed border
- Fort captured: warm golden tint, solid gold border, gold star icon
- Fort lost: dimmed with crossed-out star icon
**And** all hex states are distinguishable without relying on color alone (shape + pattern + iconography)
**And** all text in hex cells meets WCAG AA contrast ratio (4.5:1 minimum)

**Given** terrain hexes exist on the map
**When** terrain icons are rendered
**Then** TerrainIcon.svelte displays a mountain peak triangle icon inside mountain hexes
**And** terrain icons show in muted state when no claimed hex is adjacent (unreachable)
**And** terrain icons show at full opacity when at least one claimed hex is adjacent (active)

**Given** fort hexes exist on the map
**When** fort markers are rendered
**Then** FortMarker.svelte displays a star/shield icon centered in fort hexes
**And** uncaptured forts show in muted gray
**And** BlockedOverlay.svelte renders a semi-transparent dark overlay with cross-hatch pattern

**Given** the layout is responsive
**When** viewed on phone (360-430px)
**Then** the hex grid fills the viewport with no side margins
**And** hex numbers are readable without zooming at default font size (10-12px minimum rendered)
**And** the layout leaves space for a future status bar (~40px top) and control strip (~48px bottom)
**When** viewed on tablet (768px+)
**Then** hexes scale up with more breathing room
**When** viewed on desktop (1024px+)
**Then** the hex grid takes ~70% width, leaving space for a future side panel

**Given** the hex grid is rendered with sample data
**When** the map is displayed with a mix of empty, claimed, blocked, and fort hexes
**Then** the player can distinguish all hex states at a glance
**And** the ARIA role="img" attribute with descriptive label is set on the SVG container
**And** the visual presentation matches the dark atmospheric war-table aesthetic from the UX spec

---

## Epic 2: Roll and Claim — The Core Turn Loop

Player can select a hex, pick a direction, roll the dice, and see a new hex placed with correct orientation and armies detected. The basic gameplay loop works — the tap-roll-cascade defining experience.

### Story 2.1: Game State Management & Turn Stack

As a developer,
I want the game state management layer and turn stack in place,
So that the rule engine, UI, and persistence all share a consistent, immutable game state model.

**Acceptance Criteria:**

**Given** the type definitions from Epic 1 exist
**When** Svelte stores are created
**Then** gameStore.ts manages the active game state including the turn stack, current snapshot, and game status
**And** settingsStore.ts manages app preferences (dice mode toggle: manual vs digital)
**And** viewStore.ts manages the current view with History API integration for Android back button support
**And** all stores use immutable updates — new objects produced, never mutating existing state

**Given** stores are created
**When** the turn stack is implemented
**Then** turnStack.ts in engine/ manages an array of turn entries, each containing `{ turnNumber, action: GameAction, snapshot: GameSnapshot, journalEntries: [] }`
**And** pushing a new turn appends a full snapshot (not a delta) to the stack
**And** the current game state is always the top of the stack
**And** turnStack.test.ts validates push, peek, and stack integrity operations

**Given** the turn stack exists
**When** the rule engine entry point is created
**Then** ruleEngine.ts in engine/ exports `resolveAction(state: GameSnapshot, action: GameAction): TurnResult`
**And** TurnResult is a discriminated union: `{ ok: true; snapshot: GameSnapshot; action: GameAction } | { ok: false; reason: RuleViolation }`
**And** the rule engine imports nothing from stores/, components/, persistence/, or sync/
**And** ruleEngine.ts handles hex placement and orientation as its first resolution capability
**And** ruleEngine.test.ts contains a passing test for basic hex placement

**Given** stores and engine exist
**When** gameStore dispatches an action
**Then** gameStore calls resolveAction, receives the result, pushes it onto the turn stack, and triggers reactive UI updates via Svelte's store contract

### Story 2.2: Hex Selection & Edge Targets

As a player,
I want to tap a claimed hex and see clear directional options,
So that I can choose which direction to roll toward with confidence.

**Acceptance Criteria:**

**Given** the hex grid is rendered with at least one claimed hex
**When** the player taps a claimed, non-blocked hex
**Then** the hex highlights with a distinct visual treatment (bright gold glow border)
**And** six wedge-shaped edge targets expand outward from the selected hex into surrounding space
**And** each wedge has a minimum effective tap area of 44x44px
**And** edges pointing toward unclaimed hexes or terrain are visually active (translucent amber fill)
**And** edges pointing toward already-claimed hexes or back toward the source are visually dimmed

**Given** a hex is selected with edge targets visible
**When** the player taps one of the six edge wedges
**Then** the selected edge highlights to confirm the chosen direction
**And** the target hex (where the new hex will be placed) briefly outlines to preview the destination

**Given** a hex is selected
**When** the player taps the same hex again or taps empty space on the map
**Then** the hex deselects and edge targets collapse
**And** the map returns to its default state

**Given** terrain is adjacent to the selected hex
**When** edge targets expand
**Then** a brief contextual terrain indicator appears near edges that point toward terrain (e.g., mountain peak icon near the relevant wedge)

**Given** the selected hex is at the edge of the map
**When** edge targets expand
**Then** edges pointing off the map boundary are visually dimmed but still tappable (tapping fires the appropriate rule)

### Story 2.3: Dice Input — Manual & Digital

As a player,
I want to enter my dice roll quickly via number buttons or a digital roller,
So that I can keep the gameplay rhythm flowing without friction.

**Acceptance Criteria:**

**Given** a hex edge has been selected
**When** dice input is needed
**Then** DiceInput.svelte slides up from the bottom of the screen with a translucent backdrop blur background
**And** in manual mode, six prominent number buttons (1-6) are displayed in a row, each at least 44x44px
**And** in digital mode, a single "Roll" button is displayed prominently

**Given** dice input is in manual mode
**When** the player taps a number button (1-6)
**Then** the tapped number is registered as the dice roll immediately with no confirmation step
**And** the dice input panel dismisses
**And** the roll result is passed to the rule engine for resolution

**Given** dice input is in digital mode
**When** the player taps the Roll button
**Then** DiceRoller.svelte plays a dice animation cycling through numbers
**And** the animation completes within 1 second (NFR5)
**And** the result number is displayed briefly before the cascade begins
**And** the dice input panel dismisses

**Given** dice input is displayed
**When** the player looks for a mode toggle
**Then** a small switch or toggle icon is visible to switch between manual and digital modes
**And** the selected mode persists across turns via settingsStore (last-used setting remembered)

**Given** the app is viewed on desktop (1024px+)
**When** dice input is needed
**Then** keyboard number keys 1-6 are accepted as dice input in manual mode (UX-DR27)

### Story 2.4: Hex Placement & Clockwise Orientation

As a player,
I want to see a new hex placed in my chosen direction with numbers correctly oriented,
So that the game board grows accurately with each roll.

**Acceptance Criteria:**

**Given** a hex edge is selected and a dice roll is entered
**When** the rule engine resolves the placement
**Then** a new hex is placed in the target position in the rolled direction
**And** numbers 1-6 are written clockwise inside the hex starting with the rolled number on the connecting side (the side touching the source hex)
**And** the new hex is marked as claimed with warm parchment fill and cream numbers

**Given** the placement is resolved
**When** the cascade animation plays (Beat 1)
**Then** the new hex appears in the target position with a brief animation (~200ms)
**And** numbers animate in clockwise from the connecting side
**And** if prefers-reduced-motion is enabled, the hex appears instantly without animation (UX-DR23)

**Given** no game is in progress
**When** the player wants to start a new game
**Then** a map selector is available (MVP: Calosanti only, displayed as map preview with hex grid, terrain, and forts visible)
**And** the player taps the starting hex on the map to begin
**And** the first edge targets expand from the starting hex
**And** the game is live after the first roll and placement (FR1)

**Given** a player rolls in a direction that would place a hex off the map boundary
**When** the rule engine resolves the placement
**Then** the source hex (the hex rolled FROM) is blocked — the army is lost in unknown territory
**And** this follows the same blocking behavior as mountain terrain (per Omnibus Edition p.7: "the hex you rolled from is blocked off")
**And** the rule engine checks map boundaries on every placement, not just terrain adjacency

**Given** a hex is placed
**When** the game state updates
**Then** the new turn is pushed onto the turn stack with a full snapshot and action log
**And** the hex grid re-renders reactively to show the new claimed hex

### Story 2.5: Army Detection & Status Display

As a player,
I want to see armies automatically detected and marked when matching numbers are adjacent,
So that I can track my forces growing across the battlefield.

**Acceptance Criteria:**

**Given** a new hex has been placed
**When** the rule engine checks for armies (FR8)
**Then** ALL adjacent hexes are scanned (not just the source hex)
**And** every pair of matching numbers on adjacent sides between any neighboring claimed hexes results in an army
**And** armyDetector.ts in engine/ performs this scan as a pure function
**And** armyDetector.test.ts tests single-match, multi-match, and no-match scenarios across various neighbor configurations

**Given** armies are detected
**When** the cascade animation plays (Beat 2, ~200ms after Beat 1)
**Then** ArmyMarker.svelte renders gold circle overlays on each matching number pair
**And** the army markers animate into place (or appear instantly if prefers-reduced-motion is enabled)

**Given** the turn has resolved
**When** the status display updates
**Then** StatusBar.svelte renders as a translucent floating overlay at the top of the screen (~40px)
**And** it displays the current turn number
**And** it uses a semi-transparent background with backdrop blur (UX-DR8)
**And** StatusBar has an ARIA live region for screen reader announcements

**Given** the turn has resolved
**When** the turn summary appears
**Then** TurnSummary.svelte renders a compact text strip above the control strip (e.g., "Turn 3: +1 Army")
**And** the summary persists until the next turn begins
**And** tapping the summary expands it to show full turn detail (UX-DR7)

**Given** the game view is active
**When** the control strip renders
**Then** ControlStrip.svelte renders as a translucent floating overlay at the bottom of the screen (~48px)
**And** it contains buttons for undo (disabled until Epic 4), journal toggle (disabled until Epic 5), rules reference (disabled until Epic 4), and settings/menu
**And** all buttons are at least 44x44px
**And** the control strip uses the same translucent backdrop blur treatment as the status bar (UX-DR9, UX-DR25)

---

## Epic 3: Complete Game — Dark Force, Terrain & Victory

Player can play a full game of DFI to win or loss — blocking, Dark Force spawning and escalation, mountain terrain, fort capture/loss, win/loss detection. Games auto-save and can be paused/resumed.

### Story 3.1: Blocked Hexes & Dark Force Spawning

As a player,
I want the game to enforce blocking and Dark Force spawning rules automatically,
So that the battlefield grows with real consequences and I can track the enemy threat.

**Acceptance Criteria:**

**Given** a player rolls a dice number
**When** the rolled number duplicates the number on the connecting side of the source hex (FR9)
**Then** the new hex is blocked — placed clockwise to the next available space from the rolled direction
**And** numbers are written starting with the duplicated number on the connecting side
**And** BlockedOverlay.svelte renders the cross-hatch pattern over the blocked hex
**And** no army is drawn on the blocked hex
**And** the blocked hex cannot be selected for future rolls

**Given** a new hex is placed and non-matching numbers exist between it and a neighboring claimed hex
**When** on a FUTURE turn, the player rolls from that hex and the rolled number matches one of the non-matching adjacency numbers (FR10)
**Then** a Dark Force army is spawned — DarkForceMarker.svelte renders a crimson rectangle over the two non-matching numbers
**And** Dark Force armies are NOT spawned automatically at hex placement time — they spawn only when triggered by a specific roll from that hex
**And** the Dark Force spawn animates during cascade Beat 3 (~200ms) with a brighter red flash settling to deep crimson
**And** darkForce.ts in engine/ handles spawning as a pure function
**And** darkForce.test.ts tests spawn conditions across various neighbor configurations

**Given** Dark Force armies exist on the map
**When** the StatusBar updates
**Then** the Dark Force tally is displayed (e.g., "DF 3/25")
**And** the tally color progressively shifts toward red as it approaches the limit (FR15)

**Given** the cascade resolves blocking and Dark Force
**When** the turn summary displays
**Then** it includes blocking events ("Source blocked") and Dark Force spawns ("+1 Dark Force") in the summary text

### Story 3.2: Dark Force Escalation & Cascading Consequences

As a player,
I want Dark Force escalation to resolve automatically with a clear visual sequence,
So that I can follow the cascading danger as it unfolds on the battlefield.

**Acceptance Criteria:**

**Given** a player rolls from a hex
**When** the rolled number already has a Dark Force army on it (FR11)
**Then** the escalation cascade begins:
1. Move clockwise from the rolled position — if a friendly army is there, Dark Force defeats it (army marker converts to Dark Force marker)
2. If no friendly army to defeat, move clockwise and block the first free hex AND place a Dark Force army in it
**And** each cascade step resolves sequentially with distinct visual animation
**And** multiple escalation steps can chain if the cascade encounters more Dark Force conflicts

**Given** Dark Force escalation is cascading
**When** the cascade animation plays
**Then** each defeated army animates from gold circle to crimson rectangle (~200ms per step)
**And** each newly blocked hex shows the cross-hatch overlay animating in
**And** the full cascade sequence is readable — the player can track what happened step by step
**And** if prefers-reduced-motion is enabled, all cascade steps appear instantly

**Given** escalation has resolved
**When** the turn summary displays
**Then** it details each escalation step (e.g., "Dark Force escalation: Army defeated at (2,3), Hex blocked at (3,3), +2 Dark Force")

**Given** the rule engine handles escalation
**When** darkForce.ts processes escalation
**Then** the escalation logic is a pure function that takes the current snapshot and returns the modified snapshot with all cascade results
**And** darkForce.test.ts tests single-step escalation, multi-step cascading, army defeat, hex blocking, and edge cases (escalation near map boundary)

### Story 3.3: Mountain Terrain & Fort Mechanics

As a player,
I want mountain terrain and fort capture/loss to resolve automatically,
So that the strategic landscape shapes my decisions and I can track my progress toward victory.

**Acceptance Criteria:**

**Given** a player rolls from a hex adjacent to a mountain
**When** the roll would place a hex next to a mountain space (FR12)
**Then** the source hex (the hex rolled FROM) is blocked — army lost in hazardous terrain
**And** the mountain terrain resolution animates during cascade Beat 4 (~200-400ms)
**And** mountain.ts in engine/terrain/ implements this as a pure function following the TerrainResolver interface
**And** mountain.test.ts tests mountain blocking, edge cases near map boundaries, and interactions with other consequences on the same turn

**Given** the terrain resolver strategy pattern exists
**When** mountain.ts is implemented
**Then** terrainResolver.ts dispatches to the correct terrain strategy based on TerrainType
**And** the pattern supports adding future terrain types (forest, lake, marsh, muster, ambush) without modifying the dispatcher
**And** terrainResolver.test.ts validates the dispatch mechanism

**Given** a player places an army in a fort hex
**When** a matching number creates an army on a hex that contains a fort (FR13)
**Then** the fort is captured — FortMarker updates to gold with subtle glow
**And** the fort status updates during cascade Beat 5 (~100ms)
**And** the StatusBar fort count updates (e.g., "Forts 2/7")

**Given** a fort hex is blocked before capture
**When** blocking occurs on a fort hex that has no player army (FR14)
**Then** the fort is lost — FortMarker updates to dimmed with crossed-out star
**And** the fort is permanently lost and counted against the player

**Given** a fort hex has Dark Force armies present
**When** a player places an army in that fort hex (matching number rolled)
**Then** the fort is captured — the player claims it despite Dark Force presence (per Omnibus Edition p.6-7: "You can even claim a fort if Dark Force armies are located there")

**Given** a fort has already been captured by the player
**When** that fort hex is later blocked for any reason
**Then** the fort remains captured — it is permanently yours (per Omnibus Edition p.6-7: "This fort is now yours even if it becomes blocked for some reason")
**And** the fort status does NOT revert to lost

**Given** fort mechanics are implemented
**When** fortResolver.ts processes fort status
**Then** it handles capture, loss (blocked before capture), unreachability, capture-with-DF-present, and captured-survives-blocking as pure functions
**And** fortResolver.test.ts tests capture, loss by blocking, loss by unreachability, capture with Dark Force present, and captured fort surviving later blocking

### Story 3.4: Win/Loss Detection & Game Over

As a player,
I want the game to detect when I've won or lost and present a clean summary,
So that each campaign has a satisfying conclusion and I can quickly start another.

**Acceptance Criteria:**

**Given** the player has captured more than half the forts on the map
**When** the win condition check runs after a turn (FR16)
**Then** the game ends in victory
**And** winLoss.ts in engine/ detects this condition as a pure function
**And** winLoss.test.ts tests win at exactly half+1 forts, and confirms no win at exactly half

**Given** the Dark Force army tally reaches the limit (25 for full maps, 13 for half maps)
**When** the lose condition check runs after a turn (FR17)
**Then** the game ends in defeat
**And** winLoss.test.ts tests loss at exactly the limit

**Given** all remaining uncaptured forts are blocked or unreachable
**When** the lose condition check runs after a turn (FR17)
**Then** the game ends in defeat — "All forts unreachable"
**And** winLoss.test.ts tests this condition with various blocked/unreachable configurations

**Given** a game has ended (win or loss)
**When** the game-over screen displays
**Then** GameOver.svelte renders as a full-screen overlay with understated design (UX-DR14)
**And** it shows the outcome title ("Campaign Won" or "Campaign Lost" with reason)
**And** it displays four summary stats: total turns, forts captured, Dark Force tally, journal entry count
**And** it shows a thumbnail of the final map state
**And** victory uses warm gold title text, defeat uses muted tone — same layout, same dignity
**And** "New Campaign" button (primary) and "View Archive" button (secondary) are displayed

**Given** a game has ended
**When** the player taps "New Campaign"
**Then** a new game starts within 2 taps or fewer (FR37) — map selector (or direct to Calosanti for MVP) → starting hex selection
**And** the completed game is preserved in state for archiving (Epic 6)

### Story 3.5: Persistence, Pause & Resume

As a player,
I want my game to save automatically and be there when I come back,
So that I can pick up the phone, play for a few minutes, put it down, and never worry about losing progress.

**Acceptance Criteria:**

**Given** Dexie.js is not yet installed
**When** persistence is set up
**Then** Dexie.js 4.4.2 is installed and db.ts in persistence/ creates the Dexie instance with schema definition and version migrations
**And** gameRepository.ts provides save, load, and delete operations for games
**And** the database stores complete game state including turn stack, journal entries, and metadata
**And** db.test.ts validates schema creation and migration
**And** gameRepository.test.ts tests save/load round-trip integrity

**Given** a game is in progress
**When** each turn resolves (FR34)
**Then** autoSave.ts triggers a save to IndexedDB automatically after every turn
**And** the save is invisible — no toast, no indicator, no user action required (NFR11)
**And** if a save fails, a visible warning appears via Toast.svelte (persistence errors never silently swallowed)

**Given** a player closes the app mid-game
**When** the player reopens the app later (FR35, FR36)
**Then** the app opens directly to the in-progress game with the map at the exact state when left (UX-DR24)
**And** no "restore session?" dialog, no "welcome back" screen, no splash screen
**And** the status bar shows current Dark Force tally, fort count, and turn number
**And** the last turn summary is visible for orientation

**Given** no game is in progress
**When** the player opens the app
**Then** HomeView.svelte renders with a prominent "New Campaign" button (primary, Cinzel font) and an "Archive" button (secondary) (UX-DR13)
**And** the layout is minimal and centered on a dark atmospheric background
**And** if archived games exist, the Archive button shows the campaign count

**Given** a game is completed or abandoned
**When** the player wants to start a new game (FR37)
**Then** the transition from game-over or home screen to a new game is 2 taps or fewer
**And** the previous game data remains in IndexedDB for future archiving

---

## Epic 4: Undo, Override & Rules Reference

Player can undo mistakes, rewind to any prior turn, override automated rule resolution, and access contextual or browsable rules reference. The trust-building and error-correction layer.

### Story 4.1: Undo & Rewind

As a player,
I want to undo my last turn or rewind to any prior turn,
So that I can correct mistakes and explore different strategic paths.

**Acceptance Criteria:**

**Given** at least one turn has been played
**When** the player taps the Undo button in the control strip (FR19)
**Then** the most recent turn is reverted — the turn stack pops the top entry
**And** the map renders the previous turn's snapshot
**And** the status bar (Dark Force tally, fort count, turn number) reverts to the previous state
**And** the turn summary updates to reflect the now-current turn
**And** auto-save fires with the rewound state

**Given** multiple turns have been played
**When** the player taps Undo multiple times
**Then** each tap rewinds one additional turn, in sequence
**And** the map, status bar, and turn summary update with each rewind

**Given** multiple turns have been played
**When** the player wants to jump to a specific turn (FR20)
**Then** a turn history view is accessible (e.g., via long-press on undo or a turn list in expanded turn summary)
**And** the player can select any prior turn number to rewind to
**And** the game state restores to the selected turn's snapshot
**And** all turns after the selected turn are removed from the stack

**Given** the game is at turn 0 (no turns played)
**When** the control strip renders
**Then** the Undo button is visually disabled (aria-disabled, muted styling)
**And** tapping it has no effect

**Given** the player is on desktop (1024px+)
**When** the player presses Ctrl+Z
**Then** the most recent turn is undone (same behavior as tapping the Undo button) (UX-DR27)

### Story 4.2: Player Override After Rewind

As a player,
I want to replay a turn with my own ruling after rewinding,
So that I have final authority over the rules when I disagree with the engine.

**Acceptance Criteria:**

**Given** the player has rewound to a prior turn
**When** the player selects a hex and edge and enters a roll (FR21)
**Then** the rule engine resolves the turn normally with its automated resolution
**And** the new turn is pushed onto the stack as the next turn after the rewind point
**And** any turns that were removed during rewind remain discarded

**Given** the rule engine resolves a turn after rewind
**When** the player disagrees with the resolution
**Then** the player can undo again (rewind the just-played turn)
**And** re-enter the roll with a different edge selection to achieve their intended outcome
**And** this undo-and-replay cycle can repeat until the player is satisfied

**Given** the override flow is used
**When** the player replays from a rewound state
**Then** the game continues seamlessly from the overridden turn
**And** auto-save persists the new state
**And** the turn stack integrity is maintained (no orphaned or duplicate turns)

### Story 4.3: Contextual & Browsable Rules Reference

As a player,
I want to quickly check the rules relevant to what just happened or browse all game rules,
So that I can verify the engine's resolution and learn the game mechanics in context.

**Acceptance Criteria:**

**Given** the player is in an active game
**When** the player taps the Rules Reference button in the control strip (FR23)
**Then** RulesReference.svelte opens as an overlay panel (slide-up on phone, side panel on desktop)
**And** the map remains visible behind/beside the panel (UX-DR25)
**And** the panel opens in contextual mode by default — showing the rule relevant to the most recent action or terrain type encountered

**Given** the rules reference is in contextual mode
**When** the most recent turn involved a mountain terrain interaction
**Then** the mountain terrain rule is displayed prominently with a clear, brief description
**And** if the most recent turn involved army detection, the army matching rule is shown
**And** if Dark Force spawned or escalated, the Dark Force rules are shown

**Given** the rules reference is in contextual mode
**When** the player wants to see all rules (FR24)
**Then** a "Browse all rules" link is visible at the bottom of the contextual display
**And** tapping it switches to browse mode

**Given** the rules reference is in browse mode
**When** the full rules list displays
**Then** rules are organized by category: Core Rules, Mountains, and placeholder sections for future terrain (Forests, Lakes, Marshes, Muster, Ambush)
**And** each category is tappable to expand/collapse
**And** rule descriptions are brief and clear, written in rulesContent.ts in data/

**Given** the rules reference panel is open
**When** the player taps X, swipes down (phone), or taps the map area
**Then** the panel closes and the map returns to full size
**And** opening rules reference closes the journal panel if open (only one content overlay at a time) (UX-DR25)

---

## Epic 5: Campaign Journal

Player can capture narrative moments during gameplay via text or dictation, with entries linked to turns, viewable and editable. The creative on-ramp — always available, never required, never intrusive.

### Story 5.1: Journal Entry Creation & Turn Linking

As a player,
I want to quickly capture a thought or narrative moment during gameplay,
So that I can build a story around my campaign without breaking the flow of play.

**Acceptance Criteria:**

**Given** a game is in progress
**When** the player taps the Journal button in the control strip (FR25)
**Then** JournalPanel.svelte slides up from the bottom of the screen, taking ~50% of screen height on phone (UX-DR11)
**And** the map compresses but remains visible above the panel
**And** the panel opens within 200ms (NFR3)
**And** a textarea is immediately focused and ready for input — no extra tap required
**And** opening the journal closes the rules reference panel if open (only one content overlay at a time)

**Given** the journal panel is open
**When** the player types or dictates text into the textarea (FR27)
**Then** the textarea is a standard `<textarea>` element with no custom input handling (NFR9)
**And** text from system-level dictation tools (Aqua Voice, Android voice input, iOS dictation) appears cleanly without interference
**And** the current turn number is displayed near the input area so the player knows which turn the entry will be linked to

**Given** the player has entered text
**When** the player taps "Save Entry"
**Then** the entry is saved and linked to the current turn number automatically (FR25)
**And** the textarea clears, ready for another entry if desired
**And** the saved entry appears in the list below the input area

**Given** the player wants to create a session-level entry
**When** the player creates an entry (FR26)
**Then** a toggle or option allows linking the entry to the overall session instead of a specific turn
**And** session entries are tagged distinctly from turn-specific entries

**Given** the journal panel is open
**When** the player taps X, swipes down (phone), or taps the visible map area
**Then** the panel closes within 200ms (NFR3)
**And** any unsaved text in the textarea is auto-saved as a draft entry on close
**And** the map returns to full size
**And** focus returns to the control strip (UX-DR28)

**Given** the journal panel is open
**When** previous entries exist
**Then** they are visible below the input area, scrollable, with turn numbers displayed
**And** the player can read past entries for context without leaving the panel

**Given** the app is viewed on desktop (1024px+)
**When** the journal is displayed
**Then** it renders as a persistent side panel (~30% width) alongside the hex grid (~70%) (UX-DR19)
**And** no toggle is needed to open/close — the panel is always visible on desktop

### Story 5.2: Journal Review, Edit & Delete

As a player,
I want to review, edit, and delete my journal entries,
So that I can refine my campaign narrative and correct mistakes.

**Acceptance Criteria:**

**Given** journal entries exist for the current game
**When** the player views the journal panel (FR28)
**Then** entries are displayed chronologically with turn number labels
**And** turn numbers use Inter font (data font), entry text uses Crimson Text italic (manuscript feel)
**And** each entry shows the turn number (or "Session" for session-level entries) and the entry text

**Given** the player wants to edit an entry
**When** the player taps on an existing entry (FR29)
**Then** the entry becomes editable — the text appears in the textarea for modification
**And** the player can change the text and tap "Save" to update it
**And** the turn link is preserved (editing does not change which turn the entry belongs to)

**Given** the player wants to delete an entry
**When** the player initiates a delete action on an entry (FR29)
**Then** a brief confirmation is requested (e.g., "Delete this entry?" with confirm/cancel)
**And** upon confirmation, the entry is removed from the game state
**And** the deletion persists through auto-save

**Given** the player undoes or rewinds a turn (Epic 4)
**When** the game state reverts to a prior turn
**Then** journal entries that were created on turns after the rewind point are preserved (not deleted)
**And** journal entries remain accessible regardless of the current turn position
**And** this ensures the player never loses written content through undo operations

**Given** journal entries exist
**When** the journal panel renders on any device
**Then** entries are readable and scrollable on phone, tablet, and desktop
**And** the scroll area does not interfere with the map interaction above/beside it

---

## Epic 6: Campaign Archive

Player can browse completed campaigns, view final game states, and read journal entries from past games. The trophy case — every completed game is a campaign fought, not data to manage.

### Story 6.1: Archive Save & Campaign List

As a player,
I want completed games automatically saved and browsable as a campaign archive,
So that I can look back at my campaigns and find material for writing.

**Acceptance Criteria:**

**Given** a game ends in victory or defeat
**When** the game-over screen displays (FR30)
**Then** the completed game is automatically saved to the campaign archive in IndexedDB
**And** the archived game includes the full turn stack (all snapshots), all journal entries, and metadata (map name, date, win/loss outcome, total turns, journal entry count)
**And** no user action is required to save — archiving is automatic

**Given** the player navigates to the archive
**When** ArchiveList.svelte renders (FR31)
**Then** a full-screen card layout displays all archived campaigns
**And** each card shows: map name, date played, win/loss outcome, number of turns, journal entry count (UX-DR15)
**And** cards are sorted by date, most recent first
**And** wins are displayed with warm green accent, losses with muted red — factual, not dramatic
**And** the list renders within 500ms even with 100+ saved games (NFR4)

**Given** the archive is viewed on phone
**When** the layout renders
**Then** cards display in a single-column layout
**Given** the archive is viewed on desktop (1024px+)
**When** the layout renders
**Then** cards display in a two-column layout

**Given** no archived games exist
**When** the archive view opens
**Then** the view displays "No campaigns yet." in muted centered text
**And** no illustration, no call-to-action, no nudging

**Given** the player is in the archive view
**When** the player navigates back
**Then** History API handles back navigation — Android back button or explicit back button returns to the previous view (home screen or active game)

### Story 6.2: Game Detail View

As a player,
I want to open a completed campaign and see the final battlefield with all my journal entries,
So that I can relive the campaign and mine it for writing material.

**Acceptance Criteria:**

**Given** the player is in the archive list
**When** the player taps a campaign card (FR32)
**Then** GameDetail.svelte opens as a full-screen view
**And** the final map state is rendered as a read-only hex grid at the top — all claimed hexes, blocked hexes, armies, Dark Force markers, fort statuses, and terrain visible
**And** the hex grid is not interactive (no tap selection, no edge targets) — display only

**Given** the game detail view is open
**When** campaign stats are displayed
**Then** the view shows total turns played, forts captured vs total, final Dark Force tally, and journal entry count

**Given** the game detail view is open
**When** journal entries are displayed (FR33)
**Then** all journal entries from the archived game are listed chronologically below the map and stats
**And** each entry shows its turn number (or "Session" for session-level entries) and the entry text
**And** turn numbers use Inter font, entry text uses Crimson Text italic
**And** entries are scrollable

**Given** the player is in the game detail view
**When** the player navigates back
**Then** back navigation returns to the archive list (not skipping to home)
**And** History API tracks the drill-down: Archive List → Game Detail

---

## Epic 7: PWA & Offline Experience

App is installable on Android and desktop, works fully offline with no degradation, loads fast on mobile. The "play anywhere" layer — the game lives in Taylor's pocket.

### Story 7.1: PWA Configuration & Installation

As a player,
I want to install the app on my phone and desktop like a native app,
So that I can launch it from my home screen without opening a browser and navigating to a URL.

**Acceptance Criteria:**

**Given** vite-plugin-pwa is installed (from Story 1.1)
**When** PWA configuration is completed
**Then** vite.config.ts configures vite-plugin-pwa with Workbox for service worker generation and precaching
**And** manifest.webmanifest in public/ defines app name ("Dark Force Incursion"), short name, theme color (matching the dark atmospheric palette), background color, display mode ("standalone"), and start URL

**Given** PWA icons are needed
**When** icon assets are created
**Then** public/icons/ contains PWA icons at 192x192 and 512x512 resolutions
**And** favicon.svg is present in public/
**And** manifest.webmanifest references all icon sizes

**Given** the app is served over HTTPS (or localhost for development)
**When** a player visits the app on Android Chrome (FR38)
**Then** the browser prompts for PWA installation (Add to Home Screen)
**And** once installed, the app launches in standalone mode (no browser chrome)
**And** the app icon appears on the home screen

**Given** the app is served over HTTPS
**When** a player visits the app on desktop Chrome or Firefox (FR38)
**Then** the browser offers PWA installation
**And** once installed, the app opens in its own window without browser tabs or URL bar

**Given** the app is visited on iOS Safari
**When** PWA installation is limited by Apple's platform constraints
**Then** the app functions as a capable web app on iOS Safari
**And** "Add to Home Screen" via Safari's share menu creates a home screen shortcut
**And** core functionality (gameplay, journal, archive) works correctly in Safari

### Story 7.2: Offline-First & Performance

As a player,
I want the app to work perfectly without an internet connection and load fast on my phone,
So that I can play anywhere — in the car, on a plane, in a waiting room — without worrying about connectivity.

**Acceptance Criteria:**

**Given** the service worker is configured
**When** the app is loaded for the first time
**Then** the service worker precaches the app shell and all static assets (JS, CSS, fonts, icons)
**And** subsequent loads serve from cache first, falling back to network only for uncached resources
**And** the caching strategy is cache-first for app shell and static assets

**Given** the app has been loaded at least once
**When** the player enables airplane mode or loses network connectivity (FR39)
**Then** the app loads and functions identically to the online experience
**And** full gameplay (hex selection, dice input, cascade resolution, all game mechanics) works offline
**And** journaling (create, edit, delete entries) works offline
**And** archive browsing (list, detail view) works offline
**And** auto-save to IndexedDB works offline
**And** no error messages, degraded UI, or missing features appear (NFR14)

**Given** the app is loaded on a mid-range Android phone
**When** app startup performance is measured (NFR2)
**Then** the app is fully interactive within 3 seconds of launch
**And** the hex grid is rendered and responsive to touch within that window

**Given** the app bundle needs to be optimized for mobile
**When** the production build runs
**Then** archive and game detail view components are lazy-loaded (not included in the initial bundle) (FR41)
**And** the initial bundle contains only what's needed for active gameplay
**And** tree-shaking and minification are applied via Vite's Rollup-based build

**Given** the app is installed as a PWA
**When** a new version is deployed
**Then** the service worker detects the update and refreshes the cache
**And** the player sees the updated app on next launch without manual intervention
**And** IndexedDB data (games, archive, journal entries) is preserved across updates (FR40, NFR12)

---

## Epic 8: Cross-Device Sync

Player can sync game data across devices via Google Drive or Dropbox, with conflict detection and resolution. Local-only mode by default — sync is opt-in.

### Story 8.1: Sync Configuration & Local-Only Mode

As a player,
I want to choose whether to sync my data to the cloud or keep it local,
So that I can play across devices when I want to but never be forced into cloud dependency.

**Acceptance Criteria:**

**Given** the app is launched for the first time
**When** no sync configuration exists (FR43)
**Then** the app operates in local-only mode by default
**And** all gameplay, journaling, and archiving work fully with local IndexedDB storage
**And** no sync-related prompts, errors, or indicators appear

**Given** the player opens settings
**When** sync configuration is available
**Then** the player can configure a cloud storage provider — Google Drive or Dropbox (FR42, NFR15)
**And** the OAuth flow for the selected provider authenticates the player's account
**And** upon successful authentication, the player selects or creates a folder for app data storage

**Given** sync is configured
**When** the player wants to switch modes (FR47)
**Then** a toggle in settings switches between local-only and cloud-synced storage
**And** switching to local-only does not delete cloud data — it stops syncing
**And** switching to cloud-synced triggers an initial sync of local data to the cloud

**Given** the sync adapter needs to support multiple providers
**When** the sync layer is implemented
**Then** syncAdapter.ts in sync/ defines an abstract sync interface
**And** googleDrive.ts implements the interface for Google Drive
**And** dropbox.ts implements the interface for Dropbox
**And** the abstract interface supports: read manifest, write manifest, read game file, write game file, list game files, check for external modifications

### Story 8.2: Cloud Sync — Read & Write

As a player,
I want my game data to sync to the cloud automatically in the background,
So that I can pause a game on my phone and pick it up on my tablet without manual file management.

**Acceptance Criteria:**

**Given** cloud sync is configured and active
**When** game data is written (new turn, completed game, journal entry) (FR44)
**Then** the system writes to the cloud storage using file-per-game format:
- manifest.json contains the game list, metadata, and settings
- Individual game-{id}.json files contain complete game data (turn stack, journal entries)
**And** all JSON files include a schemaVersion field for forward/backward compatibility

**Given** data is being written to the cloud
**When** a write operation occurs (NFR13)
**Then** writes use an atomic write-to-temp-then-rename pattern to prevent corruption
**And** partial writes never leave the cloud storage in an inconsistent state

**Given** sync operations are running
**When** the player is actively playing (NFR16)
**Then** all sync reads and writes happen in the background
**And** sync operations never block gameplay — the player's tap-roll-cascade loop is unaffected
**And** if a sync operation fails, it retries silently without interrupting play

**Given** the player opens the app on a second device
**When** sync is configured on both devices (FR44)
**Then** the app reads the manifest and game files from cloud storage
**And** local IndexedDB is updated with the latest data from the cloud
**And** the player sees their most recent game state, archive, and journal entries

**Given** sync is active
**When** sync status is needed
**Then** a subtle sync icon in the status bar indicates sync state (not prominent)
**And** tapping the icon shows sync status detail (last synced, pending changes)

### Story 8.3: Conflict Detection & Resolution

As a player,
I want to be warned if my data was changed on another device while I was playing,
So that I never lose work to a silent overwrite.

**Acceptance Criteria:**

**Given** sync is active on multiple devices
**When** the system detects that a cloud data file has been modified externally (by another device) (FR45)
**Then** the system reloads the current state from the cloud
**And** if no local changes conflict with the external changes, the reload happens silently

**Given** a conflict is detected (local changes AND external changes to the same data)
**When** the system identifies the conflict (FR46)
**Then** a toast warning appears: "Data changed on another device. Tap to resolve."
**And** the conflict is never silently resolved — the player always decides (NFR17)

**Given** a conflict toast is displayed
**When** the player taps to resolve
**Then** a simple choice is presented: "Keep this device" or "Use other device"
**And** no merge is attempted — one version wins entirely
**And** the losing version is discarded
**And** the winning version is synced to cloud storage

**Given** the player is offline when a conflict occurs
**When** the player comes back online
**Then** the conflict is detected on the next sync attempt
**And** the conflict warning appears at that time
**And** gameplay during the offline period is never interrupted or lost

**Given** conflict detection is implemented
**When** conflictDetector.ts processes sync state
**Then** conflicts are detected per-file (simultaneous edits to different games do not conflict)
**And** the manifest file is checked for concurrent modifications
**And** syncManifest.ts handles manifest read/write operations

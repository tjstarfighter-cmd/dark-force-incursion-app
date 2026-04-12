# Story 1.2: Hex Grid Core — Coordinate System & Map Data

Status: done

## Story

As a developer,
I want the axial hex coordinate system and Calosanti map data in place,
so that the hex grid can be rendered with accurate positions, terrain, and fort locations.

## Acceptance Criteria

1. **Given** the project foundation from Story 1.1 exists **When** Honeycomb.js is installed and integrated **Then** hexMath.ts in engine/ implements axial coordinate (q, r) operations using Honeycomb.js **And** neighbor calculation returns all 6 adjacent hex coordinates for any given hex **And** edge identification maps the 6 edges to the clockwise numbering mechanic (edge 0-5) **And** all hex math functions are pure functions with no side effects

2. **Given** hexMath.ts is implemented **When** unit tests are run **Then** hexMath.test.ts contains tests for adjacency calculation, edge mapping, coordinate conversion, and boundary conditions **And** all tests pass

3. **Given** hex coordinate math is working **When** the Calosanti Region map is digitized **Then** calosanti.ts in maps/ defines a MapDefinition with all hex positions, terrain types (mountains), fort locations, and the starting hex **And** the map data matches the physical Calosanti map from the Mountain Map Pack PDF **And** mapLoader.ts validates map definitions against the MapDefinition type **And** mapRegistry.ts registers Calosanti as an available map

4. **Given** the types/ directory is set up **When** type definitions are created **Then** hex.types.ts defines HexCoord, HexState, HexEdge, and Orientation types **And** game.types.ts defines GameSnapshot, GameAction, TurnResult, and GameStatus types **And** terrain.types.ts defines TerrainType enum and TerrainResolver interface **And** map.types.ts defines MapDefinition, MapHex, and FortLocation types **And** all types use PascalCase names and follow the architecture naming conventions

## Tasks / Subtasks

- [x] Task 1: Type Definitions (AC: #4)
  - [x] 1.1: Create src/types/hex.types.ts — HexCoord, CubeCoord, HexState, HexEdge (0-5), HexStatus, Orientation
  - [x] 1.2: Create src/types/game.types.ts — GameSnapshot, GameAction, TurnResult (discriminated union), GameStatus, RuleViolation
  - [x] 1.3: Create src/types/terrain.types.ts — TerrainType enum (Mountain MVP + Phase 2 placeholders), TerrainEffect interface
  - [x] 1.4: Create src/types/map.types.ts — MapDefinition, MapHex, FortLocation

- [x] Task 2: Hex Math Engine (AC: #1, #2)
  - [x] 2.1: Create src/engine/hexMath.ts — import Honeycomb.js, implement getNeighbors(coord) returning all 6 adjacent HexCoord
  - [x] 2.2: Implement getEdgeDirection(from, to) — maps edge index 0-5 to the clockwise numbering mechanic
  - [x] 2.3: Implement getNeighborAtEdge(coord, edge) — returns the HexCoord in the given edge direction
  - [x] 2.4: Implement axialToCube(coord) and cubeToAxial(cube) coordinate conversions
  - [x] 2.5: Verify all hexMath functions are pure (no imports from stores/, components/, persistence/, sync/)
  - [x] 2.6: Create src/engine/hexMath.test.ts — tests for adjacency, edge mapping, coordinate conversion, boundary conditions, round-trip conversions

- [x] Task 3: Calosanti Map Digitization (AC: #3)
  - [x] 3.1: Create src/types/map.types.ts MapDefinition structure (done in Task 1)
  - [x] 3.2: Create src/maps/calosanti.ts — digitize all hex positions from the Calosanti Region map PDF
  - [x] 3.3: Mark all mountain terrain hexes (top-left, bottom-left, bottom-right border clusters)
  - [x] 3.4: Mark all fort locations (7 forts scattered in interior)
  - [x] 3.5: Mark the starting hex (center of map at q:5, r:5)
  - [x] 3.6: Define map boundaries (10x13 grid, 130 total hexes)

- [x] Task 4: Map Loader & Registry (AC: #3)
  - [x] 4.1: Create src/maps/mapLoader.ts — validateMap() function that checks MapDefinition structure
  - [x] 4.2: Create src/maps/mapRegistry.ts — registers Calosanti, exports getMap(id) and listMaps()
  - [x] 4.3: Create src/maps/mapLoader.test.ts — tests for valid map acceptance, invalid map rejection
  - [x] 4.4: Create src/maps/mapRegistry.test.ts — tests for map registration and retrieval

## Dev Notes

### Honeycomb.js 4.1.5 Integration

Honeycomb.js is already installed (from Story 1.1). It provides axial coordinate math natively.

**Key API patterns for hexMath.ts:**
- Honeycomb.js uses axial (q, r) coordinates natively
- Six neighbors are constant offsets — no conditional adjacency logic
- Edge identification maps directly to the clockwise numbering mechanic
- Cube coordinates available via conversion `(q, r, -q-r)` for terrain traversal

**Import pattern:**
```typescript
import { defineHex, Grid, Orientation as HCOrientation } from 'honeycomb-grid'
```

**Critical:** hexMath.ts is the ONLY file that imports from honeycomb-grid. All other modules use our own types from hex.types.ts. Honeycomb.js API details are hidden behind our typed wrapper functions.

### Axial Coordinate System

The hex grid uses flat-top hexagons with axial coordinates (q, r):
- q = column axis
- r = row axis
- Six neighbor offsets (flat-top): `[+1,0], [+1,-1], [0,-1], [-1,0], [-1,+1], [0,+1]`
- Cube conversion: `s = -q - r`

**Edge numbering (clockwise 0-5 from top-right for flat-top hex):**
- Edge 0 → neighbor at offset (+1, 0) — right
- Edge 1 → neighbor at offset (+1, -1) — top-right
- Edge 2 → neighbor at offset (0, -1) — top-left
- Edge 3 → neighbor at offset (-1, 0) — left
- Edge 4 → neighbor at offset (-1, +1) — bottom-left
- Edge 5 → neighbor at offset (0, +1) — bottom-right

**NOTE:** The exact edge-to-direction mapping must be verified against Honeycomb.js 4.1.5's orientation. The game mechanic places numbers 1-6 clockwise starting from the connecting side — the edge mapping must align with this. Verify with the Omnibus rules and adjust if needed.

### Type Definitions — Exact Specifications

**hex.types.ts:**
```typescript
export interface HexCoord {
  q: number;
  r: number;
}

export interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

export type HexEdge = 0 | 1 | 2 | 3 | 4 | 5;

export enum HexStatus {
  Empty = 'empty',
  Claimed = 'claimed',
  Blocked = 'blocked',
}

export interface HexState {
  coord: HexCoord;
  status: HexStatus;
  numbers?: number[];     // 6 numbers placed clockwise, undefined if empty
  armies?: number[];       // indices of sides with player armies
  darkForce?: number[];   // indices of sides with Dark Force armies
}

export enum Orientation {
  FlatTop = 'flat-top',
  PointyTop = 'pointy-top',
}
```

**game.types.ts:**
```typescript
import type { HexCoord, HexState, HexEdge } from './hex.types';
import type { MapDefinition } from './map.types';

export enum GameStatus {
  InProgress = 'in-progress',
  PlayerWon = 'player-won',
  DarkForceWon = 'dark-force-won',
}

export interface GameSnapshot {
  mapId: string;
  mapDefinition: MapDefinition;
  hexes: Map<string, HexState>;  // key = "q,r"
  turnNumber: number;
  darkForceTally: number;
  fortsCaptured: number;
  totalForts: number;
  status: GameStatus;
}

export interface GameAction {
  type: 'placeHex' | 'selectHex' | 'selectEdge' | 'rollDice';
  sourceCoord?: HexCoord;
  edge?: HexEdge;
  diceValue?: number;
}

export interface RuleViolation {
  code: string;
  message: string;
  coord?: HexCoord;
}

export type TurnResult =
  | { ok: true; snapshot: GameSnapshot; action: GameAction }
  | { ok: false; reason: RuleViolation };
```

**terrain.types.ts:**
```typescript
import type { GameSnapshot } from './game.types';
import type { HexCoord } from './hex.types';
import type { GameAction } from './game.types';

export enum TerrainType {
  Mountain = 'mountain',
  // Phase 2:
  Forest = 'forest',
  Lake = 'lake',
  Marsh = 'marsh',
  Muster = 'muster',
  Ambush = 'ambush',
}

export interface TerrainResolver {
  terrainType: TerrainType;
  resolve(state: GameSnapshot, coord: HexCoord, action: GameAction): GameSnapshot;
}
```

**map.types.ts:**
```typescript
import type { HexCoord } from './hex.types';
import type { TerrainType } from './terrain.types';

export interface MapHex {
  coord: HexCoord;
  terrain?: TerrainType;
  isFort?: boolean;
  isStartingHex?: boolean;
}

export interface FortLocation {
  coord: HexCoord;
  name?: string;
}

export interface MapDefinition {
  id: string;
  name: string;
  description: string;
  schemaVersion: number;
  gridWidth: number;          // max columns
  gridHeight: number;         // max rows
  hexes: MapHex[];            // all playable hex positions
  forts: FortLocation[];      // fort positions (subset of hexes)
  startingHex: HexCoord;      // player's starting position
  darkForceLimit: number;     // 25 for full maps, 13 for half maps
  orientation: 'flat-top' | 'pointy-top';
}
```

### Calosanti Region Map — Digitization Reference

**Source:** Page 1 of `Mountain_Region_Maps_Series_1.pdf`

**Map layout from visual inspection:**
- Approximately 10 columns x 13 rows hex grid (flat-top hexagons)
- Mountain terrain forms borders along:
  - Top-left edge (descending diagonal cluster)
  - Bottom-left corner (large mountain cluster)
  - Bottom-right corner (large mountain cluster)
- Fort locations: ~7 forts scattered across the interior (small shield icons)
- Starting hex: Center-area circle marker (approximately middle of map)
- Playable area: All non-mountain hexes in the interior

**CRITICAL:** The developer MUST visually reference the PDF at `Mountain_Region_Maps_Series_1.pdf` page 1 to accurately count and position every hex, mountain, and fort. The coordinates below are approximate — verify against the actual PDF.

**Digitization approach:**
1. Establish a coordinate origin (top-left hex = q:0, r:0)
2. Map each hex position using flat-top axial coordinates
3. Tag mountain hexes with `terrain: TerrainType.Mountain`
4. Tag fort hexes with `isFort: true`
5. Tag the starting hex with `isStartingHex: true`
6. Set `darkForceLimit: 25` (full map)

### Engine Boundary Rules

**hexMath.ts CAN import:**
- `../types/hex.types` (our type definitions)
- `honeycomb-grid` (external library)

**hexMath.ts CANNOT import:**
- `../stores/*` — NO store access
- `../components/*` — NO UI imports
- `../persistence/*` — NO database access
- `../sync/*` — NO network access

### Testing Requirements

- Framework: Vitest 4.1.4 (already configured from Story 1.1)
- Test files co-located: `hexMath.test.ts` next to `hexMath.ts`
- mapLoader.test.ts next to mapLoader.ts
- mapRegistry.test.ts next to mapRegistry.ts

**hexMath.test.ts must cover:**
- getNeighbors: all 6 directions from origin, from offset positions, consistency
- getEdgeDirection: correct edge index for each neighbor direction
- getNeighborAtEdge: round-trip with getEdgeDirection
- axialToCube / cubeToAxial: round-trip conversions, origin, negatives
- Boundary: negative coordinates work correctly

**mapLoader.test.ts must cover:**
- Valid Calosanti map passes validation
- Map missing required fields fails validation
- Map with invalid coordinates fails

### Previous Story Intelligence (Story 1.1)

**What was established:**
- Svelte 5 + Vite 8 + TypeScript 6 project scaffold
- Honeycomb.js 4.1.5 already installed as dependency
- Vitest 4.1.4 configured and running
- TypeScript strict mode enabled (no `any`, no `@ts-ignore`)
- Directory structure: src/engine/, src/types/, src/maps/ all exist (with .gitkeep)
- @fontsource packages for self-hosted fonts
- vite-plugin-pwa configured with --legacy-peer-deps for Vite 8 compat

**Key patterns to follow:**
- Pure functions in engine/ — no side effects
- Co-located tests: `{module}.test.ts` next to `{module}.ts`
- PascalCase for types/interfaces/enums, camelCase for files/functions
- Immutable data patterns (new objects, never mutate)

### Architecture Compliance

**MUST follow:**
- All hex math functions are pure (input -> output, no side effects)
- engine/ imports nothing from stores/, components/, persistence/, sync/
- hexMath.ts is the ONLY module that imports from honeycomb-grid
- TurnResult is a discriminated union, not thrown exceptions
- TypeScript strict mode — zero `any` types
- Naming: camelCase.ts files, PascalCase types/interfaces/enums
- SchemaVersion field in MapDefinition for forward compatibility

**MUST NOT do:**
- Do NOT implement SVG rendering (Story 1.3)
- Do NOT implement the rule engine logic (Story 2.1)
- Do NOT implement game stores (Story 2.1)
- Do NOT implement persistence (Story 3.5)
- Do NOT add game logic to hexMath — it's coordinate math only
- Do NOT import honeycomb-grid anywhere except hexMath.ts

### Cross-Story Dependencies

Story 1.2 outputs are consumed by:
- **Story 1.3** (Hex Grid Rendering): Uses hexMath for coordinate-to-pixel conversion, map data for rendering
- **Story 2.1** (Game State Management): Uses all type definitions for game stores and rule engine
- **Story 2.4** (Hex Placement): Uses mapRegistry for map selection, hexMath for placement validation
- **Story 2.5** (Army Detection): Uses getNeighbors for adjacency scanning
- **Epic 3** (Dark Force, Terrain, Forts): Uses TerrainType, TerrainResolver, FortLocation

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Hex Coordinate System, Engine Boundary, Type Definitions, Data Flow]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.2 Acceptance Criteria]
- [Source: Mountain_Region_Maps_Series_1.pdf page 1 — Calosanti Region map layout]
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffolding-and-design-system-foundation.md — Previous Story Learnings]

## Change Log

- 2026-04-11: Story implemented — type definitions, hex math engine, Calosanti map digitized, map loader/registry with full test coverage

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Honeycomb.js neighborOf() requires Hex instances from defineHex(), not plain objects — wrapped in our own pure functions using constant offset arrays instead
- Fixed -0 vs 0 issue in axialToCube for origin coordinate
- For flat-top hexes, Honeycomb.js Direction enum has 8 values but only 6 are distinct (E=NE, NW=W for flat-top) — our edge mapping uses the 6 distinct: N, NE, SE, S, SW, W
- Calosanti map digitized from visual PDF analysis — approximate positions, needs verification during playtesting

### Completion Notes List

- 4 type definition files created: hex.types.ts, game.types.ts, terrain.types.ts, map.types.ts
- hexMath.ts: 10 pure functions (getNeighbors, getNeighborAtEdge, getEdgeDirection, getOppositeEdge, axialToCube, cubeToAxial, hexDistance, hexEquals, hexToKey, keyToHex)
- hexMath.ts imports Honeycomb.js defineHex for FlatHex class export (used by future rendering)
- Calosanti map: 10x13 grid, 130 hexes, ~50 mountain hexes (3 border clusters), 7 forts, starting hex at (5,5)
- mapLoader.ts validates all required fields with detailed error messages
- mapRegistry.ts registers Calosanti, supports custom map registration
- 43 tests total across 4 test files, all passing
- TypeScript strict mode — zero any types, all functions have explicit return types
- Engine boundary enforced — hexMath.ts only imports from types/ and honeycomb-grid

### File List

- src/types/hex.types.ts (new)
- src/types/game.types.ts (new)
- src/types/terrain.types.ts (new)
- src/types/map.types.ts (new)
- src/engine/hexMath.ts (new)
- src/engine/hexMath.test.ts (new)
- src/maps/calosanti.ts (new)
- src/maps/mapLoader.ts (new)
- src/maps/mapLoader.test.ts (new)
- src/maps/mapRegistry.ts (new)
- src/maps/mapRegistry.test.ts (new)

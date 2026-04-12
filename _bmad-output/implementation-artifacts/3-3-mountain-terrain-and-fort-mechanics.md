# Story 3.3: Mountain Terrain & Fort Mechanics

Status: done

## Story

As a player,
I want mountain terrain and fort capture/loss to resolve automatically,
So that the strategic landscape shapes my decisions and I can track my progress toward victory.

## Acceptance Criteria

1. **Given** a player rolls and the newly placed hex is adjacent to a mountain space **When** the rule engine resolves **Then** the source hex (the hex rolled FROM) is blocked — army lost in hazardous terrain **And** mountain.ts in engine/terrain/ implements this as a pure function

2. **Given** a player places an army in a fort hex **When** a matching number creates an army on a hex that contains a fort (FR13) **Then** the fort is captured — FortMarker updates to gold with glow **And** the StatusBar fort count updates (e.g., "Forts 2/7") **And** fortsCaptured increments on the snapshot

3. **Given** a fort hex is blocked before capture **When** blocking occurs on a fort hex with no player army (FR14) **Then** the fort is lost — FortMarker updates to dimmed with crossed-out star

4. **Given** a fort hex has Dark Force armies present **When** a player places an army in that fort hex **Then** the fort is captured — player claims it despite Dark Force presence

5. **Given** a fort has already been captured by the player **When** that fort hex is later blocked **Then** the fort remains captured — permanently yours

## Tasks / Subtasks

- [x] Task 1: Mountain Terrain Resolution (AC: #1)
  - [x] 1.1: Create src/engine/terrain/mountain.ts — `checkMountainBlocking(snapshot, targetCoord): boolean` — returns true if the target hex is adjacent to any mountain hex
  - [x] 1.2: In ruleEngine.ts, after placing a new hex, check if it's adjacent to a mountain → block the SOURCE hex
  - [x] 1.3: Mountain check runs AFTER normal placement but BEFORE returning — source gets blocked in the same turn
  - [x] 1.4: Create src/engine/terrain/mountain.test.ts — tests: placement adjacent to mountain blocks source, placement not adjacent to mountain doesn't block, off-map mountain doesn't count

- [x] Task 2: Fort Capture (AC: #2, #4)
  - [x] 2.1: Create src/engine/fortResolver.ts — `checkFortCapture(snapshot): FortUpdate[]` — scans all fort hexes for armies
  - [x] 2.2: A fort is captured when a claimed hex that isFort has at least one army edge
  - [x] 2.3: Increment fortsCaptured on snapshot when a fort is newly captured
  - [x] 2.4: Fort can be captured even if Dark Force armies present on the same hex
  - [x] 2.5: Add tests: fort captured by army, fort not captured without army, fort captured despite DF

- [x] Task 3: Fort Loss (AC: #3, #5)
  - [x] 3.1: In fortResolver, detect when a fort hex is blocked before having any army (fort lost)
  - [x] 3.2: A captured fort (has army) that gets blocked STAYS captured — permanently yours
  - [x] 3.3: Track lost forts so they count against the player for win/loss
  - [x] 3.4: Add tests: fort blocked before capture = lost, captured fort blocked = still captured

- [x] Task 4: Integrate into Rule Engine (AC: #1-#5)
  - [x] 4.1: After placement + army detection + dark force: check mountain blocking
  - [x] 4.2: After all resolution: check fort capture/loss
  - [x] 4.3: Update fortsCaptured on snapshot
  - [x] 4.4: Update TurnSummary to show "Fort captured!" or "Fort lost" events

- [x] Task 5: Visual Verification
  - [x] 5.1: Place hex adjacent to mountain and verify source gets blocked
  - [x] 5.2: Place army on a fort hex and verify fort turns gold
  - [x] 5.3: Verify StatusBar fort count updates
  - [x] 5.4: Block a fort before capture and verify it shows as lost

## Dev Notes

### Mountain Blocking Rule (from rulebook p.7)

"If you roll a number in a hex that is next to a mountain space, then that hex is blocked. The army has been lost in the hazardous terrain."

The source hex (rolled from) gets blocked when the NEWLY PLACED hex is adjacent to a mountain. This is the same blocking behavior as off-map (source blocked, not the new hex).

```typescript
function checkMountainBlocking(snapshot: GameSnapshot, targetCoord: HexCoord): boolean {
  const neighbors = getNeighbors(targetCoord)
  for (const neighbor of neighbors) {
    const neighborKey = hexToKey(neighbor)
    // Check map definition for mountain terrain (not hex state)
    const mapHex = snapshot.mapDefinition.hexes.find(
      h => h.coord.q === neighbor.q && h.coord.r === neighbor.r
    )
    if (mapHex?.terrain === TerrainType.Mountain) return true
  }
  return false
}
```

### Fort Capture Logic

A fort hex is a MapHex with `isFort === true`. A fort is captured when:
- The hex is Claimed (not Blocked)
- The hex has at least one army (matching number pair with a neighbor)
- Even if Dark Force armies are present

Fort capture should be checked after army detection runs.

### Fort Loss Logic

A fort is lost when:
- The hex is Blocked AND
- The hex was NEVER captured (no army was there before blocking)

A captured fort stays captured even if later blocked.

### FortsCaptured Tracking

Currently `GameSnapshot.fortsCaptured` is always 0. After army detection, scan all fort hexes to count captured ones.

### Previous Story Intelligence

- `src/types/terrain.types.ts` — TerrainType.Mountain already defined
- `src/types/map.types.ts` — MapHex.isFort, MapDefinition.forts
- `src/maps/calosanti.ts` — 7 forts defined, mountain hexes along borders
- `src/engine/ruleEngine.ts` — applyArmyDetection, applyDarkForce helpers to follow pattern
- `src/components/hex-grid/FortMarker.svelte` — already renders uncaptured/captured/lost states based on HexCell's fortStatus derived
- HexCell fortStatus logic: captured when `hexState.armies?.length > 0`, lost when blocked

### References

- [Source: Dark Force Incursion Rules Omnibus Edition 4, pages 6-7]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3 Story 3.3]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Mountain blocking: checkMountainBlocking scans neighbors of newly placed hex for mountain terrain. Source hex blocked if adjacent to mountain.
- Fort capture: countFortStatus counts forts with armies as captured. Forts with DF still capturable. Captured forts survive blocking.
- Fort loss: blocked fort without army = lost. Tracked for win/loss detection.
- Integrated into ruleEngine: mountain check after placement, fort counting on all code paths.
- 92 tests pass (3 mountain + 5 fort + existing), zero type errors.

### File List

- src/engine/terrain/mountain.ts (created — checkMountainBlocking pure function)
- src/engine/terrain/mountain.test.ts (created — 3 tests)
- src/engine/fortResolver.ts (created — countFortStatus pure function)
- src/engine/fortResolver.test.ts (created — 5 tests)
- src/engine/ruleEngine.ts (modified — mountain blocking + fort counting on all code paths)

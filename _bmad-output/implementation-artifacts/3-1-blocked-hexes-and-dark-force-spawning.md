# Story 3.1: Blocked Hexes & Dark Force Spawning

Status: done

## Story

As a player,
I want the game to enforce blocking and Dark Force spawning rules automatically,
So that the battlefield grows with real consequences and I can track the enemy threat.

## Acceptance Criteria

1. **Given** a player rolls and the exit edge leads to an already-occupied hex **When** the rule engine resolves **Then** a new BLOCKED hex is placed at the next clockwise available position from the source hex **And** numbers are written starting with the rolled number on the connecting side to the source hex **And** the blocked hex gets cross-hatch overlay, bold/red border, faded numbers **And** no army is drawn on the blocked hex **And** the blocked hex cannot be selected for future rolls **And** the source hex remains claimed (NOT blocked)

2. **Given** a player rolls from a hex **When** the rolled number exits through an edge where the source hex's number does NOT match the adjacent neighbor's number on the shared edge **Then** a Dark Force army spawns over the two non-matching numbers **And** DarkForceMarker.svelte renders a crimson rectangle over the non-matching pair **And** the Dark Force tally increments

3. **Given** Dark Force armies exist **When** StatusBar updates **Then** Dark Force tally shows "Dark Force: N/25" **And** color progressively shifts toward red as approaching limit

4. **Given** blocking or Dark Force occurs **When** turn summary displays **Then** it includes "Hex blocked" and/or "+N Dark Force" in the summary

## Tasks / Subtasks

- [x] Task 1: Blocked Hex — Clockwise Placement (AC: #1)
  - [x] 1.1: findNextClockwisePosition scans from exitEdge+1 through all 6 directions
  - [x] 1.2: Blocked hex placed with numbers oriented (rolled number on connecting side)
  - [x] 1.3: Source hex stays claimed
  - [x] 1.4: Falls back to blocking source if all positions occupied
  - [x] 1.5: Test updated: occupied target places blocked hex clockwise, source stays claimed

- [x] Task 2: Dark Force Spawning (AC: #2)
  - [x] 2.1: Created src/engine/darkForce.ts with checkDarkForceSpawn
  - [x] 2.2: Compares exit edge numbers, spawns on non-matching adjacency
  - [x] 2.3: Only checks exit edge, not all edges
  - [x] 2.4: Returns DarkForceUpdate[] for both sides
  - [x] 2.5: 5 tests: spawn, no spawn (army), no spawn (existing DF), no spawn (blocked), no spawn (no neighbor)

- [x] Task 3: Integrate into Rule Engine (AC: #1, #2)
  - [x] 3.1: applyDarkForce called after placement and after blocked hex placement
  - [x] 3.2: darkForce arrays merged into hex states
  - [x] 3.3: darkForceTally incremented per spawn
  - [x] 3.4: Army detection runs first via applyArmyDetection, then dark force

- [x] Task 4: DarkForceMarker Component (AC: #2)
  - [x] 4.1: Created DarkForceMarker.svelte — crimson rectangle spanning two positions
  - [x] 4.2: Uses var(--color-dark-force) fill
  - [x] 4.3: Rectangle shape distinct from army ellipse
  - [x] 4.4: darkForcePairs computed reactively in HexGrid, rendered after army markers

- [x] Task 5: StatusBar Dark Force Tally (AC: #3)
  - [x] 5.1: Shows "DF: N/25" format with darkForceLimit prop
  - [x] 5.2: Color interpolates from gray (#9a9080) to crimson (#8b1a1a) as tally increases

- [x] Task 6: Turn Summary Updates (AC: #4)
  - [x] 6.1: App.svelte tracks darkForceGained and hexBlocked per turn
  - [x] 6.2: TurnSummary shows "+N Dark Force" and "Hex blocked" events

- [x] Task 7: Visual Verification
  - [x] 7.1: Verified blocked hex placed clockwise when rolling into occupied hex
  - [x] 7.2: Verified Dark Force rectangles appear on non-matching adjacencies when rolling into occupied target
  - [x] 7.3: StatusBar shows DF tally (color shift functional)
  - [x] 7.4: TurnSummary shows blocking and Dark Force events

## Dev Notes

### Blocked Hex — Clockwise Placement Algorithm

When exit edge leads to occupied hex:
1. Starting from exit edge, check clockwise: edge (exitEdge+1)%6, (exitEdge+2)%6, etc.
2. For each candidate edge, check if the target position is: on-map AND empty (not claimed or blocked)
3. Place a BLOCKED hex at the first available position
4. Numbers: rolled number on the connecting side between blocked hex and source hex
5. If no position available after checking all 6 edges, block the source hex (trapped)

```typescript
function findNextClockwisePosition(sourceCoord, exitEdge, snapshot): { edge: HexEdge, coord: HexCoord } | null {
  const mapBounds = new Set(snapshot.mapDefinition.hexes.map(h => hexToKey(h.coord)))
  for (let offset = 1; offset < 6; offset++) {
    const candidateEdge = ((exitEdge + offset) % 6) as HexEdge
    const candidateCoord = getNeighborAtEdge(sourceCoord, candidateEdge)
    const candidateKey = hexToKey(candidateCoord)
    if (!mapBounds.has(candidateKey)) continue // off map
    const existing = snapshot.hexes.get(candidateKey)
    if (!existing || existing.status === HexStatus.Empty) {
      return { edge: candidateEdge, coord: candidateCoord }
    }
  }
  return null // all positions occupied or off-map
}
```

### Dark Force Spawning Logic

When rolling from hex A through exit edge E:
- Hex A has number N at edge E (N = diceValue, since that's how exit edge was determined)
- Neighbor B at edge E has number M at opposite edge
- If N === M → army (already handled by armyDetector)
- If N !== M AND no existing army/darkForce at those edges → Dark Force spawns

This is checked AFTER the new hex is placed (or blocked hex is placed). The Dark Force check is on the EXIT edge of the SOURCE hex, where the new/blocked hex was placed.

### Off-Map vs Occupied Target — Different Rules!

| Scenario | Result |
|---|---|
| Target off map | SOURCE hex blocked |
| Target occupied | New BLOCKED hex placed clockwise |
| Target is mountain | SOURCE hex blocked (Story 3.3) |

### Previous Story Intelligence

**Key files to modify:**
- `src/engine/ruleEngine.ts` — change TARGET_OCCUPIED to clockwise blocked hex placement, add dark force check
- `src/components/hex-grid/HexGrid.svelte` — add darkForcePairs rendering (same pattern as armyPairs)
- `src/components/game/StatusBar.svelte` — add darkForceLimit prop, color interpolation
- `src/components/game/TurnSummary.svelte` — add darkForceGained prop
- `src/App.svelte` — track darkForceGained per turn

### References

- [Source: Dark Force Incursion Rules Omnibus Edition 4, pages 4-7]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3 Story 3.1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Blocked hex clockwise placement: when target occupied, findNextClockwisePosition scans edges and places blocked hex at first available. Source stays claimed (different from off-map rule).
- Dark Force spawning: checkDarkForceSpawn detects non-matching adjacency at exit edge. Triggers when rolling into occupied hex with different number. 5 tests.
- DarkForceMarker: crimson rectangle spanning two hex positions (distinct from army ellipse). darkForcePairs rendered at HexGrid level.
- StatusBar: DF tally shows N/25 with color interpolation from gray to crimson.
- TurnSummary: tracks darkForceGained and hexBlocked per turn.
- Refactored ruleEngine with helper functions: applyArmyDetection, applyDarkForce, findNextClockwisePosition.
- 81 tests pass, zero type errors.

### File List

- src/engine/darkForce.ts (created — checkDarkForceSpawn, DarkForceUpdate type)
- src/engine/darkForce.test.ts (created — 5 tests)
- src/engine/ruleEngine.ts (modified — clockwise blocked hex, dark force integration, helper functions)
- src/engine/ruleEngine.test.ts (modified — TARGET_OCCUPIED test changed to clockwise behavior)
- src/components/hex-grid/DarkForceMarker.svelte (created — crimson rectangle spanning two positions)
- src/components/hex-grid/HexGrid.svelte (modified — darkForcePairs rendering)
- src/components/game/StatusBar.svelte (modified — DF N/25 with color interpolation)
- src/components/game/TurnSummary.svelte (modified — darkForceGained and hexBlocked props)
- src/App.svelte (modified — tracks dark force and blocked hex events per turn)

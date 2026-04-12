# Story 3.2: Dark Force Escalation & Cascading Consequences

Status: done

## Story

As a player,
I want Dark Force escalation to resolve automatically with a clear visual sequence,
So that I can follow the cascading danger as it unfolds on the battlefield.

## Acceptance Criteria

1. **Given** a player rolls from a hex **When** the rolled number already has a Dark Force army on it at the exit edge (FR11) **Then** the escalation cascade begins: move clockwise from the exit edge — if a friendly army is at the next edge, Dark Force defeats it (army converts to Dark Force). If no friendly army, move clockwise to the first free hex, block it, AND place a Dark Force army on the connecting numbers.

2. **Given** Dark Force escalation occurs **When** the turn resolves **Then** the Dark Force tally increments for each new Dark Force army **And** defeated armies are removed from hex state **And** blocked hexes are properly marked

3. **Given** escalation has resolved **When** the turn summary displays **Then** it details escalation events (e.g., "Dark Force escalation: Army defeated, +2 Dark Force")

4. **Given** the rule engine handles escalation **When** darkForce.ts processes escalation **Then** the escalation logic is a pure function **And** darkForce.test.ts tests single-step escalation, army defeat, hex blocking, and edge cases

## Tasks / Subtasks

- [x] Task 1: Dark Force Escalation Engine (AC: #1, #4)
  - [x] 1.1: resolveDarkForceEscalation added to darkForce.ts, returns EscalationResult or null
  - [x] 1.2: Checks if exit edge has existing DF → triggers escalation
  - [x] 1.3: Moves clockwise checking each edge for friendly army
  - [x] 1.4: Army found → remove army, add DF on both sides of the pair
  - [x] 1.5: No army → find free hex clockwise, block it, add DF on connecting edges
  - [x] 1.6: Returns armiesDefeated, hexesBlocked, darkForceSpawned counts
  - [x] 1.7: 3 tests: no escalation, army defeat, hex blocking

- [x] Task 2: Integrate Escalation into Rule Engine (AC: #1, #2)
  - [x] 2.1: Escalation check added before off-map/occupied checks in resolvePlaceHex
  - [x] 2.2: If escalation triggers, returns modified snapshot (no normal placement)
  - [x] 2.3: darkForceTally updated inside resolveDarkForceEscalation
  - [x] 2.4: Result returned via ok:true with snapshot

- [x] Task 3: Turn Summary Escalation Events (AC: #3)
  - [x] 3.1: App.svelte tracks darkForceGained via tally diff
  - [x] 3.2: TurnSummary shows "+N DF" for escalation events

- [x] Task 4: Visual Verification (AC: #1-#3)
  - [x] 4.1: Escalation triggered — army defeat and hex blocking verified
  - [x] 4.2: Dark Force tally updating correctly
  - [x] 4.3: TurnSummary shows escalation events

## Dev Notes

### Escalation Algorithm (from rulebook pages 5-6)

When rolling from hex X and the exit edge already has a Dark Force army:

```
1. Starting from exit edge, move clockwise around hex X
2. At each edge, check:
   a. Is there a friendly army? → Defeat it (remove army, place Dark Force)
   b. No army? → Continue clockwise
3. If no friendly army found on any edge:
   a. Find next clockwise FREE hex position from source
   b. Block that hex
   c. Place Dark Force army on the connecting edge between source and blocked hex
4. Increment Dark Force tally for each DF spawned
```

Key rules from the book:
- "move clockwise around that hex and if there is one of your armies cover it with a black rectangle" (defeat army)
- "if there are none of your armies to take and fill in, move clockwise around the hex and block the first free hex" (block + DF)
- "a 3,4 or 5 would see another blocked hex and Dark Force appear" — multiple DF edges on a hex mean ANY of those numbers triggers escalation

### EscalationResult Type

```typescript
export interface EscalationResult {
  snapshot: GameSnapshot
  armiesDefeated: number
  hexesBlocked: number
  darkForceSpawned: number
}
```

### When Escalation Triggers vs Normal Flow

The check order in resolvePlaceHex should be:
1. Find exit edge from rolled number
2. Check if exit edge has existing Dark Force on source hex → **ESCALATION** (no hex placement)
3. Check if target is off-map → block source
4. Check if target is occupied → blocked hex clockwise + potential new DF spawn
5. Normal placement → place hex, detect armies, check DF spawn

### Architecture

- Escalation logic stays in `darkForce.ts` as a pure function
- Rule engine calls escalation before attempting placement
- Escalation modifies the snapshot and returns it — no hex is placed during escalation turns

### Previous Story Intelligence

- `src/engine/darkForce.ts` — checkDarkForceSpawn already exists, add escalation function
- `src/engine/ruleEngine.ts` — applyDarkForce helper, need to add escalation check before placement
- HexState.darkForce and HexState.armies arrays track edge indices
- DarkForceMarker already renders at HexGrid level

### References

- [Source: Dark Force Incursion Rules Omnibus Edition 4, pages 5-6 — Escalation rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3 Story 3.2]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- resolveDarkForceEscalation: checks if exit edge has DF, moves clockwise to defeat army or block hex + spawn DF
- Integrated before normal placement in ruleEngine — escalation preempts hex placement
- 3 escalation tests added (no escalation, army defeat, hex blocking)
- 84 tests pass, zero type errors

### File List

- src/engine/darkForce.ts (modified — added resolveDarkForceEscalation, EscalationResult type)
- src/engine/darkForce.test.ts (modified — 3 escalation tests added)
- src/engine/ruleEngine.ts (modified — escalation check before placement)
- src/components/game/TurnSummary.svelte (modified — shortened DF label)

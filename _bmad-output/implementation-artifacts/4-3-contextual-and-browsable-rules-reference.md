# Story 4.3: Contextual & Browsable Rules Reference

Status: done

## Story

As a player,
I want to quickly check the rules relevant to what just happened or browse all game rules,
So that I can verify the engine's resolution and learn the game mechanics in context.

## Acceptance Criteria

1. **Rules button opens overlay:** Given the player is in an active game, when the player taps the Rules Reference button in the control strip, then RulesReference.svelte opens as an overlay panel (slide-up on phone, side panel on desktop), the map remains visible behind/beside the panel, and the panel opens in contextual mode by default.

2. **Contextual mode:** Given the rules reference is in contextual mode, when the most recent turn involved a mountain terrain interaction, then the mountain terrain rule is displayed prominently. If army detection occurred, the army rule is shown. If Dark Force spawned or escalated, the Dark Force rules are shown.

3. **Browse all rules:** Given the rules reference is in contextual mode, when the player wants to see all rules, then a "Browse all rules" link is visible, and tapping it switches to browse mode.

4. **Browse mode:** Given the rules reference is in browse mode, when the full rules list displays, then rules are organized by category (Core Rules, Mountains, and placeholder sections for future terrain), each category is tappable to expand/collapse, and rule descriptions are brief and clear, written in rulesContent.ts in data/.

5. **Close behavior:** Given the rules reference panel is open, when the player taps X, swipes down (phone), or taps the map area, then the panel closes. Opening rules reference closes the journal panel if open (only one content overlay at a time).

## Tasks / Subtasks

- [x] Task 1: Create rules content data (AC: #2, #4)
  - [x] 1.1 Create `src/data/rulesContent.ts` with rule definitions organized by category
  - [x] 1.2 Categories: Core Rules (hex placement, dice/edge, clockwise orientation, blocking), Army Detection, Dark Force (spawning, escalation), Mountains, Future Terrain (placeholders for Forests, Lakes, Marshes, Muster, Ambush)
  - [x] 1.3 Each rule: id, category, title, brief description, keywords for contextual matching
- [x] Task 2: Determine contextual rule from game state (AC: #2)
  - [x] 2.1 Create `src/engine/rulesContext.ts` — pure function that takes current + previous snapshot and returns relevant rule IDs
  - [x] 2.2 Logic: compare snapshots to detect what changed — new armies (army rule), darkForce tally increased (DF rules), hex blocked by mountain/off-map (mountain/blocking rules), normal placement (core placement rule)
  - [x] 2.3 Unit tests for each detection case
- [x] Task 3: Create RulesReference.svelte component (AC: #1, #3, #4, #5)
  - [x] 3.1 Create `src/components/rules/RulesReference.svelte`
  - [x] 3.2 Two modes: contextual (default) and browse
  - [x] 3.3 Contextual mode: show relevant rules based on passed-in rule IDs, with "Browse all rules" link at bottom
  - [x] 3.4 Browse mode: all categories listed, each tappable to expand/collapse (accordion), Cinzel headings, Crimson Text body
  - [x] 3.5 Slide-up overlay on mobile (max 60% height), positioned above control strip
  - [x] 3.6 Close button (X), backdrop click to close, Escape key to close
  - [x] 3.7 Props: contextRuleIds, onClose
- [x] Task 4: Wire Rules button in ControlStrip (AC: #1, #5)
  - [x] 4.1 Add `onRulesOpen: () => void` prop to ControlStrip
  - [x] 4.2 Enable the Rules button (remove disabled), wire onclick to onRulesOpen
  - [x] 4.3 Keep Journal and Menu buttons disabled
- [x] Task 5: Wire RulesReference into App.svelte (AC: #1, #2, #5)
  - [x] 5.1 Add showRulesReference state, track previous snapshot for contextual detection
  - [x] 5.2 Compute contextual rule IDs from current vs previous snapshot using rulesContext
  - [x] 5.3 Pass props to RulesReference, handle open/close
  - [x] 5.4 Close rules panel when journal opens (future-proof: only one overlay at a time)
  - [x] 5.5 Close rules panel on undo/rewind (clean state)

## Dev Notes

### Architecture Compliance

- **Pure function for context detection:** `rulesContext.ts` goes in `src/engine/` as a pure function — no store access, no side effects. Input: two snapshots → output: rule IDs.
- **Data in data/ folder:** `rulesContent.ts` goes in `src/data/` per architecture. Contains typed rule definitions, not component logic.
- **Overlay pattern:** Follows same pattern as TurnHistory.svelte — backdrop + panel, slide-up on mobile, Escape to close.
- **UX-DR25:** Only one content overlay at a time. Opening rules closes journal (and vice versa when journal is implemented).

### Existing Code to Build On

- **TurnHistory.svelte** — reuse the overlay/backdrop pattern, similar styling (translucent panel, close button, Escape key)
- **ControlStrip.svelte** — already refactored with props pattern from Story 4.1, just add `onRulesOpen`
- **App.svelte** — follows same wiring pattern as TurnHistory (state flag, handler functions, conditional render)
- **Design tokens in app.css** — `--color-bg-surface`, `--font-display` (Cinzel), `--font-data` (Inter), `--color-text-primary`, etc.

### Contextual Detection Logic

Compare `previousSnapshot` vs `currentSnapshot`:
- **darkForceTally increased** → show Dark Force rules (spawning + escalation)
- **new hex with armies** → show Army Detection rule
- **hex blocked (status changed to Blocked)** → show Blocking rule
- **mountain interaction** (source blocked due to mountain target) → show Mountain rule
- **normal placement** (new claimed hex) → show Core Placement rule
- **no previous snapshot** (turn 0) → show Core Placement rule as default

### Testing Approach

- **Unit tests on rulesContext.ts:** Test each detection case with crafted snapshot pairs
- **No UI component tests** — manual verification per architecture testing strategy
- **Existing 116 tests must still pass**

### Project Structure Notes

- New files: `src/data/rulesContent.ts`, `src/engine/rulesContext.ts`, `src/engine/rulesContext.test.ts`, `src/components/rules/RulesReference.svelte`
- Modified files: `src/components/game/ControlStrip.svelte`, `src/App.svelte`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4, Story 4.3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#RulesReference.svelte] — overlay, contextual+browse modes
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Layout] — slide-up phone, side panel desktop
- [Source: _bmad-output/planning-artifacts/architecture.md#FR Categories] — Rules Reference in components/rules/ + data/
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — rulesContent.ts in data/

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered.

### Completion Notes List

- Created `src/data/rulesContent.ts` — 5 categories, 12 rules (5 Core, 1 Army, 3 Dark Force, 1 Mountain, 5 Future placeholders) with RULES_BY_ID lookup map
- Created `src/engine/rulesContext.ts` — pure function comparing snapshots to detect relevant rules (DF spawning/escalation, army detection, blocking, mountain, fort capture, DF limit)
- Created `src/engine/rulesContext.test.ts` — 10 unit tests covering all detection cases
- Created `src/components/rules/RulesReference.svelte` — overlay with contextual (default) and browse modes, accordion categories, Escape to close, backdrop click, responsive layout
- ControlStrip Rules button enabled with `onRulesOpen` prop
- App.svelte tracks `previousSnapshot` for contextual detection, computes `contextRuleIds`, wires RulesReference open/close
- Rules panel closes on undo/rewind for clean state
- 132 tests pass, zero type errors, clean build

### Change Log

- 2026-04-12: Story 4.3 implemented — contextual rules reference with browse mode

### File List

- src/data/rulesContent.ts (new) — rule definitions and categories
- src/engine/rulesContext.ts (new) — contextual rule detection
- src/engine/rulesContext.test.ts (new) — 10 unit tests
- src/components/rules/RulesReference.svelte (new) — rules overlay component
- src/components/game/ControlStrip.svelte (modified) — added onRulesOpen prop, enabled Rules button
- src/App.svelte (modified) — wired RulesReference with contextual detection

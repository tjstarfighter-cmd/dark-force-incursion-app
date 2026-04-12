---
title: "Product Brief Distillate: Dark Force Incursion Companion App"
type: llm-distillate
source: "product-brief-dark-force-incursion-app.md"
created: "2026-04-10"
purpose: "Token-efficient context for downstream PRD creation"
---

# Product Brief Distillate: Dark Force Incursion Companion App

## Game Mechanics — Core Rules

- **Game type:** Solo roll-and-write conquest on hex grid maps, 1 D6, 20-40 min per session
- **Designer:** Toby Lancaster, DR Games. Copyright 2023. Omnibus Edition Version 4.
- **Core loop:** Select any claimed non-blocked hex → roll D6 → place new hex in rolled direction → write numbers 1-6 clockwise starting with rolled number on connecting side → circle matching adjacent numbers (= your army) → check consequences → repeat
- **Hex numbering:** Every hex has numbers 1-6 written clockwise inside, orientation determined by which number starts on the connecting side. This orientation is the foundational data structure.
- **Army placement:** When a new hex is placed and a number on its side matches the adjacent number on the neighboring hex, circle both — this is one of your armies
- **Important:** If any newly claimed hex results in matching numbers next to ANY adjacent hex (not just the one you came from), circle them immediately as armies
- **Rolling from any hex:** You can roll from any claimed, non-blocked hex on any turn — not just the most recently placed one. Select hex first, then roll.

## Game Mechanics — Consequences

- **Blocked hex (duplicate roll):** If you roll the same number as the side you entered from, the new hex is blocked. Place it clockwise to the next available space. Write numbers starting with the duplicated number. Bolden/outline edges. No army drawn. Cannot roll from blocked hexes.
- **Dark Force army spawn:** When a new hex is placed and a number on its side does NOT match the adjacent number on a neighboring hex, AND that non-matching number is later rolled from that hex, a Dark Force army (black rectangle) is drawn over those two non-matching numbers
- **Dark Force escalation:** If you roll a number that already has a Dark Force army on it: (1) move clockwise, if one of your armies is there, Dark Force defeats it (converts to black rectangle). (2) If no friendly army to take, move clockwise and block the first free hex AND place a Dark Force army in it. This cascading effect means rolling from a hex with Dark Force presence gets increasingly dangerous.
- **Dark Force army limit:** 25 Dark Force armies on full maps = you lose. 13 on half-size maps.
- **Fort capture:** Place an army in a fort hex by rolling a matching number. Fort is yours even if Dark Force armies are present. Fort is yours permanently even if later blocked.
- **Fort loss:** If a fort hex is blocked before you get an army there, it's lost forever. If a fort is unreachable, it's lost.
- **Win condition:** Claim more than half the forts. Full maps typically have 7 forts (need 4). Half maps have 5 forts (need 3).
- **Lose conditions:** 25 Dark Force armies appear (13 half maps) OR all remaining unclaimed forts become unreachable/blocked

## Game Mechanics — Terrain Types

### Mountains (Core)
- If a roll would place a hex next to a mountain space, the hex you rolled FROM is blocked. Army lost in hazardous terrain.
- Mountains are impassable obstacles. Never written in.

### Forests (Expansion)
- Rolling into a forest: do NOT move into the forest. Instead, count clockwise along the forest outline by the number rolled. Place new hex where you emerge.
- Joined forest hexes are treated as one contiguous forest for counting purposes.
- Number rolled is written against the forest side in the new hex. Numbers continue clockwise.
- No army is drawn when emerging from a forest.
- Can claim a fort if you emerge onto one.
- Exception: if rolling 1 doesn't take you out of current hex, bump clockwise to next available.
- If no free hex at emergence point, army lost, source hex blocked.
- If count goes off map edge, army lost, source hex blocked.
- If count ends on another land type (marsh, lake), army lost, source hex blocked.
- Dark Force armies never emerge from forests.

### Lakes (Expansion)
- Rolling into a lake: army sails straight across to the exact opposite side.
- Can cross multiple connected lake hexes in a straight line.
- Number rolled is placed on the immediate side of the new hex.
- Can claim a fort if you land on one across the lake.
- If no free hex on opposite bank, army drowned, source hex blocked.
- If crossing goes off map edge, army drowned, source hex blocked.
- If opposite side is another land type (marsh, forest), army lost, source hex blocked.
- Dark Force armies never emerge from lakes.

### Marshes (Expansion)
- Rolling into a marsh: you do NOT enter. Instead, the next available hex clockwise along the marsh edge is blocked and marked with "M". Marsh spreads unpredictably.
- Rolling into marsh again from same hex: marsh placed further around the edge. The rolled number is placed against the first available edge of the established marsh.
- Forts are skipped when placing marsh blocks (forts are on high ground, unaffected).
- If no free hexes available, source hex blocked. No "M" written.
- If count goes off map edge, army lost, source hex blocked.
- If count ends on another land type, army lost, source hex blocked.
- Marshes are the hardest terrain — they can take over large map areas.

### Muster Hexes (Expansion)
- Rolling into a muster hex: move in, write numbers, THEN claim 3 additional adjacent hexes of your choice with armies.
- Represents a sudden influx of troops. Major positive event.
- Cannot claim hexes with land features (mountains, forests, marshes, lakes).
- Land features near the muster strike tiles have no effect on them.
- If fewer than 3 free adjacent hexes, claim what you can. Must be directly adjacent (one level only).
- Muster effect triggers once. Can roll from muster hex normally on subsequent turns.

### Ambush Hexes (Expansion)
- Rolling into an ambush hex: move in, write numbers, THEN Dark Force defeats your last 2 armies.
- The ambushed armies are converted to Dark Force (black rectangles). Includes armies over land features like lakes.
- Major negative event. Contributes to Dark Force army count.
- Ambush effect triggers once. Can roll from ambush hex normally on subsequent turns.

### Reindeer Hexes (Snow Maps Expansion)
- Occupying a reindeer hex: add or subtract 1 or 2 from any movement roll made from that hex.
- Must keep within 1-6 range.
- Snow maps: igloos replace forts, mountains are snow-covered. Only mountain terrain + reindeer.
- Compatible with core rules only (no forest/lake/marsh needed).

## Official Alternative Rules

1. **Dronak's Luck Mitigating Rule:** If 3+ adjacent hexes are claimed around the hex you're rolling from, you may add or subtract 1 from the rolled number. Represents army knowing the lay of the land.
2. **Mann's Extended Fort Vision Rule:** From a claimed fort, instead of rolling, choose any free adjacent tile and write numbers as if you had rolled and landed there. Lookouts posted on fort towers.
3. **Nero's Strategy General Rule:** Place a separate die starting at 6 beside the map. Spend 1 point to turn it down and re-roll your army move. When it reaches zero, the general has died. 6 re-rolls maximum per game.
4. **Grieger Advantage Rule:** At game start, place groups of escaped prisoners 3 hexes away from chosen forts (placed via 3 sequential rolls). If you claim a prisoner hex during play, choose your next hex freely. Number of groups set by die roll or difficulty choice.
5. **Belina Block Breaker Rule:** If a claimed tile is adjacent to 2 blocked tiles and has a higher total of numbers adjacent to those blocked tiles' sides, you can unblock one. Spies have infiltrated the area.

Note: Alternative rules focus on modifying core rules, not expansion rules.

## Map Inventory

### Owned Map Packs
| Pack | Maps | Terrain Required | Notes |
|------|------|-----------------|-------|
| Core Mountain Map Pack Series 1 | 5 maps (Calosanti, Biliton, Tolantus, Borkana, Shalmista) | Mountains only (core) | Included in Omnibus Edition |
| Expansion Map Pack 1 | 10 maps (Camrich, Neotts, Barford, Iverton, Elatain, Abbots, Begwary, Honeydon, Colmworth, Offord) | Full range — all expansions | Series 1 (5 maps) + Series 2 (5 maps) |
| Mountain Region Maps Series 1 | Multiple maps | Mountains only | Image-only PDF, no extractable text |
| Snow Field Maps | 8 maps (Series 1: 4, Series 2: 4) | Mountains + Reindeer | Winter theme, igloos replace forts |
| Wasteland Maps | 6 maps (Series 1: 3, Series 2: 3) | Forests + Muster/Ambush required | Post-apocalyptic reskin |

### Map Digitization Requirement
- Maps exist as images in PDFs — they must be manually converted to structured data (hex positions, terrain type per hex, fort locations, starting point, reindeer hex locations)
- Mountain Region Maps PDF is entirely image-based with no extractable text
- This is non-trivial build work that should be scoped per map pack, not assumed as background effort
- MVP targets: 5 core Mountain Map Pack maps only (simplest — mountains + forts + start point)

## Technical Context

### Platform Decision: PWA
- Progressive Web App — single codebase, runs on phone/tablet/desktop, installable, works offline
- Zero cost (no app store fees, no hosting costs beyond free static hosting)
- Offline-first is an explicit engineering requirement, not an automatic PWA feature — needs service worker caching strategy and IndexedDB for local data

### Hex Grid Rendering
- **Honeycomb.js** — purpose-built hex grid library for browser/Node, well-maintained, best fit
- Alternative options: Phaser (full game framework, overkill), Hex Engine (TypeScript 2D engine), jQuery Hex Grid Widget (minimal prototyping)
- **Critical risk:** Hex grid on mobile — 6 numbers per hex cell on a phone screen. Touch targets and legibility must be prototyped on a real device before committing to other features.

### Dice Input — Three Tiers
1. **Physical dice + camera reads it** (stretch goal) — no turnkey browser solution exists. Would require TensorFlow.js with a trained model or OpenCV.js. Roboflow dice dataset available for training. Single D6 is tractable but non-trivial.
2. **Physical dice + manual entry** (MVP default) — tap the number after rolling. Must be fast and low-friction — prominent buttons, no modals.
3. **Digital dice** (on-the-go fallback) — animated roll in app. For when physical dice aren't available.

### Dictation / Voice Input
- Taylor uses **Aqua Voice** ($100/year plan, 6 months of good success). Previously tried Dragon NaturallySpeaking without success.
- App does NOT need built-in speech-to-text. Aqua Voice operates at the system/browser level and feeds text into standard input fields.
- App just needs clean text input areas that work well with external dictation tools.
- Plain text keyboard input as fallback when Aqua Voice is unavailable.

### Data Storage
- Campaign data stored locally in IndexedDB
- Must include explicit backup/export capability to prevent data loss from browser clears or device changes
- Save state needs to capture: complete hex grid state (every hex with position, numbers, orientation, terrain, army status, blocked status), fort status, Dark Force army count, turn history, journal entries linked to turns

### Content Creation Context
- Taylor plans to use OBS for recording let's-play content — app UI is the visual centerpiece
- UI needs to look good at 1080p OBS capture (legible hex numbers, clean layout, good contrast)
- Dice camera feed could be in-app viewport OR separate OBS source — both options should be supported
- Taylor is new to both OBS and camera integration — features should guide, not assume expertise
- Journal narration via Aqua Voice doubles as both journaling AND voiceover for recordings
- Export path: journal entries → Google Docs → blog posts / short stories

## User Profile

- **Taylor** — intermediate developer, aspiring writer, solo game hobbyist
- Prefers dictation over typing (speed bottleneck)
- Enjoys physical dice rolling — tactile experience matters
- Wants to review past game sessions — game history/replay is important
- Content creation goals: let's-play recordings, blog posts, short stories in play-report format
- Budget: zero. All tools must be free/open-source.
- This stays personal — no commercial ambitions

## Scope Signals

- **MVP terrain priority if slicing is needed:** Mountains first (simplest, core-only), then forests (most mechanically interesting), then lakes, then muster/ambush (paired), then marshes (most complex, least fun per the rules)
- **Minimum playable slice is a floor, not a ceiling** — if core engine comes together fast, keep layering features without waiting for formal milestones
- **Map editor/randomizer is deferred but desired** — not MVP, not V2, but a future vision feature for when existing maps feel stale. Includes randomizer, creator, exporter, importer.
- **Camera dice reading is a stretch goal** — technically the hardest feature, defer until core gameplay is solid

## Rejected Ideas / Decisions Made

- **No built-in speech-to-text** — Aqua Voice handles this externally, no need to duplicate
- **No multiplayer** — solo game, personal use, no networking needed
- **No AI narrative generation** — Taylor wants to write the stories, not have them generated
- **No app store distribution** — PWA avoids fees and friction entirely
- **No video recording in-app** — OBS handles recording externally, app is the visual source
- **No commercial distribution** — this is a personal hobby project, full stop

## Open Questions for PRD Phase

- What hex coordinate system (axial, cube, offset) best fits the game's clockwise numbering mechanic?
- Does the app enforce all rules automatically (preventing illegal moves) or assist (flagging/suggesting)? Brief says "enforces" but edge cases may need player judgment.
- What is the exact save state schema? Which fields constitute a complete, restorable game?
- How are journal entries linked to game state — per turn, per action, or freeform with timestamp?
- How should the UI adapt between "companion to physical play" mode (less info density, dice camera) and "standalone digital game" mode (full controls, digital dice)?
- What is the visual design target for the hex grid? Minimum hex cell size at 1080p, font size for in-hex numbers, color palette?
- How will PDF maps be digitized? Manual data entry per map? Semi-automated extraction from images?

---
title: "Product Brief: Dark Force Incursion Companion App"
status: "complete"
created: "2026-04-10"
updated: "2026-04-10"
inputs:
  - "Dark_Force_Incursion_Rules_Omnibus_Edition_4.pdf"
  - "Dark_Force_Incursion_Rules_Map_Pack_1.pdf"
  - "SnowFieldMapsReindeerRules.pdf"
  - "WastelandMapsSeries12.pdf"
  - "Mountain_Region_Maps_Series_1.pdf"
---

# Product Brief: Dark Force Incursion Companion App

## Executive Summary

Dark Force Incursion (DFI) is a solo roll-and-write conquest game played on hex grid maps with a single D6, a pencil, and printed maps. The game is elegant in design — roll, place numbered hexes, build armies, recapture forts from an invading Dark Force — but the bookkeeping is relentless. Tracking hex orientations, army positions, Dark Force counts, fort status, terrain interactions, and blocking rules across a full-sized map demands constant attention to mechanical state, pulling focus from the strategic decisions and narrative moments that make the game satisfying.

This companion app brings the hex map to life on screen while preserving what makes the physical game special. It renders the game state visually, handles the bookkeeping automatically, and opens the door to something pen and paper can't offer: a living history of every campaign fought, narrated in the player's own voice, and ready to become a blog post, a short story, or a let's-play recording.

The app is a personal tool — built for one player, funded at zero cost, designed to run anywhere there's a screen. As a Progressive Web App, it installs on any device Taylor already owns with no app store friction, works offline at a table or in a parked car, and runs identically on phone, tablet, and desktop. When there's a table and dice, it's a visual companion. When there's only a phone, it's the whole game.

Solo play isn't a consolation prize for not having a group — it's a legitimate, rewarding hobby mode. This app creates a dedicated space for that hobby: lowering the activation energy of sitting down to play, capturing the story as it unfolds, and building a personal archive of every campaign fought.

## The Problem

Playing DFI on paper means managing a surprising amount of state by hand. Every hex contains six numbers in a specific clockwise orientation. Every adjacent pair of hexes can trigger army placement, Dark Force spawns, or blocking — and the consequences cascade. Add terrain expansions (forests, lakes, marshes, muster points, ambush zones) and the mental overhead grows. A 30-minute game can feel like an accounting exercise if you lose track of the Dark Force army tally or forget which forts are still reachable.

The practical barrier is just as real: you need a printed map, a pencil, a die, and a flat surface. That rules out the waiting room, the car, the couch. Every session produces a paper map that gets filed or discarded — there's no easy way to revisit past campaigns, track improvement over time, or share the story of a dramatic comeback.

For a player who is also an aspiring writer and content creator, the richest moments of the game — the desperate gamble on a fort, the army lost in the mountains — evaporate unless you stop to write them down, breaking the flow of play.

## The Solution

A Progressive Web App (PWA) that serves three roles:

**1. Game Engine — The Hex Map Comes Alive**
An interactive hex grid that builds out visually as the player progresses. Select a hex, input your dice roll (physical die by default, digital toggle for on-the-go), and the app enforces the rules automatically: number placement and orientation, army marking, Dark Force spawning, blocking resolution, terrain interactions, fort status tracking, and the Dark Force army tally. Win/loss conditions are detected automatically.

The game engine supports:
- **Core rules:** Hex placement, clockwise number orientation, army pairs (circled matching numbers), blocked hexes (duplicate rolls), Dark Force army spawning (non-matching adjacent numbers), cascading Dark Force effects, fort capture and loss
- **Terrain — Mountains:** Rolling into a mountain blocks the source hex (army lost in hazardous terrain)
- **Terrain — Forests:** Army enters forest and emerges clockwise along the forest edge by the rolled number
- **Terrain — Lakes:** Army sails straight across to the opposite bank
- **Terrain — Marshes:** Next hex clockwise along marsh edge is blocked and marked; marshes spread unpredictably
- **Terrain — Muster hexes:** Move in and claim three additional adjacent hexes (troop reinforcement)
- **Terrain — Ambush hexes:** Move in but lose your last two armies to the Dark Force
- **Edge of map:** Rolling off the edge blocks the source hex

The map should look beautiful — this is the visual centerpiece for both play and recording.

**2. Campaign Journal — Your Story, Your Voice**
A creative writing sandbox, not just a game log. The player narrates their campaign via dictation (using their existing Aqua Voice setup, with plain text input as fallback). Notes can be captured during play as real-time play-by-play or after sessions as reflective entries. Each journal entry is linked to the game turn it was created on, preserving the connection between narrative and game state. Entries can be exported for development into short stories or blog posts — the journal is first-draft story material, not just record-keeping.

**3. Campaign Archive — Every Battle Remembered**
Every completed game is saved with its full state history. The player can browse past campaigns, replay the map building out turn by turn, reread journal entries, and compare outcomes across sessions. This is the foundation for content creation — a recorded campaign with journal narration is a let's-play waiting to happen, a session recap ready to be shared.

Campaign data is stored locally (IndexedDB) with explicit backup/export capability to prevent data loss from browser resets or device changes.

**Camera Dice Reading (Stretch Goal):** When a camera is available, the app can read a physical D6 roll visually, eliminating the need to manually enter the number. Single D6 on a contrasting surface is a tractable computer vision problem. This feature is optional — manual entry and digital dice work without it.

## What Makes This Different

Nothing like this exists. The solo roll-and-write companion space is essentially empty. Virtual tabletops like Roll20 are built for multiplayer RPGs and are wildly overbuilt for a solo hex game. Generic hex map tools don't know DFI's rules. The closest alternatives are paper and pencil — which is what the app replaces.

The real differentiator is the integration of the three layers: gameplay, narrative, and archive aren't separate apps bolted together. The journal knows the game state. The archive preserves both. The map is visually compelling enough to be the centerpiece of a recording. This tight coupling is what makes the app more than a digital worksheet.

## Who This Serves

**Primary user: Taylor.** A solo player who loves the game and wants a dedicated space for the hobby — playable anywhere, with less bookkeeping friction. An aspiring writer who wants to capture the narrative of each campaign as first-draft story material without breaking flow. A budding content creator exploring let's-play recordings and play-report blog posts.

**Secondary users: Family members** who might pick up the game using the app as an easier entry point than paper.

## Success Criteria

- **Playing more often:** DFI sessions increase because the app removes the "need a table and printed map" barrier
- **Journal entries exist:** Campaigns produce narrative artifacts — dictated notes, exportable text — that didn't exist before
- **Past games are revisitable:** The archive has multiple saved campaigns that can be browsed and replayed
- **Content output:** At least one blog post or play report written from app-captured journal entries
- **The map looks good on screen:** The hex grid is visually satisfying and legible when captured via OBS at 1080p

## Scope

### Minimum Playable Slice (First Milestone)
The smallest version that delivers a real, playable game — validates the hex grid UX (especially on mobile) and gets Taylor playing before the full MVP is complete. This is a starting floor, not a ceiling — if the core engine comes together quickly, additional terrain and features layer on incrementally without waiting for a formal MVP milestone.
- Interactive hex grid with core rules only (placement, orientation, armies, Dark Force, blocking, forts)
- Mountain terrain only (the simplest terrain type)
- One map (Calosanti Region from the core Mountain Map Pack)
- Manual dice entry + digital dice toggle
- Dark Force army tally and win/loss detection
- No journaling, no archive — just play

### MVP (Full First Version)
Everything in the minimum playable slice, plus:
- All terrain expansions: forests, lakes, marshes, muster, ambush
- All five core Mountain Map Pack maps (Calosanti, Biliton, Tolantus, Borkana, Shalmista)
- Basic journaling (text input per turn or per session, linked to game state)
- Campaign save and browse (archive of past games with full state history)
- Offline-first: explicit service worker caching and IndexedDB persistence for the "phone in the car" scenario
- PWA: installable, works on phone/tablet/desktop

### V2 (Future Enhancements)
- Reindeer expansion rules (snow maps with igloos replacing forts)
- Five official alternative rules (Dronak's, Mann's, Nero's, Grieger, Belina)
- Additional map packs (Expansion Pack 1, Wasteland, Snow Fields, Mountain Region Series)
- Export journal to Google Docs
- Campaign replay (step through a past game turn by turn visually)
- OBS-friendly UI layout options
- Camera-based D6 reading
- Campaign data backup/restore

### Future Vision Features
- **Map randomizer/creator:** When the existing maps feel stale, a tool to randomly generate new hex maps with configurable terrain, fort counts, and difficulty. Includes export and import so custom maps can be saved and shared.
- **Map editor:** A visual editor for hand-crafting custom hex maps, placing terrain, forts, and starting positions. Pairs with the randomizer for fine-tuning generated maps.

### Out of Scope
- Multiplayer or networked features
- Commercial distribution or app store listing
- AI-generated narrative or opponent
- Video recording or editing within the app (OBS handles this externally)

## Key Risks

- **Hex grid on mobile:** Six numbers per hex on a phone screen is tight. Touch targets and legibility must be validated early with a real prototype on a real phone before committing to other features.
- **Map digitization:** Physical PDF hex maps must be converted to structured digital data (hex positions, terrain types, fort locations, starting points). This is invisible but necessary build work.
- **Offline capability:** PWA offline mode requires deliberate service worker and storage strategy — it does not happen automatically.
- **Scope creep:** This is a hobby project. Motivation depends on reaching playable milestones quickly. The minimum playable slice exists specifically to ensure the first win comes fast.

## Vision

This app makes DFI a game that lives in Taylor's pocket — playable anywhere, narrated in real time, and archived forever. Each campaign becomes a story that can be revisited, refined, and shared. The hex grid engine and campaign archive are built as clean, separable layers — so when the next solo game catches Taylor's eye, the bones are ready to support it without starting from scratch. It stays personal, stays free, and stays fun.

---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
classification:
  projectType: Web App (PWA)
  domain: General / Personal Hobby Tool
  complexity: Low-Medium
  projectContext: greenfield
inputDocuments:
  - product-brief-dark-force-incursion-app.md
  - product-brief-dark-force-incursion-app-distillate.md
documentCounts:
  briefs: 2
  research: 0
  brainstorming: 0
  projectDocs: 0
workflowType: 'prd'
---

# Product Requirements Document - Dark Force Incursion Companion App

**Author:** Taylor
**Date:** 2026-04-10

## Executive Summary

Dark Force Incursion (DFI) is a solo roll-and-write conquest game played on hex grid maps with a single D6. The game's strategic depth is satisfying — roll, place numbered hexes, build armies, recapture forts from an invading Dark Force — but the logistics of playing are prohibitive. A session requires a printed map, a pencil, a flat surface, and enough mental bandwidth to track hex orientations, army positions, Dark Force tallies, terrain interactions, and fort status by hand. The result: a game that sounds fun stays in the drawer because the setup cost exceeds the available motivation.

This companion app is a Progressive Web App that eliminates that barrier entirely. It renders the hex map interactively, enforces the rules automatically, and runs on any device Taylor already owns — phone, tablet, or desktop. No printed maps. No pencil. No table. The game becomes as easy to pick up as opening YouTube: tap, play for 15 minutes on the couch, pause, come back three days later on a different device. The real competitor isn't other game apps — it's the doomscrolling that currently fills that idle screen time.

The app serves three integrated layers that grow with the player. The game engine is the foundation — a visual hex grid that handles all bookkeeping and makes DFI playable anywhere with just a phone and a die. The campaign journal is an on-ramp to creative writing — low-pressure, dictation-friendly (via Aqua Voice), available when the moment strikes but never required. The campaign archive preserves every game for replay and review, and provides raw material for future content creation (blog posts, let's-play recordings, short stories). These layers are integrated but not coupled: the game engine delivers full value on its own, and journaling and archiving layer on when the player is ready.

This is a personal tool — built for one player, funded at zero cost, designed to make a rewarding hobby accessible in the cracks of daily life.

### What Makes This Special

Nothing like this exists. The solo roll-and-write companion space is empty. Virtual tabletops are built for multiplayer RPGs. Generic hex tools don't know DFI's rules. The closest alternative is paper — which is exactly what this replaces.

The core insight: the barrier to playing DFI isn't the game's complexity — it's the logistics of playing. Eliminate setup, enable pause/resume across devices, and the game fits into the life Taylor already lives. The app doesn't ask Taylor to carve out dedicated gaming time. It fills time Taylor is already spending on a screen with something more rewarding than scrolling.

The journal integration adds a second dimension: a frictionless path from "I play this game" to "I write about this game." Aqua Voice dictation turns gameplay moments into first-draft story material without stopping play. The aspiration isn't to be a writer's tool on day one — it's to be the context that makes practicing creative output feel natural.

## Project Classification

- **Project Type:** Progressive Web App (single-page application, installable, offline-capable)
- **Domain:** Personal hobby tool (solo tabletop gaming companion)
- **Complexity:** Low-Medium (hex grid rendering and rule engine carry real technical complexity; zero regulatory, multi-tenant, or scaling concerns)
- **Project Context:** Greenfield (no existing codebase)

## Out of Scope

- Multiplayer or networked features — this is a solo game, personal use
- Commercial distribution or app store listing — PWA avoids fees and friction
- AI-generated narrative or opponent — Taylor writes the stories, not the app
- Video recording or editing within the app — OBS handles recording externally
- Built-in speech-to-text — Aqua Voice operates at the system level and feeds text into standard input fields; the app does not need its own voice recognition

## Success Criteria

### User Success

- **Playing frequency maintained or increased:** Taylor plays DFI 3-4+ times per week, matching or exceeding current paper frequency, with sessions now possible in locations previously unavailable (couch, car, bed, waiting rooms)
- **Zero-setup play:** Time from "I want to play" to "I'm playing" is under 30 seconds — open app, tap new game or resume, roll
- **Journal habit initiated:** Taylor is dictating journal entries during or after at least some sessions — not every session, but the habit is forming. The on-ramp exists and feels natural enough to use
- **Creative material accumulating:** After one month of use, Taylor has a growing archive of journal entries that could serve as raw material for blog posts, short stories, or play reports
- **The app feels good to use:** The hex grid is visually satisfying on every screen size. Taylor *wants* to look at it. Polish is intrinsic, not just for an audience

### Business Success

Not applicable in the traditional sense. This is a zero-budget personal project with no revenue, user acquisition, or growth targets. "Business success" means: Taylor is still using the app after 3 months, and the app has replaced paper as the default way to play DFI. If the app collects dust after the initial novelty, it failed.

### Technical Success

- **Offline-first reliability:** The app works without an internet connection with no degradation — full gameplay, journaling, and archive browsing available offline
- **Responsive on mobile:** Touch interactions on the hex grid feel immediate. No lag on tap, no sluggish scrolling, no input delays. The phone experience is first-class, not a scaled-down desktop afterthought
- **Archive integrity:** Losing a single in-progress game to a crash or browser clear is tolerable. Losing the full campaign archive (months of completed games and journal entries) is unacceptable. Backup/export must protect against catastrophic data loss
- **Cross-device continuity:** A game paused on the phone can be resumed on the tablet or desktop via cloud storage sync
- **Fast load:** The app loads and is interactive in under 3 seconds, even on a mid-range phone

### Measurable Outcomes

- Taylor plays DFI on the app 3-4+ times per week within the first two weeks of launch
- At least one journal entry exists within the first week
- The campaign archive contains 10+ completed games within the first month
- Zero archive-level data loss incidents
- App is installable and fully functional offline on Android phone, tablet, and desktop browser

## User Journeys

### Journey 1: The Couch Session — Taylor Plays a Quick Game

Taylor sits down on the couch to watch the newest Digimon episode. Phone in hand, no dice nearby. He taps open the app and starts a new game — continuing the narrative thread from a previous campaign. Eren, his army commander, has moved to a new region to continue the fight against the Dark Force.

He selects a map, taps the starting hex, chooses an edge, and taps the digital dice roller. It rolls a 6. The app places a new hex off the selected edge, orients the numbers correctly with 6 on the connecting side, and displays the result. Taylor glances up at the TV, glances back down, taps the next hex edge, rolls again. Each interaction takes a few seconds — tap, roll, see result, glance at TV, repeat.

A few turns in, he pops open the journal, taps record, and dictates a quick note: "Eren takes a new step into the Calosanti region to continue the fight against the forces. Starting on the northwest corner of the map." He closes the journal and keeps playing.

Midway through, bad rolls block off a fort. He opens the journal again, dictates "The fort was unable to be captured — supply lines cut off by enemy forces," and moves on. Two journal entries, neither longer than a sentence or two.

The episode ends. Taylor is 60% through the game. He keeps playing — the game has its hooks in. Fifteen minutes later, he wins, saves, and puts the phone down.

**What this journey demands:** Atomic interactions (tap-roll-result in seconds). Journal that opens fast, accepts a quick dictation, and closes without disrupting game flow. Digital dice as a first-class input. No sustained attention required — the app works in 40-second glances between TV scenes.

### Journey 2: The Parking Lot Resume — Taylor Picks Up Where He Left Off

Two days later. Taylor is in his air-conditioned car, waiting 30 minutes while a family member is at a doctor's appointment. Podcast on the radio. He opens the app on his phone.

The app shows his unfinished game. He looks at the hex map — claimed hexes, blocked hexes, forts, Dark Force armies — and immediately reads the state of play. He's behind on forts, but has a path open to the southeast. He pops open a couple of journal notes to remember his thinking: right, Eren was pushing northwest but got cut off. Time to pivot.

He taps a hex edge, rolls the digital dice, and picks up exactly where he left off. No "where was I?" confusion. The map tells the story visually; the journal fills in the strategic thinking.

He finishes the game in 20 minutes. Win. Ten minutes left — he starts a new game immediately. New map, fresh campaign. The transition from "game over" to "new game" is two taps.

**What this journey demands:** Visual game state readable at a glance — color, iconography, and layout communicate claimed/blocked/fort/Dark Force status without a legend. Journal entries as context recovery (read mode, not write mode). Seamless end-of-game-to-new-game flow. Pause/resume that just works — no save prompts, no "restore session?" dialogs.

### Journey 3: The Writing Session — Taylor Mines the Archive

Evening. Taylor is at the desktop after work. During lunch breaks that day, he played a game that had incredible back-and-forth — critical hexes blocked, forts lost and retaken, a nail-biter finish. He wrote journal notes throughout.

He opens the app, goes to the archive, and finds the game. He opens it and starts the campaign replay — a visual playback that steps through the game turn by turn, coloring in the map as each hex was placed. He watches the story unfold spatially.

At key moments, his journal entries appear as context. He pauses the replay at a lake crossing and opens a separate doc (or dictates via Aqua Voice). He narrates: "The commander and his men found local fishing boats and sailed across, cutting the journey by two weeks and throwing the Dark Force off their trail." He resumes the replay.

He pauses again at a muster point — reinforcements arriving. Then the story turns: two forts lost to bad rolls, followed by a desperate push to capture the last two. He writes each vignette as the replay shows him what happened.

The game state is the skeleton. The journal entries are the muscle memory. The writing is the skin Taylor puts on top.

**What this journey demands:** Archive browsable at a glance (date, map, win/loss, journal entry count). Campaign replay with turn-by-turn visual playback. Journal entries surfaced during replay at the turns they were written. The app as reference material alongside an external writing tool — not trying to be the word processor itself.

### Journey 4: The Override — Taylor Corrects a Bad Ruling

Mid-game. Taylor rolls into a forest edge and the app resolves the movement, but the hex placement doesn't look right. Before undoing, he taps to pull up the quick rules reference — a brief, contextual description of the forest edge movement rule. He reads it, compares it to what the app did, and decides the app got it wrong.

He taps undo, goes back to that turn, and manually overrides the placement. The app rewinds the game state to that turn, Taylor selects the correct hex edge, and play continues with his ruling.

The app enforces rules automatically, but Taylor has final authority. If the engine and the player disagree, the player wins.

**What this journey demands:** Contextual quick rules reference (brief, tappable, relevant to the current action). Turn-by-turn undo — the ability to rewind to any prior turn and replay from there. Manual override of automated rule resolution. Game state stored as a stack of turns, not just current state. No complex error-reporting flow — just rewind and fix.

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| Atomic tap-roll-result interaction loop | Journey 1 (Couch Session) |
| Digital dice as first-class input | Journey 1, Journey 2 |
| Quick-open/quick-close journal with dictation support | Journey 1 |
| Visual game state readable at a glance | Journey 2 (Parking Lot Resume) |
| Journal entries as context recovery (read mode) | Journey 2 |
| Seamless pause/resume with no prompts | Journey 2 |
| Fast new-game flow after game completion | Journey 2 |
| Browsable campaign archive with metadata | Journey 3 (Writing Session) |
| Turn-by-turn campaign replay with visual playback | Journey 3 |
| Journal entries surfaced at relevant turns during replay | Journey 3 |
| Contextual quick rules reference (brief, tappable) | Journey 4 (Override) |
| Turn-by-turn undo and rewind | Journey 4 (Override) |
| Player override of automated rule resolution | Journey 4 |
| Game state stored as turn stack, not just current state | Journey 3, Journey 4 |

## Web App (PWA) Specific Requirements

### Project-Type Overview

Single-page application deployed as a Progressive Web App. The entire experience — hex grid gameplay, journal, and campaign archive — lives within one app shell with view-based navigation. No server-side rendering, no SEO requirements, no real-time data. All state is local (with optional cloud storage sync for cross-device access).

### Browser & Platform Support

| Browser | Platform | Priority | Notes |
|---|---|---|---|
| Chrome | Android phone/tablet | Primary | Taylor's main gaming device |
| Firefox | Windows desktop | Primary | Taylor's desktop browser for writing sessions |
| Safari | iOS phone/tablet | Secondary | Family member access |
| Chrome | Windows desktop | Secondary | Occasional use |

**Engine coverage:** Chromium, Gecko, WebKit. All three must be tested for PWA installation, service worker caching, IndexedDB persistence, and offline functionality.

**PWA installation:** Must be installable on Android (Chrome) and desktop (Chrome/Firefox). Safari on iOS has limited PWA support — the app must function as a capable web app on iOS even if full PWA installation is restricted by Apple's platform constraints.

### Responsive Design

Three target form factors:
- **Phone (portrait):** Primary gaming device. The hex grid must be legible and touch-interactive at phone widths (~360-430px). Six numbers per hex cell is the critical constraint — minimum font size and touch target size must be validated on a real device before other features are built.
- **Tablet (portrait/landscape):** Comfortable gaming with more visual breathing room. Hex grid scales up naturally.
- **Desktop (landscape):** Writing session mode. Hex grid replay alongside journal entries. Wider layout takes advantage of screen real estate.

### Performance Targets

Performance is measured by specific NFRs (see Non-Functional Requirements). Key targets:
- App interactive in under 3 seconds on mid-range Android (NFR2)
- Tap-to-result under 100ms (NFR1)
- Full offline functionality via service worker and IndexedDB (NFR14)
- Archive responsive with 100+ saved games (NFR4)

### Accessibility

- **Text legibility:** Hex cell numbers readable on phone screens. Good contrast ratios (WCAG AA minimum). Validated on real devices.
- **Touch targets:** Hex edges and cells tappable without precision — minimum 44x44px per WCAG guidelines.
- **Voice input compatibility:** Journal input fields work cleanly with system-level dictation (Aqua Voice, Android voice input, iOS dictation). No custom input handling that blocks dictation tools.
- **No reliance on color alone:** Hex state (claimed, blocked, fort, Dark Force) distinguishable by icons, patterns, or labels in addition to color.

### Implementation Considerations

- **Offline-first architecture:** Service worker with cache-first strategy for app shell and static assets. IndexedDB as the primary data store — not a fallback, the default.
- **No backend required:** All logic runs client-side. No server, no API, no hosting costs beyond free static hosting (GitHub Pages, Netlify, or similar).
- **Cross-browser testing:** PWA behavior (installation, caching, offline, IndexedDB) must be tested across Chrome, Firefox, and Safari. Safari's service worker and storage limitations are a known risk.
- **Bundle size:** Lightweight for fast mobile loading. Lazy-load archive and replay features not needed during active gameplay.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — deliver the complete core experience (play, journal, archive, cross-device sync) on one map with one terrain type. The goal is not to validate a market — there is no market. The goal is to validate that the app replaces paper as Taylor's default way to play DFI. If Taylor stops using paper and starts using the app within two weeks, the MVP succeeded.

**Resource Requirements:** Solo developer (Taylor, intermediate level). Zero budget. All tooling and hosting must be free/open-source. No external dependencies or paid services.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Journey 1 (Couch Session) — fully supported
- Journey 2 (Parking Lot Resume) — fully supported
- Journey 3 (Writing Session) — partially supported (archive browsing and journal review, but no turn-by-turn visual replay)
- Journey 4 (Override) — fully supported

**Must-Have Capabilities:**
- Interactive hex grid with core rules enforcement (placement, clockwise orientation, army matching, Dark Force spawning, blocking, fort capture/loss, win/loss detection)
- Mountain terrain
- One map (Calosanti Region from Mountain Map Pack)
- Manual dice entry + digital dice toggle
- Dark Force army tally with automatic tracking
- Turn-by-turn undo and rewind to any prior turn
- Player override of automated rule resolution
- Contextual quick rules reference (brief, tappable, relevant to current action)
- Basic journaling: text input per turn or per session, linked to game state, dictation-friendly input fields
- Campaign save and browse (archive of completed games with full turn history and journal entries)
- Pause/resume mid-game across sessions
- Cross-device data sync via cloud storage (Google Drive or Dropbox)
- PWA: installable, offline-first, works on phone/tablet/desktop
- Visually polished hex grid that looks good on all screen sizes
- Game state stored as a turn stack (not just current state)

### Post-MVP Features

**Phase 2 (Growth):**
- All terrain expansions: forests, lakes, marshes, muster, ambush
- All five Mountain Map Pack maps (Calosanti, Biliton, Tolantus, Borkana, Shalmista)
- Campaign replay (turn-by-turn visual playback with journal entries surfaced at relevant turns)
- Export journal entries for external writing (Google Docs or plain text)
- OBS-friendly layout options for recording
- Campaign data backup/restore

**Phase 3 (Expansion):**
- Reindeer expansion (snow maps with igloos replacing forts)
- Five official alternative rules (Dronak's, Mann's, Nero's, Grieger, Belina)
- Additional map packs (Expansion Pack 1, Wasteland, Snow Fields, Mountain Region Series)
- Camera-based D6 reading

**Phase 4 (Vision):**
- Map randomizer/generator for when existing maps feel stale
- Visual map editor for hand-crafting custom hex maps
- Map import/export for sharing custom maps

### Risk Mitigation Strategy

**Technical Risks:**
- *Hex grid on mobile:* Six numbers per hex cell on a phone screen is the single biggest UX risk. Mitigation: prototype the hex grid on a real phone first, before building any game logic. If the grid isn't readable and tappable, nothing else matters.
- *Rule engine edge cases:* DFI's terrain interactions (especially forests and marshes) have complex cascading effects. Mitigation: MVP includes only mountains (simplest terrain). Undo/override lets Taylor work around engine bugs. Additional terrain added incrementally in Phase 2 with per-terrain testing.
- *Cross-browser PWA behavior:* Safari's PWA support (service workers, IndexedDB persistence) is less reliable than Chrome/Firefox. Mitigation: test offline and storage behavior on iOS Safari early. Accept degraded PWA installation on iOS if necessary — the web app must still function.

**Resource Risks:**
- *Solo developer, hobby project:* Motivation depends on reaching playable milestones fast. Mitigation: MVP is deliberately small — one map, one terrain type, core rules only. Get to "playing on the couch" as quickly as possible. Everything else layers on incrementally.
- *Map digitization is invisible work:* Converting PDF hex maps to structured data (hex positions, terrain types, fort locations) is non-trivial manual effort. Mitigation: MVP requires only one map (Calosanti). Additional maps are scoped per-map in Phase 2/3, not assumed as background work.

## Functional Requirements

### Hex Grid Gameplay

- FR1: Player can select a map to start a new game on
- FR2: Player can view the hex grid map with all hex positions, terrain features, fort locations, and starting point clearly displayed
- FR3: Player can select a claimed, non-blocked hex to roll from
- FR4: Player can select a hex edge/direction to roll toward
- FR5: Player can input a dice roll via manual number entry
- FR6: Player can input a dice roll via digital dice roller with animation
- FR7: System places a new hex in the rolled direction with numbers 1-6 oriented clockwise starting with the rolled number on the connecting side
- FR8: System detects and marks armies when matching numbers are adjacent between any neighboring hexes (not just the source hex)
- FR9: System detects and applies blocked hex rules when a duplicate number is rolled
- FR10: System detects and spawns Dark Force armies when non-matching adjacent numbers trigger Dark Force placement
- FR11: System resolves Dark Force escalation when rolling a number that already has a Dark Force army on it (cascading defeats and blocks)
- FR12: System detects and resolves mountain terrain interactions (rolling into a mountain blocks the source hex)
- FR13: System detects fort capture when an army is placed in a fort hex
- FR14: System detects fort loss when a fort hex is blocked before capture or becomes unreachable
- FR15: System maintains a running Dark Force army tally
- FR16: System detects win condition (more than half the forts captured)
- FR17: System detects lose conditions (Dark Force army limit reached or all remaining forts unreachable/blocked)
- FR18: Player can view the current game state at a glance — claimed hexes, blocked hexes, fort status, army positions, and Dark Force armies distinguishable visually without relying on color alone

### Undo & Override

- FR19: Player can undo the most recent turn
- FR20: Player can rewind to any prior turn in the current game
- FR21: Player can manually override the system's automated rule resolution after rewinding
- FR22: System stores game state as a stack of turns, preserving the complete history for undo and replay

### Rules Reference

- FR23: Player can access a quick rules reference relevant to the current game action or most recent rule that triggered
- FR24: Player can browse the complete rules reference for all game mechanics and terrain types

### Campaign Journal

- FR25: Player can create a journal entry linked to the current turn during gameplay
- FR26: Player can create a journal entry linked to the overall game session (not turn-specific)
- FR27: Player can input journal entries via text (compatible with system-level dictation tools including Aqua Voice)
- FR28: Player can view journal entries during gameplay to review prior notes
- FR29: Player can edit or delete existing journal entries

### Campaign Archive

- FR30: System automatically saves the completed game to the campaign archive upon win or loss
- FR31: Player can browse the campaign archive with visible metadata (date, map name, win/loss outcome, number of journal entries)
- FR32: Player can open a completed game from the archive and view the final game state
- FR33: Player can read all journal entries from an archived game

### Pause & Resume

- FR34: System automatically saves game state on every turn (no manual save required)
- FR35: Player can close the app mid-game and resume from the exact turn they left off
- FR36: Player can see an unfinished game and resume it when opening the app
- FR37: Player can start a new game after completing or abandoning a game in 2 taps or fewer

### Progressive Web App

- FR38: Player can install the app on their device (Android, desktop)
- FR39: Player can use the app with full functionality while offline (no network connection)
- FR40: System persists all game data, journal entries, and archive locally on the device
- FR41: App loads and is interactive within performance targets on mobile devices

### Cross-Device Data Sync

- FR42: Player can configure a cloud storage location (Google Drive or Dropbox folder) to store app data during initial setup
- FR43: Player can use the app in local-only mode without configuring cloud storage
- FR44: System reads and writes all game data, journal entries, and archive to the configured cloud storage location
- FR45: System detects when the data file has been modified externally (by another device) and reloads the current state
- FR46: System warns the player if a conflict is detected (data changed on another device while the app was in use)
- FR47: Player can switch between local-only and cloud-synced storage in app settings

## Non-Functional Requirements

### Performance

- NFR1: Tap-to-result interaction (select hex edge → roll → see placed hex) completes in under 100ms on a mid-range Android phone
- NFR2: App is fully interactive within 3 seconds of launch on a mid-range Android phone
- NFR3: Journal open/close (tap to open, dictate, tap to close) completes in under 200ms
- NFR4: Campaign archive list renders in under 500ms with 100+ saved games
- NFR5: Digital dice roller animation completes within 1 second

### Accessibility

- NFR6: All text in hex cells meets WCAG AA contrast ratio (4.5:1 minimum)
- NFR7: All interactive touch targets are at least 44x44px
- NFR8: Hex state (claimed, blocked, fort, Dark Force) is distinguishable without relying on color alone (icons, patterns, or labels supplement color)
- NFR9: Journal input fields accept text from system-level dictation tools (Aqua Voice, Android voice input, iOS dictation) without interference
- NFR10: UI text is readable without zooming on phone screens at default font size

### Reliability & Data Integrity

- NFR11: Game state auto-saves on every turn — no data loss if the app is closed, crashes, or loses power mid-game
- NFR12: Campaign archive data survives app updates, browser cache clears (within IndexedDB persistence limits), and device restarts
- NFR13: Cloud-synced data file is written atomically — partial writes do not corrupt the archive
- NFR14: The app functions identically with or without a network connection (offline-first, not offline-capable)

### Integration

- NFR15: Cloud storage sync supports Google Drive and Dropbox
- NFR16: Sync operations do not block gameplay — reads and writes happen in the background
- NFR17: Sync conflicts are surfaced to the player with a clear warning, never silently resolved

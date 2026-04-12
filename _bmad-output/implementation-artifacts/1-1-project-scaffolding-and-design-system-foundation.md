# Story 1.1: Project Scaffolding & Design System Foundation

Status: done

## Story

As a developer,
I want to initialize the project with the correct tech stack and a complete design token system,
so that all future stories build on a consistent visual and technical foundation.

## Acceptance Criteria

1. **Given** no project exists yet **When** the project is initialized **Then** a Svelte 5 + Vite + TypeScript project is created using `npm create vite@latest dark-force-incursion -- --template svelte-ts` **And** `vite-plugin-pwa` is installed as a dev dependency **And** TypeScript strict mode is enabled (`strict: true`, no `any`, no `@ts-ignore`) **And** the project directory structure matches the architecture document (engine/, stores/, components/, persistence/, sync/, types/, maps/, data/ directories under src/) **And** Vitest is installed and configured with a passing sample test

2. **Given** the project is initialized **When** app.css is created **Then** CSS custom properties define the complete dark atmospheric color palette (all hex values from UX spec) **And** typography tokens define the dual-font system (Inter or IBM Plex Sans for data, Cinzel for headings, Crimson Text for body) **And** Inter, Cinzel, and Crimson Text fonts are self-hosted (downloaded and served from the app's static assets, not loaded from Google Fonts CDN) for offline availability **And** spacing scale tokens are defined (4px xs, 8px sm, 16px md, 24px lg, 32px xl) **And** animation timing tokens are defined for cascade sequence and panel transitions **And** breakpoint tokens are defined (phone default, tablet 768px, desktop 1024px)

3. **Given** the design system is in place **When** `npm run dev` is executed **Then** the Vite dev server starts with HMR **And** the app renders with the correct background color and font loading **And** z-index layer tokens are defined for the 6-layer overlay stack (map base, status/control strip, dice input, journal/rules panel, toast, modal) **And** `npm run build` produces a production build to dist/

## Tasks / Subtasks

- [x] Task 1: Project Initialization (AC: #1)
  - [x] 1.1: Run `npm create vite@latest dark-force-incursion -- --template svelte-ts`
  - [x] 1.2: Install dependencies: `vite-plugin-pwa`, `honeycomb-grid` (v4.1.5), `dexie` (v4.4.2)
  - [x] 1.3: Install dev dependencies: `vitest` (v4.1.4)
  - [x] 1.4: Configure `tsconfig.json` with `strict: true`
  - [x] 1.5: Configure `vite.config.ts` with vite-plugin-pwa (v1.2.0)
  - [x] 1.6: Configure Vitest in vite config
  - [x] 1.7: Create a passing sample test to verify Vitest works

- [x] Task 2: Directory Structure (AC: #1)
  - [x] 2.1: Create `src/engine/` (pure game logic, NO UI, NO side effects)
  - [x] 2.2: Create `src/engine/terrain/` (pluggable terrain resolvers)
  - [x] 2.3: Create `src/types/` (shared TypeScript definitions)
  - [x] 2.4: Create `src/stores/` (Svelte stores)
  - [x] 2.5: Create `src/persistence/` (Dexie.js database layer)
  - [x] 2.6: Create `src/sync/` (cloud sync, future)
  - [x] 2.7: Create `src/maps/` (map data files)
  - [x] 2.8: Create `src/components/` with subdirs: hex-grid/, dice/, journal/, archive/, rules/, game/, settings/, shared/
  - [x] 2.9: Create `src/data/` (rules reference text)
  - [x] 2.10: Create `public/icons/` and `public/manifest.webmanifest`
  - [x] 2.11: Add placeholder `favicon.svg` in public/
  - [x] 2.12: Add `.gitkeep` in empty directories so git tracks them

- [x] Task 3: Design Token System in app.css (AC: #2, #3)
  - [x] 3.1: Define color palette as CSS custom properties (see Dev Notes below for exact values)
  - [x] 3.2: Define typography tokens (font families, size scale, weights, line heights)
  - [x] 3.3: Define spacing scale tokens (xs through xl)
  - [x] 3.4: Define animation timing tokens (cascade beats, panel transitions)
  - [x] 3.5: Define breakpoint tokens (phone, tablet, desktop)
  - [x] 3.6: Define z-index layer tokens (6 layers)
  - [x] 3.7: Define border and shadow tokens
  - [x] 3.8: Set global body styles (background color, default font, text color)

- [x] Task 4: Font Loading — Self-Hosted (AC: #2)
  - [x] 4.1: Install @fontsource/inter (woff2 bundled via fontsource, no CDN)
  - [x] 4.2: Install @fontsource/cinzel (woff2 bundled via fontsource)
  - [x] 4.3: Install @fontsource/crimson-text (woff2 bundled via fontsource)
  - [x] 4.4: Import fontsource CSS in main.ts (includes @font-face with font-display: swap)
  - [x] 4.5: Verify fonts render correctly on dev server

- [x] Task 5: Root App Shell (AC: #3)
  - [x] 5.1: Update `src/main.ts` entry point
  - [x] 5.2: Update `src/App.svelte` as root component with correct background and font
  - [x] 5.3: Verify `npm run dev` starts with HMR
  - [x] 5.4: Verify `npm run build` produces output in dist/

## Dev Notes

### Color Palette — Exact CSS Custom Properties

```css
:root {
  /* Background & Surface */
  --color-bg-app: #1a1a2e;
  --color-bg-surface: #25253e;
  --color-bg-map: #2d2d44;

  /* Player Colors (Warm) */
  --color-hex-claimed: #d4a574;
  --color-hex-claimed-border: #8b6914;
  --color-army: #f0c040;
  --color-fort-captured: #e8b830;
  --color-fort-uncaptured: #7a7a8a;
  --color-hex-numbers: #e8e0d0;

  /* Enemy Colors (Cold) */
  --color-dark-force: #8b1a1a;
  --color-dark-force-flash: #c0302a;

  /* Terrain Colors */
  --color-terrain-mountain: #6a6a7a;
  --color-terrain-forest: #2d5a3a;
  --color-terrain-lake: #3a5a7a;
  --color-terrain-marsh: #5a5a2a;
  --color-terrain-muster: #6a8a3a;
  --color-terrain-ambush: #5a2a3a;

  /* UI Accent */
  --color-accent: #d4a040;
  --color-warning: #c06030;
  --color-success: #5a8a4a;
  --color-text-primary: #e8e0d0;
  --color-text-secondary: #9a9080;
}
```

### Typography Tokens

```css
:root {
  /* Font Families */
  --font-data: 'Inter', 'IBM Plex Sans', system-ui, sans-serif;
  --font-heading: 'Cinzel', serif;
  --font-body: 'Crimson Text', 'Cormorant Garamond', serif;

  /* Font Sizes (1.25 modular ratio) */
  --text-display: 1.5rem;    /* 24px */
  --text-h1: 1.25rem;        /* 20px */
  --text-h2: 1rem;           /* 16px */
  --text-body: 0.875rem;     /* 14px */
  --text-caption: 0.75rem;   /* 12px */

  /* Font Weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;

  /* Line Heights */
  --leading-body: 1.5;
  --leading-heading: 1.2;
}
```

### Spacing Tokens

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}
```

### Animation Timing Tokens

```css
:root {
  --duration-cascade-beat: 200ms;
  --duration-cascade-terrain: 300ms;
  --duration-cascade-fort: 100ms;
  --duration-panel-transition: 200ms;
  --duration-dice-roll: 1000ms;
  --duration-toast-dismiss: 3000ms;
  --easing-default: ease-out;
}
```

### Z-Index Layers

```css
:root {
  --z-map: 0;
  --z-chrome: 100;        /* StatusBar, ControlStrip */
  --z-dice: 200;          /* DiceInput */
  --z-panel: 300;         /* JournalPanel, RulesReference */
  --z-toast: 400;         /* Toast notifications */
  --z-modal: 500;         /* Modal, GameOver overlay */
}
```

### Breakpoints

```css
/* Phone: default (360-430px) — no media query needed */
/* Tablet: @media (min-width: 768px) */
/* Desktop: @media (min-width: 1024px) */
```

### Border & Shadow Tokens

```css
:root {
  --border-hex-default: 1px solid rgba(255, 255, 255, 0.1);
  --border-hex-claimed: 2px solid var(--color-hex-claimed-border);
  --border-hex-selected: 2px solid var(--color-army);
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --shadow-overlay: 0 -2px 16px rgba(0, 0, 0, 0.4);
  --backdrop-blur: blur(12px);
}
```

### Project Structure Notes

Complete directory tree to create under `src/`:

```
src/
├── main.ts
├── App.svelte
├── app.css
├── assets/fonts/          ← Self-hosted Inter, Cinzel, Crimson Text (woff2)
├── engine/
│   └── terrain/
├── types/
│   ├── hex.types.ts       ← Created in Story 1.2, just create dir now
│   ├── game.types.ts
│   ├── terrain.types.ts
│   ├── journal.types.ts
│   ├── map.types.ts
│   └── sync.types.ts
├── stores/
├── persistence/
├── sync/
├── maps/
├── components/
│   ├── hex-grid/
│   ├── dice/
│   ├── journal/
│   ├── archive/
│   ├── rules/
│   ├── game/
│   ├── settings/
│   └── shared/
└── data/
```

### Architecture Compliance

**MUST follow:**
- TypeScript `strict: true` — zero `any` types, no `@ts-ignore`
- Explicit return types on all public functions
- Naming: PascalCase.svelte, camelCase.ts, {module}.test.ts co-located, UPPER_SNAKE_CASE constants, PascalCase types/interfaces/enums
- Engine boundary: `src/engine/` imports nothing from stores/, components/, persistence/, sync/
- Immutable state updates only — stores never mutate existing objects
- Rule violations as typed results, not exceptions
- Persistence errors surface to user, never silently swallowed
- CSS scoped in Svelte components, global tokens in app.css only — no CSS-in-JS

**MUST NOT do:**
- Do NOT implement hex grid rendering (Story 1.3)
- Do NOT implement rule engine logic (Story 2.1+)
- Do NOT implement persistence/Dexie integration (Story 3.5)
- Do NOT implement any UI components beyond the root App.svelte shell
- Do NOT use `any` type to "fix" TypeScript errors — use `unknown` and narrow
- Do NOT create `__tests__/` directories — tests are co-located as `{module}.test.ts`
- Do NOT use CSS-in-JS or Tailwind — pure CSS custom properties only
- Do NOT load fonts from Google Fonts CDN — self-host for offline PWA

### Library & Framework Requirements

| Library | Version | Purpose | Install |
|---|---|---|---|
| Svelte | 5.55.x | UI framework | via template |
| Vite | 8.0.x | Build tool + dev server | via template |
| TypeScript | 6.0.x | Type safety | via template |
| vite-plugin-pwa | 1.2.0 | PWA service worker + manifest | `npm i -D vite-plugin-pwa` |
| Honeycomb.js | 4.1.5 | Hex grid coordinate math | `npm i honeycomb-grid` |
| Dexie.js | 4.4.2 | IndexedDB wrapper | `npm i dexie` |
| Vitest | 4.1.4 | Unit testing | `npm i -D vitest` |

### Testing Requirements

- Framework: Vitest 4.1.4 (same Vite pipeline, no separate config)
- Test files co-located: `{module}.test.ts` next to `{module}.ts`
- For this story: one passing sample test verifying Vitest is configured correctly
- Future stories will add extensive rule engine tests

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

### Accessibility Baseline

- All text uses `rem` units for system font size adjustments
- Body text meets WCAG AA contrast (4.5:1 cream `#e8e0d0` on dark `#1a1a2e`)
- `prefers-reduced-motion` media query pattern established in CSS
- `font-display: swap` on all `@font-face` declarations

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Tech Stack, Directory Structure, Naming Conventions, Testing Strategy, Architecture Boundaries]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Design Tokens, Color Palette, Typography, Spacing, Z-Index, Breakpoints, Animation Timing]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.1 Acceptance Criteria]

## Change Log

- 2026-04-11: Story implemented — project scaffolded, design tokens defined, fonts self-hosted via fontsource, all directories created, build verified

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- vite-plugin-pwa@1.2.0 peer dependency conflict with Vite 8 — resolved with --legacy-peer-deps (plugin works fine, just hasn't updated peerDeps yet)
- Used @fontsource packages instead of manual woff2 downloads — provides proper unicode-range subsets, font-display: swap, and tree-shaking per weight

### Completion Notes List

- Project scaffolded via `npm create vite@latest` with svelte-ts template
- All dependencies installed: svelte 5.x, vite 8.x, typescript 6.x, vite-plugin-pwa, honeycomb-grid, dexie, vitest
- TypeScript strict mode enabled in tsconfig.app.json
- Complete design token system in app.css: 22 color tokens, 11 typography tokens, 5 spacing tokens, 7 animation tokens, 6 z-index layers, 7 border/shadow tokens
- Self-hosted fonts via @fontsource — woff2 bundled, zero CDN dependency
- Directory structure matches architecture spec exactly
- PWA manifest + service worker generated (37 precached entries)
- Vitest configured and passing (2 tests)
- Reduced motion media query established
- Production build succeeds to dist/

### File List

- package.json (new)
- package-lock.json (new)
- index.html (new)
- vite.config.ts (new)
- svelte.config.js (new)
- tsconfig.json (new)
- tsconfig.app.json (new)
- tsconfig.node.json (new)
- .gitignore (new)
- public/manifest.webmanifest (new)
- public/favicon.svg (modified)
- public/icons.svg (deleted — unused Vite scaffold artifact)
- src/main.ts (modified)
- src/App.svelte (modified)
- src/app.css (modified)
- src/sample.test.ts (new)
- src/engine/.gitkeep (new)
- src/engine/terrain/.gitkeep (new)
- src/types/.gitkeep (new)
- src/stores/.gitkeep (new)
- src/persistence/.gitkeep (new)
- src/sync/.gitkeep (new)
- src/maps/.gitkeep (new)
- src/data/.gitkeep (new)
- src/components/{hex-grid,dice,journal,archive,rules,game,settings,shared}/.gitkeep (new)
- public/icons/.gitkeep (new)

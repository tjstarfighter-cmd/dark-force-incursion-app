# Story 8.2: Cloud Sync — Read & Write

Status: done

## Story

As a player,
I want my game data to sync to the cloud automatically in the background,
So that I can pause on my phone and pick up on my tablet.

## Acceptance Criteria

1. **File-per-game format:** Sync writes manifest.json + individual game-{id}.json files to Google Drive.
2. **Background sync:** Sync never blocks gameplay. Fire-and-forget with silent retry.
3. **Read from cloud:** On app load with sync enabled, reads cloud data and updates local IndexedDB.
4. **Sync status:** Subtle sync icon/indicator shows last synced time.

## Tasks / Subtasks

- [x] Task 1: Implement Google Drive OAuth PKCE flow
- [x] Task 2: Implement GoogleDriveSyncAdapter with real API calls
- [x] Task 3: Create sync engine that orchestrates read/write
- [x] Task 4: Wire sync into settings (connect button, sync now)
- [x] Task 5: Handle OAuth callback on app load
- [x] Task 6: Tests and verification (154 pass, clean build)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Completion Notes List

- googleAuth.ts: Full OAuth 2.0 PKCE flow — code verifier/challenge generation, redirect to Google, token exchange, refresh token storage in localStorage
- GoogleDriveSyncAdapter: Real implementation using Google Drive v3 API with appDataFolder scope — findFile, readFile, createFile, updateFile via multipart upload
- syncEngine.ts: Orchestrates syncToCloud (writes manifest + game files) and syncFromCloud (reads manifest, downloads missing games to local IndexedDB)
- SettingsView: "Connect Google Drive" button triggers OAuth, "Sync Now" button for manual sync
- App.svelte: handles OAuth callback on load, redirects to settings view after auth
- Client ID: 528457753404-5712ntr2cpmru055avp0k3ipqv7g1de3.apps.googleusercontent.com
- Redirect URI: app's origin + pathname (works for both localhost and GitHub Pages)

### File List

- src/sync/googleAuth.ts (new) — OAuth PKCE flow
- src/sync/googleDrive.ts (rewritten) — real Google Drive API implementation
- src/sync/syncEngine.ts (new) — sync orchestration
- src/components/settings/SettingsView.svelte (modified) — connect/sync buttons
- src/App.svelte (modified) — OAuth callback handling

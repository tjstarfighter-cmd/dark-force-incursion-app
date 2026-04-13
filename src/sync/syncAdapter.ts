import type { SyncManifest } from './syncManifest'

/**
 * Abstract sync adapter interface.
 * Provider implementations (Google Drive, Dropbox) implement this interface.
 * The sync layer calls these methods — it never knows which provider is active.
 */
export interface SyncAdapter {
  /** Authenticate with the cloud provider. Returns true on success. */
  authenticate(): Promise<boolean>

  /** Check if currently authenticated. */
  isAuthenticated(): boolean

  /** Disconnect from the provider. */
  disconnect(): Promise<void>

  /** Read the sync manifest from cloud storage. Returns null if not found. */
  readManifest(): Promise<SyncManifest | null>

  /** Write the sync manifest to cloud storage. Atomic write. */
  writeManifest(manifest: SyncManifest): Promise<void>

  /** Read a game file by ID from cloud storage. Returns null if not found. */
  readGameFile(gameId: string): Promise<string | null>

  /** Write a game file to cloud storage. Atomic write. */
  writeGameFile(gameId: string, data: string): Promise<void>

  /** List all game file IDs in cloud storage. */
  listGameFiles(): Promise<string[]>

  /** Get the last modified timestamp for a file. Returns null if not found. */
  getLastModified(fileId: string): Promise<number | null>
}

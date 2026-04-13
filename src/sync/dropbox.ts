import type { SyncAdapter } from './syncAdapter'
import type { SyncManifest } from './syncManifest'

/**
 * Dropbox sync adapter.
 * Requires Dropbox app with API access and OAuth 2.0 credentials.
 * Currently a stub — implement when OAuth is configured.
 */
export class DropboxSyncAdapter implements SyncAdapter {
  async authenticate(): Promise<boolean> {
    throw new Error('Dropbox sync not yet configured. Requires OAuth setup.')
  }

  isAuthenticated(): boolean {
    return false
  }

  async disconnect(): Promise<void> {
    throw new Error('Dropbox sync not yet configured.')
  }

  async readManifest(): Promise<SyncManifest | null> {
    throw new Error('Dropbox sync not yet configured.')
  }

  async writeManifest(_manifest: SyncManifest): Promise<void> {
    throw new Error('Dropbox sync not yet configured.')
  }

  async readGameFile(_gameId: string): Promise<string | null> {
    throw new Error('Dropbox sync not yet configured.')
  }

  async writeGameFile(_gameId: string, _data: string): Promise<void> {
    throw new Error('Dropbox sync not yet configured.')
  }

  async listGameFiles(): Promise<string[]> {
    throw new Error('Dropbox sync not yet configured.')
  }

  async getLastModified(_fileId: string): Promise<number | null> {
    throw new Error('Dropbox sync not yet configured.')
  }
}

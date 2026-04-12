export type JournalScope = 'turn' | 'session';

export interface JournalEntry {
  id: string;
  turnNumber: number;
  text: string;
  timestamp: number;
  scope: JournalScope;
}

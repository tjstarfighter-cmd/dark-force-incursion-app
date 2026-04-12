import type { HexCoord } from './hex.types';
import type { GameAction } from './game.types';

export enum TerrainType {
  Mountain = 'mountain',
  // Phase 2:
  Forest = 'forest',
  Lake = 'lake',
  Marsh = 'marsh',
  Muster = 'muster',
  Ambush = 'ambush',
}

export interface TerrainResolver {
  terrainType: TerrainType;
  resolve(hexCoord: HexCoord, action: GameAction): TerrainResolutionResult;
}

export interface TerrainResolutionResult {
  blocked: boolean;
  affectedHexes: HexCoord[];
  description: string;
}

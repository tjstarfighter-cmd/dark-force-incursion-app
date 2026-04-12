import type { HexCoord } from './hex.types';
import type { TerrainType } from './terrain.types';

export interface MapHex {
  coord: HexCoord;
  terrain?: TerrainType;
  isFort?: boolean;
  isStartingHex?: boolean;
}

export interface FortLocation {
  coord: HexCoord;
  name?: string;
}

export interface MapDefinition {
  id: string;
  name: string;
  description: string;
  schemaVersion: number;
  gridWidth: number;
  gridHeight: number;
  hexes: MapHex[];
  forts: FortLocation[];
  startingHex: HexCoord;
  darkForceLimit: number;
  orientation: 'flat-top' | 'pointy-top';
}

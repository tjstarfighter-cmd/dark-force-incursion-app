import type { HexCoord, HexState, HexEdge } from './hex.types';
import type { MapDefinition } from './map.types';

export enum GameStatus {
  InProgress = 'in-progress',
  PlayerWon = 'player-won',
  DarkForceWon = 'dark-force-won',
}

export interface GameSnapshot {
  mapId: string;
  mapDefinition: MapDefinition;
  hexes: Map<string, HexState>;
  turnNumber: number;
  darkForceTally: number;
  fortsCaptured: number;
  totalForts: number;
  status: GameStatus;
}

export interface GameAction {
  type: 'placeHex' | 'selectHex' | 'selectEdge' | 'rollDice';
  sourceCoord?: HexCoord;
  edge?: HexEdge;
  diceValue?: number;
}

export interface RuleViolation {
  code: string;
  message: string;
  coord?: HexCoord;
}

export type TurnResult =
  | { ok: true; snapshot: GameSnapshot; action: GameAction }
  | { ok: false; reason: RuleViolation };

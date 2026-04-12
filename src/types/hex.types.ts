export interface HexCoord {
  q: number;
  r: number;
}

export interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

export type HexEdge = 0 | 1 | 2 | 3 | 4 | 5;

export enum HexStatus {
  Empty = 'empty',
  Claimed = 'claimed',
  Blocked = 'blocked',
}

export interface HexState {
  coord: HexCoord;
  status: HexStatus;
  numbers?: number[];     // 6 numbers placed clockwise, undefined if empty
  armies?: number[];       // indices of sides with player armies
  darkForce?: number[];   // indices of sides with Dark Force armies
}

export enum Orientation {
  FlatTop = 'flat-top',
  PointyTop = 'pointy-top',
}

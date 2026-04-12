import type { HexCoord } from '../../types/hex.types'
import type { MapDefinition } from '../../types/map.types'
import { TerrainType } from '../../types/terrain.types'

/**
 * Check if the target coordinate is a mountain hex.
 * If true, the SOURCE hex should be blocked (army lost in hazardous terrain).
 * Mountains act like off-map boundaries — rolling toward them blocks the source.
 */
export function isTargetMountain(mapDef: MapDefinition, targetCoord: HexCoord): boolean {
  const mapHex = mapDef.hexes.find(
    h => h.coord.q === targetCoord.q && h.coord.r === targetCoord.r
  )
  return mapHex?.terrain === TerrainType.Mountain
}

import type { MapDefinition, MapHex } from '../types/map.types'
import { TerrainType } from '../types/terrain.types'

/**
 * Calosanti Region map from the Mountain Region Maps Series 1 (page 1).
 *
 * Coordinate system: flat-top axial (q, r)
 * - q: column (0 = leftmost), increases right
 * - r: row (0 = topmost), increases down
 * - Odd q columns are visually offset down by half a hex height
 *
 * Grid: approximately 10 columns x 13 rows
 * Mountains form natural borders along top-left, bottom-left, and bottom-right.
 * The playable interior is the open area between the mountain ranges.
 *
 * NOTE: This digitization is based on visual analysis of the PDF map.
 * Positions should be verified against the physical map during playtesting.
 */

// Mountain hex positions (borders of the playable area)
const MOUNTAIN_HEXES: Array<{ q: number; r: number }> = [
  // Top-left mountain range (descending diagonal)
  { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 3, r: 0 },
  { q: 0, r: 1 }, { q: 1, r: 1 }, { q: 2, r: 1 },
  { q: 0, r: 2 }, { q: 1, r: 2 },
  { q: 0, r: 3 }, { q: 1, r: 3 },
  { q: 0, r: 4 },

  // Bottom-left mountain range
  { q: 0, r: 8 }, { q: 0, r: 9 },
  { q: 0, r: 10 }, { q: 1, r: 10 },
  { q: 0, r: 11 }, { q: 1, r: 11 }, { q: 2, r: 11 },
  { q: 0, r: 12 }, { q: 1, r: 12 }, { q: 2, r: 12 }, { q: 3, r: 12 },

  // Bottom-right mountain range (ascending diagonal from bottom-right)
  { q: 9, r: 6 }, { q: 9, r: 7 },
  { q: 8, r: 7 }, { q: 9, r: 8 },
  { q: 7, r: 8 }, { q: 8, r: 8 }, { q: 9, r: 9 },
  { q: 6, r: 9 }, { q: 7, r: 9 }, { q: 8, r: 9 }, { q: 9, r: 10 },
  { q: 5, r: 10 }, { q: 6, r: 10 }, { q: 7, r: 10 }, { q: 8, r: 10 }, { q: 9, r: 11 },
  { q: 4, r: 11 }, { q: 5, r: 11 }, { q: 6, r: 11 }, { q: 7, r: 11 }, { q: 8, r: 11 }, { q: 9, r: 12 },
  { q: 4, r: 12 }, { q: 5, r: 12 }, { q: 6, r: 12 }, { q: 7, r: 12 }, { q: 8, r: 12 },
]

// Fort positions (shield/castle icons in the interior)
const FORT_POSITIONS: Array<{ q: number; r: number; name: string }> = [
  { q: 2, r: 4, name: 'Fort Alpha' },
  { q: 7, r: 2, name: 'Fort Bravo' },
  { q: 4, r: 3, name: 'Fort Charlie' },
  { q: 2, r: 7, name: 'Fort Delta' },
  { q: 6, r: 5, name: 'Fort Echo' },
  { q: 3, r: 9, name: 'Fort Foxtrot' },
  { q: 8, r: 4, name: 'Fort Golf' },
]

// Starting hex (circle marker near center of map)
const STARTING_HEX = { q: 5, r: 5 }

/**
 * Build the complete set of hexes for the Calosanti map.
 * Includes all grid positions within the map boundary.
 */
function buildHexes(): MapHex[] {
  const mountainSet = new Set(
    MOUNTAIN_HEXES.map(({ q, r }) => `${q},${r}`)
  )
  const fortSet = new Set(
    FORT_POSITIONS.map(({ q, r }) => `${q},${r}`)
  )

  const hexes: MapHex[] = []

  for (let q = 0; q <= 9; q++) {
    for (let r = 0; r <= 12; r++) {
      const key = `${q},${r}`
      const isMountain = mountainSet.has(key)
      const isFort = fortSet.has(key)
      const isStart = q === STARTING_HEX.q && r === STARTING_HEX.r

      hexes.push({
        coord: { q, r },
        terrain: isMountain ? TerrainType.Mountain : undefined,
        isFort: isFort || undefined,
        isStartingHex: isStart || undefined,
      })
    }
  }

  return hexes
}

export const CALOSANTI_MAP: MapDefinition = {
  id: 'calosanti',
  name: 'Calosanti Region',
  description: 'Mountain Region Series 1, Map 1. A strategic battleground bordered by treacherous mountain ranges.',
  schemaVersion: 1,
  gridWidth: 10,
  gridHeight: 13,
  hexes: buildHexes(),
  forts: FORT_POSITIONS.map(({ q, r, name }) => ({
    coord: { q, r },
    name,
  })),
  startingHex: STARTING_HEX,
  darkForceLimit: 25,
  orientation: 'flat-top',
}

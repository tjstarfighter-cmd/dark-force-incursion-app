import type { MapDefinition, MapHex } from '../types/map.types'
import { TerrainType } from '../types/terrain.types'

/**
 * Calosanti Region map from the Mountain Region Maps Series 1 (page 17 of Omnibus).
 *
 * The map is a 15x18 RECTANGULAR flat-top hex grid.
 * Visual positions (col, row) are converted to axial (q, r) coordinates:
 *   q = col
 *   r = row - floor(col / 2)
 * This ensures the grid renders as a rectangle, not a diamond.
 *
 * NOTE: Mountain and fort positions use VISUAL (col, row) coordinates below,
 * converted to axial in buildHexes(). Verify against the physical map.
 */

const GRID_COLS = 15
const GRID_ROWS = 18

/** Convert visual grid position to axial coordinates */
function toAxial(col: number, row: number): { q: number; r: number } {
  return { q: col, r: row - Math.floor(col / 2) }
}

// Mountain hex positions in VISUAL (col, row) coordinates
const MOUNTAIN_VISUAL: Array<{ col: number; row: number }> = [
  // Top-left mountain range
  { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 },
  { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 },
  { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
  { col: 0, row: 3 }, { col: 1, row: 3 },
  { col: 0, row: 4 }, { col: 1, row: 4 },
  { col: 0, row: 5 },

  // Bottom-left mountain range
  { col: 0, row: 12 },
  { col: 0, row: 13 }, { col: 1, row: 13 },
  { col: 0, row: 14 }, { col: 1, row: 14 }, { col: 2, row: 14 },
  { col: 0, row: 15 }, { col: 1, row: 15 }, { col: 2, row: 15 }, { col: 3, row: 15 },
  { col: 0, row: 16 }, { col: 1, row: 16 }, { col: 2, row: 16 }, { col: 3, row: 16 }, { col: 4, row: 16 },
  { col: 0, row: 17 }, { col: 1, row: 17 }, { col: 2, row: 17 }, { col: 3, row: 17 }, { col: 4, row: 17 }, { col: 5, row: 17 },

  // Bottom-right mountain range
  { col: 14, row: 10 },
  { col: 13, row: 11 }, { col: 14, row: 11 },
  { col: 12, row: 12 }, { col: 13, row: 12 }, { col: 14, row: 12 },
  { col: 11, row: 13 }, { col: 12, row: 13 }, { col: 13, row: 13 }, { col: 14, row: 13 },
  { col: 10, row: 14 }, { col: 11, row: 14 }, { col: 12, row: 14 }, { col: 13, row: 14 }, { col: 14, row: 14 },
  { col: 9, row: 15 }, { col: 10, row: 15 }, { col: 11, row: 15 }, { col: 12, row: 15 }, { col: 13, row: 15 }, { col: 14, row: 15 },
  { col: 8, row: 16 }, { col: 9, row: 16 }, { col: 10, row: 16 }, { col: 11, row: 16 }, { col: 12, row: 16 }, { col: 13, row: 16 }, { col: 14, row: 16 },
  { col: 6, row: 17 }, { col: 7, row: 17 }, { col: 8, row: 17 }, { col: 9, row: 17 }, { col: 10, row: 17 }, { col: 11, row: 17 }, { col: 12, row: 17 }, { col: 13, row: 17 }, { col: 14, row: 17 },
]

// Fort positions in VISUAL (col, row) coordinates
const FORT_VISUAL: Array<{ col: number; row: number; name: string }> = [
  { col: 4, row: 3, name: 'Fort Alpha' },
  { col: 10, row: 2, name: 'Fort Bravo' },
  { col: 6, row: 5, name: 'Fort Charlie' },
  { col: 3, row: 9, name: 'Fort Delta' },
  { col: 11, row: 7, name: 'Fort Echo' },
  { col: 5, row: 13, name: 'Fort Foxtrot' },
  { col: 13, row: 5, name: 'Fort Golf' },
]

// Starting hex in VISUAL coordinates
const STARTING_VISUAL = { col: 7, row: 8 }

/**
 * Build the complete set of hexes for the Calosanti map.
 * 15 columns x 18 rows rectangular grid, converted to axial coordinates.
 */
function buildHexes(): MapHex[] {
  const mountainSet = new Set(
    MOUNTAIN_VISUAL.map(({ col, row }) => {
      const a = toAxial(col, row)
      return `${a.q},${a.r}`
    })
  )
  const fortSet = new Set(
    FORT_VISUAL.map(({ col, row }) => {
      const a = toAxial(col, row)
      return `${a.q},${a.r}`
    })
  )
  const startAxial = toAxial(STARTING_VISUAL.col, STARTING_VISUAL.row)

  const hexes: MapHex[] = []

  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = 0; row < GRID_ROWS; row++) {
      const { q, r } = toAxial(col, row)
      const key = `${q},${r}`
      const isMountain = mountainSet.has(key)
      const isFort = fortSet.has(key)
      const isStart = q === startAxial.q && r === startAxial.r

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

const startAxial = toAxial(STARTING_VISUAL.col, STARTING_VISUAL.row)

export const CALOSANTI_MAP: MapDefinition = {
  id: 'calosanti',
  name: 'Calosanti Region',
  description: 'Mountain Region Series 1, Map 1. A strategic battleground bordered by treacherous mountain ranges.',
  schemaVersion: 1,
  gridWidth: GRID_COLS,
  gridHeight: GRID_ROWS,
  hexes: buildHexes(),
  forts: FORT_VISUAL.map(({ col, row, name }) => ({
    coord: toAxial(col, row),
    name,
  })),
  startingHex: startAxial,
  darkForceLimit: 25,
  orientation: 'flat-top',
}

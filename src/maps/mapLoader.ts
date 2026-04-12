import type { MapDefinition } from '../types/map.types'

export interface MapValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a MapDefinition for structural correctness.
 * Checks required fields, data consistency, and logical constraints.
 */
export function validateMap(map: unknown): MapValidationResult {
  const errors: string[] = []

  if (!map || typeof map !== 'object') {
    return { valid: false, errors: ['Map definition must be a non-null object'] }
  }

  const m = map as Record<string, unknown>

  // Required string fields
  if (typeof m.id !== 'string' || m.id.length === 0) {
    errors.push('Map must have a non-empty string id')
  }
  if (typeof m.name !== 'string' || m.name.length === 0) {
    errors.push('Map must have a non-empty string name')
  }
  if (typeof m.orientation !== 'string' || !['flat-top', 'pointy-top'].includes(m.orientation as string)) {
    errors.push('Map must have orientation "flat-top" or "pointy-top"')
  }

  // Required number fields
  if (typeof m.schemaVersion !== 'number' || m.schemaVersion < 1) {
    errors.push('Map must have schemaVersion >= 1')
  }
  if (typeof m.gridWidth !== 'number' || m.gridWidth < 1) {
    errors.push('Map must have gridWidth >= 1')
  }
  if (typeof m.gridHeight !== 'number' || m.gridHeight < 1) {
    errors.push('Map must have gridHeight >= 1')
  }
  if (typeof m.darkForceLimit !== 'number' || m.darkForceLimit < 1) {
    errors.push('Map must have darkForceLimit >= 1')
  }

  // Hexes array
  if (!Array.isArray(m.hexes) || m.hexes.length === 0) {
    errors.push('Map must have a non-empty hexes array')
  }

  // Forts array
  if (!Array.isArray(m.forts)) {
    errors.push('Map must have a forts array')
  }

  // Starting hex
  if (!m.startingHex || typeof m.startingHex !== 'object') {
    errors.push('Map must have a startingHex coordinate')
  } else {
    const sh = m.startingHex as Record<string, unknown>
    if (typeof sh.q !== 'number' || typeof sh.r !== 'number') {
      errors.push('startingHex must have numeric q and r fields')
    }
  }

  // Validate hex entries if hexes array exists
  if (Array.isArray(m.hexes)) {
    for (let i = 0; i < m.hexes.length; i++) {
      const hex = m.hexes[i] as Record<string, unknown>
      if (!hex || typeof hex !== 'object' || !hex.coord) {
        errors.push(`hexes[${i}] must have a coord field`)
      } else {
        const coord = hex.coord as Record<string, unknown>
        if (typeof coord.q !== 'number' || typeof coord.r !== 'number') {
          errors.push(`hexes[${i}].coord must have numeric q and r`)
        }
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Type guard that validates and narrows unknown data to MapDefinition.
 */
export function isValidMapDefinition(map: unknown): map is MapDefinition {
  return validateMap(map).valid
}

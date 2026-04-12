import type { MapDefinition } from '../types/map.types'
import { CALOSANTI_MAP } from './calosanti'

const registry = new Map<string, MapDefinition>()

// Register built-in maps
registry.set(CALOSANTI_MAP.id, CALOSANTI_MAP)

/**
 * Returns the map definition for the given map ID.
 * Returns undefined if the map is not registered.
 */
export function getMap(id: string): MapDefinition | undefined {
  return registry.get(id)
}

/**
 * Returns metadata for all registered maps.
 */
export function listMaps(): Array<{ id: string; name: string; description: string }> {
  return Array.from(registry.values()).map((map) => ({
    id: map.id,
    name: map.name,
    description: map.description,
  }))
}

/**
 * Registers a custom map definition.
 * Overwrites any existing map with the same ID.
 */
export function registerMap(map: MapDefinition): void {
  registry.set(map.id, map)
}

export interface GameRule {
  id: string
  category: string
  title: string
  description: string
  keywords: string[]
}

export interface RuleCategory {
  id: string
  name: string
  rules: GameRule[]
}

export const RULE_CATEGORIES: RuleCategory[] = [
  {
    id: 'core',
    name: 'Core Rules',
    rules: [
      {
        id: 'hex-placement',
        category: 'core',
        title: 'Hex Placement',
        description:
          'Select a claimed hex, then roll a die. The number on the rolled edge determines the exit direction. A new hex is placed in that direction with numbers oriented clockwise starting from the connecting edge.',
        keywords: ['placement', 'claimed', 'roll', 'dice'],
      },
      {
        id: 'dice-edge',
        category: 'core',
        title: 'Dice Determines Direction',
        description:
          'The dice roll picks the exit edge — you don\'t choose the direction. Each edge of a claimed hex has a number (1-6). Roll the die, find that number on the hex, and that\'s where you go.',
        keywords: ['dice', 'edge', 'direction', 'exit'],
      },
      {
        id: 'clockwise-orientation',
        category: 'core',
        title: 'Clockwise Orientation',
        description:
          'Numbers on a newly placed hex are assigned clockwise starting from the connecting edge. The connecting edge gets the rolled number, then numbers increment clockwise (wrapping 6→1).',
        keywords: ['clockwise', 'orientation', 'numbers'],
      },
      {
        id: 'blocking',
        category: 'core',
        title: 'Blocked Hexes',
        description:
          'If the target position is already occupied, the new hex is placed at the next clockwise available position and marked as blocked. If the target is off the map boundary, the source hex itself becomes blocked.',
        keywords: ['blocked', 'occupied', 'boundary', 'off-map'],
      },
      {
        id: 'fort-capture',
        category: 'core',
        title: 'Fort Capture',
        description:
          'Forts are special hexes on the map. A fort is captured when the hex is claimed and has at least one army. Capture more than half the forts to win.',
        keywords: ['fort', 'capture', 'win'],
      },
    ],
  },
  {
    id: 'army',
    name: 'Army Detection',
    rules: [
      {
        id: 'army-matching',
        category: 'army',
        title: 'Army Matching',
        description:
          'When two adjacent claimed hexes have the same number on their shared edge, an army is formed on both sides. Armies are detected automatically after each hex placement.',
        keywords: ['army', 'matching', 'adjacent', 'number'],
      },
    ],
  },
  {
    id: 'dark-force',
    name: 'Dark Force',
    rules: [
      {
        id: 'df-spawning',
        category: 'dark-force',
        title: 'Dark Force Spawning',
        description:
          'When the exit edge connects to an adjacent claimed hex and the numbers on the shared edge do NOT match (and no army or Dark Force exists there), a Dark Force army spawns on both sides of that edge.',
        keywords: ['dark-force', 'spawn', 'mismatch'],
      },
      {
        id: 'df-escalation',
        category: 'dark-force',
        title: 'Dark Force Escalation',
        description:
          'If the exit edge already has a Dark Force army, escalation triggers instead of normal placement. This can cascade — spreading Dark Force to adjacent hexes and increasing the Dark Force tally.',
        keywords: ['dark-force', 'escalation', 'cascade'],
      },
      {
        id: 'df-limit',
        category: 'dark-force',
        title: 'Dark Force Limit',
        description:
          'Each map has a Dark Force army limit (e.g., 25 for Calosanti). If the tally reaches or exceeds this limit, the Dark Force wins and the game is over.',
        keywords: ['dark-force', 'limit', 'loss', 'game-over'],
      },
    ],
  },
  {
    id: 'mountain',
    name: 'Mountains',
    rules: [
      {
        id: 'mountain-block',
        category: 'mountain',
        title: 'Mountain Terrain',
        description:
          'Mountain hexes cannot be claimed. Rolling toward a mountain blocks the source hex — the same as rolling off the map. Mountains are visible on the map before you reach them, so plan your approach.',
        keywords: ['mountain', 'terrain', 'block'],
      },
    ],
  },
  {
    id: 'future-terrain',
    name: 'Future Terrain',
    rules: [
      {
        id: 'forest-placeholder',
        category: 'future-terrain',
        title: 'Forests',
        description: 'Coming in a future update.',
        keywords: ['forest'],
      },
      {
        id: 'lake-placeholder',
        category: 'future-terrain',
        title: 'Lakes',
        description: 'Coming in a future update.',
        keywords: ['lake'],
      },
      {
        id: 'marsh-placeholder',
        category: 'future-terrain',
        title: 'Marshes',
        description: 'Coming in a future update.',
        keywords: ['marsh'],
      },
      {
        id: 'muster-placeholder',
        category: 'future-terrain',
        title: 'Muster Points',
        description: 'Coming in a future update.',
        keywords: ['muster'],
      },
      {
        id: 'ambush-placeholder',
        category: 'future-terrain',
        title: 'Ambush',
        description: 'Coming in a future update.',
        keywords: ['ambush'],
      },
    ],
  },
]

/** Flat map of all rules by ID for quick lookup */
export const RULES_BY_ID = new Map<string, GameRule>(
  RULE_CATEGORIES.flatMap(cat => cat.rules.map(r => [r.id, r]))
)

type DiceMode = 'manual' | 'digital'

let diceMode = $state<DiceMode>('manual')

export function getDiceMode(): DiceMode {
  return diceMode
}

export function toggleDiceMode(): void {
  diceMode = diceMode === 'manual' ? 'digital' : 'manual'
}

export function setDiceMode(mode: DiceMode): void {
  diceMode = mode
}

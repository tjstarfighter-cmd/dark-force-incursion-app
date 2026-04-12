import { describe, it, expect } from 'vitest'

describe('Vitest setup', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should support TypeScript strict mode', () => {
    const value: string = 'hello'
    expect(value).toBe('hello')
  })
})

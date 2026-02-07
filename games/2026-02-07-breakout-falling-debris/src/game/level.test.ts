import { describe, expect, it } from 'vitest'
import { createBrickGrid, pickDebrisType } from './level'

describe('createBrickGrid', () => {
  it('creates a grid with the expected number of bricks', () => {
    const bricks = createBrickGrid({
      rows: 3,
      columns: 6,
      startX: 30,
      startY: 40,
      brickWidth: 50,
      brickHeight: 18,
      gap: 6,
    })

    expect(bricks).toHaveLength(18)
    expect(bricks[0]?.x).toBe(30)
    expect(bricks[0]?.y).toBe(40)
  })
})

describe('pickDebrisType', () => {
  it('returns bonus or hazard variants only', () => {
    const samples = new Set(
      Array.from({ length: 20 }, () => pickDebrisType())
    )

    for (const value of samples) {
      expect(['bonus', 'hazard']).toContain(value)
    }
  })
})

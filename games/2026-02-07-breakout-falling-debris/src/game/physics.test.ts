import { describe, expect, it } from 'vitest'
import {
  computePaddleBounce,
  resolveBrickHit,
  resolveWallCollision,
  circleRectIntersect,
} from './physics'

const baseSpeed = 300

describe('computePaddleBounce', () => {
  it('returns straight up when hitting the paddle center', () => {
    const velocity = computePaddleBounce({
      ballX: 200,
      paddleX: 150,
      paddleWidth: 100,
      speed: baseSpeed,
    })

    expect(Math.abs(velocity.vx)).toBeLessThan(1)
    expect(velocity.vy).toBeLessThan(0)
  })

  it('angles left when hitting left side', () => {
    const velocity = computePaddleBounce({
      ballX: 155,
      paddleX: 150,
      paddleWidth: 100,
      speed: baseSpeed,
    })

    expect(velocity.vx).toBeLessThan(0)
    expect(Math.abs(velocity.vy)).toBeGreaterThan(0)
  })

  it('angles right when hitting right side', () => {
    const velocity = computePaddleBounce({
      ballX: 245,
      paddleX: 150,
      paddleWidth: 100,
      speed: baseSpeed,
    })

    expect(velocity.vx).toBeGreaterThan(0)
    expect(Math.abs(velocity.vy)).toBeGreaterThan(0)
  })
})

describe('resolveBrickHit', () => {
  it('destroys a single-hit brick and awards score', () => {
    const result = resolveBrickHit({
      id: 'b1',
      hitPoints: 1,
      maxHitPoints: 1,
    })

    expect(result.destroyed).toBe(true)
    expect(result.hitPoints).toBe(0)
    expect(result.scoreDelta).toBeGreaterThan(0)
    expect(result.spawnDebris).toBe(true)
  })

  it('weakens a multi-hit brick without destroying it', () => {
    const result = resolveBrickHit({
      id: 'b2',
      hitPoints: 2,
      maxHitPoints: 2,
    })

    expect(result.destroyed).toBe(false)
    expect(result.hitPoints).toBe(1)
    expect(result.scoreDelta).toBeGreaterThan(0)
    expect(result.spawnDebris).toBe(false)
  })
})

describe('resolveWallCollision', () => {
  it('bounces off the left wall', () => {
    const result = resolveWallCollision({
      x: 4,
      y: 120,
      r: 6,
      vx: -150,
      vy: 20,
      bounds: { minX: 0, maxX: 300, minY: 0, maxY: 200 },
    })

    expect(result.vx).toBeGreaterThan(0)
    expect(result.hitWall).toBe(true)
    expect(result.fellOut).toBe(false)
  })

  it('bounces off the top wall', () => {
    const result = resolveWallCollision({
      x: 120,
      y: 3,
      r: 6,
      vx: 40,
      vy: -200,
      bounds: { minX: 0, maxX: 300, minY: 0, maxY: 200 },
    })

    expect(result.vy).toBeGreaterThan(0)
    expect(result.hitWall).toBe(true)
  })

  it('flags a ball that falls below the bottom', () => {
    const result = resolveWallCollision({
      x: 120,
      y: 210,
      r: 6,
      vx: 40,
      vy: 200,
      bounds: { minX: 0, maxX: 300, minY: 0, maxY: 200 },
    })

    expect(result.fellOut).toBe(true)
  })
})

describe('circleRectIntersect', () => {
  it('detects overlap between circle and rectangle', () => {
    const hit = circleRectIntersect({
      circle: { x: 50, y: 50, r: 8 },
      rect: { x: 40, y: 40, width: 20, height: 20 },
    })

    expect(hit).toBe(true)
  })

  it('returns false when shapes are separated', () => {
    const hit = circleRectIntersect({
      circle: { x: 10, y: 10, r: 5 },
      rect: { x: 50, y: 50, width: 20, height: 20 },
    })

    expect(hit).toBe(false)
  })
})

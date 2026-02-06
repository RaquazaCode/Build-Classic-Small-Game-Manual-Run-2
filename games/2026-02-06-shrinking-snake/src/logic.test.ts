import { describe, expect, test } from 'vitest';
import { createRng } from './rng';
import { createInitialState, stepGame } from './logic';
import type { GameState } from './types';

function runningState(overrides: Partial<GameState>): GameState {
  const base = createInitialState('medium', 12345);
  return {
    ...base,
    ...overrides,
    mode: 'running',
    screen: 'playing',
    snake: overrides.snake ?? base.snake,
    food: overrides.food ?? base.food,
    bounds: overrides.bounds ?? base.bounds,
    fireTiles: overrides.fireTiles ?? base.fireTiles
  };
}

describe('difficulty-aware deterministic engine', () => {
  test('seeded RNG produces deterministic sequence', () => {
    const rngA = createRng(99);
    const rngB = createRng(99);

    const sequenceA = [rngA(), rngA(), rngA(), rngA()];
    const sequenceB = [rngB(), rngB(), rngB(), rngB()];

    expect(sequenceA).toEqual(sequenceB);
  });

  test('same seed creates same initial food spawn', () => {
    const a = createInitialState('medium', 2026);
    const b = createInitialState('medium', 2026);

    expect(a.food).toEqual(b.food);
    expect(a.rngState).toEqual(b.rngState);
  });

  test('easy mode spawns food at least 2 tiles from active walls when possible', () => {
    const state = runningState({
      difficulty: 'easy',
      snake: [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
      ],
      direction: 'right',
      queuedDirection: 'right',
      food: { x: 6, y: 5 }
    });

    const next = stepGame(state);

    expect(next.food.x).toBeGreaterThanOrEqual(next.bounds.minX + 2);
    expect(next.food.x).toBeLessThanOrEqual(next.bounds.maxX - 2);
    expect(next.food.y).toBeGreaterThanOrEqual(next.bounds.minY + 2);
    expect(next.food.y).toBeLessThanOrEqual(next.bounds.maxY - 2);
  });

  test('medium mode spawns food at least 1 tile from active walls when possible', () => {
    const state = runningState({
      difficulty: 'medium',
      snake: [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
      ],
      direction: 'right',
      queuedDirection: 'right',
      food: { x: 6, y: 5 }
    });

    const next = stepGame(state);

    expect(next.food.x).toBeGreaterThanOrEqual(next.bounds.minX + 1);
    expect(next.food.x).toBeLessThanOrEqual(next.bounds.maxX - 1);
    expect(next.food.y).toBeGreaterThanOrEqual(next.bounds.minY + 1);
    expect(next.food.y).toBeLessThanOrEqual(next.bounds.maxY - 1);
  });

  test('hard mode may spawn food directly on wall cells', () => {
    const state = runningState({
      difficulty: 'hard',
      bounds: {
        minX: 0,
        maxX: 2,
        minY: 0,
        maxY: 2
      },
      snake: [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0, y: 0 }
      ],
      direction: 'right',
      queuedDirection: 'right',
      food: { x: 2, y: 1 }
    });

    const next = stepGame(state);
    const onWall =
      next.food.x === next.bounds.minX ||
      next.food.x === next.bounds.maxX ||
      next.food.y === next.bounds.minY ||
      next.food.y === next.bounds.maxY;

    expect(onWall).toBe(true);
  });

  test('easy mode never shrinks arena', () => {
    const state = runningState({
      difficulty: 'easy',
      foodPoints: 90,
      snake: [
        { x: 6, y: 5 },
        { x: 5, y: 5 },
        { x: 4, y: 5 }
      ],
      direction: 'right',
      queuedDirection: 'right',
      food: { x: 7, y: 5 }
    });

    const next = stepGame(state);

    expect(next.bounds).toEqual(state.bounds);
    expect(next.shrinkLevel).toBe(0);
  });

  test('medium mode shrinks when passing threshold points', () => {
    const state = runningState({
      difficulty: 'medium',
      foodPoints: 20,
      snake: [
        { x: 6, y: 5 },
        { x: 5, y: 5 },
        { x: 4, y: 5 }
      ],
      direction: 'right',
      queuedDirection: 'right',
      food: { x: 7, y: 5 },
      bounds: {
        minX: 0,
        maxX: 23,
        minY: 0,
        maxY: 17
      }
    });

    const next = stepGame(state);

    expect(next.shrinkLevel).toBe(1);
    expect(next.bounds).toEqual({
      minX: 1,
      maxX: 22,
      minY: 1,
      maxY: 16
    });
  });

  test('hard mode shrinks more aggressively', () => {
    const state = runningState({
      difficulty: 'hard',
      foodPoints: 10,
      snake: [
        { x: 6, y: 5 },
        { x: 5, y: 5 },
        { x: 4, y: 5 }
      ],
      direction: 'right',
      queuedDirection: 'right',
      food: { x: 7, y: 5 },
      bounds: {
        minX: 0,
        maxX: 23,
        minY: 0,
        maxY: 17
      }
    });

    const next = stepGame(state);

    expect(next.shrinkLevel).toBe(1);
    expect(next.bounds).toEqual({
      minX: 1,
      maxX: 22,
      minY: 1,
      maxY: 16
    });
  });
});

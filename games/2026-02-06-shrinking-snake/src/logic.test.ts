import { describe, expect, test } from 'vitest';
import { changeDirection, createInitialState, DEFAULT_CONFIG, stepGame } from './logic';
import type { GameConfig, GameState } from './types';

function withState(overrides: Partial<GameState>): GameState {
  const base = createInitialState(DEFAULT_CONFIG);
  return {
    ...base,
    ...overrides,
    snake: overrides.snake ?? base.snake,
    food: overrides.food ?? base.food,
    bounds: overrides.bounds ?? base.bounds
  };
}

describe('snake logic', () => {
  test('moves one tile in the current direction each tick', () => {
    const state = withState({
      mode: 'running',
      snake: [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
      ],
      direction: 'right',
      queuedDirection: 'right',
      food: { x: 10, y: 10 }
    });

    const next = stepGame(state, DEFAULT_CONFIG);
    expect(next.snake[0]).toEqual({ x: 6, y: 5 });
    expect(next.snake).toHaveLength(3);
  });

  test('prevents direct reverse turns', () => {
    const state = withState({
      mode: 'running',
      direction: 'right',
      queuedDirection: 'right'
    });

    const next = changeDirection(state, 'left');
    expect(next.queuedDirection).toBe('right');
  });

  test('eating food increases score, grows snake, and respawns food', () => {
    const cfg: GameConfig = {
      ...DEFAULT_CONFIG,
      gridWidth: 10,
      gridHeight: 10,
      shrinkEveryPoints: 100
    };

    const state = withState({
      mode: 'running',
      snake: [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
      ],
      direction: 'right',
      queuedDirection: 'right',
      food: { x: 6, y: 5 },
      score: 0
    });

    const next = stepGame(state, cfg);
    expect(next.score).toBe(cfg.scorePerFood);
    expect(next.snake).toHaveLength(4);
    expect(next.food).not.toEqual({ x: 6, y: 5 });
    expect(next.food).not.toEqual(next.snake[0]);
  });

  test('collision with walls ends the run', () => {
    const state = withState({
      mode: 'running',
      snake: [
        { x: 0, y: 5 },
        { x: 1, y: 5 },
        { x: 2, y: 5 }
      ],
      direction: 'left',
      queuedDirection: 'left',
      food: { x: 10, y: 10 }
    });

    const next = stepGame(state, DEFAULT_CONFIG);
    expect(next.mode).toBe('game_over');
  });

  test('collision with self ends the run', () => {
    const state = withState({
      mode: 'running',
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
        { x: 4, y: 6 },
        { x: 5, y: 6 }
      ],
      direction: 'left',
      queuedDirection: 'left',
      food: { x: 10, y: 10 }
    });

    const next = stepGame(state, DEFAULT_CONFIG);
    expect(next.mode).toBe('game_over');
  });

  test('arena shrinks inward when threshold score is reached', () => {
    const cfg: GameConfig = {
      ...DEFAULT_CONFIG,
      scorePerFood: 10,
      shrinkEveryPoints: 20
    };

    const state = withState({
      mode: 'running',
      score: 10,
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

    const next = stepGame(state, cfg);
    expect(next.score).toBe(20);
    expect(next.bounds).toEqual({
      minX: 1,
      maxX: 22,
      minY: 1,
      maxY: 16
    });
    expect(next.shrinkLevel).toBe(1);
  });
});

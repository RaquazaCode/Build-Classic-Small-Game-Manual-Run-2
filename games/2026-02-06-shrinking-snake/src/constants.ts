import type { DifficultyConfig, DifficultyId } from './types';

export const BOARD_WIDTH = 24;
export const BOARD_HEIGHT = 18;

export const DIFFICULTY_CONFIGS: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    tickMs: 130,
    shrinkEveryPoints: 0,
    foodWallMargin: 2,
    fireTileCount: 0,
    scoreMultiplier: 1
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    tickMs: 110,
    shrinkEveryPoints: 25,
    foodWallMargin: 1,
    fireTileCount: 0,
    scoreMultiplier: 1.25
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    tickMs: 90,
    shrinkEveryPoints: 15,
    foodWallMargin: 0,
    fireTileCount: 4,
    scoreMultiplier: 1.5
  }
};

export const DEFAULT_DIFFICULTY: DifficultyId = 'medium';
export const FOOD_POINTS = 10;
export const MAX_FIRE_TILES = 10;

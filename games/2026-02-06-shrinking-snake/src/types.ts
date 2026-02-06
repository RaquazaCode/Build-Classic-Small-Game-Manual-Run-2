export type Direction = 'up' | 'down' | 'left' | 'right';
export type DifficultyId = 'easy' | 'medium' | 'hard';
export type ScreenMode = 'menu' | 'playing' | 'paused' | 'game_over';

export type GameMode = 'ready' | 'running' | 'paused' | 'game_over';

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface DifficultyConfig {
  id: DifficultyId;
  label: string;
  tickMs: number;
  shrinkEveryPoints: number;
  foodWallMargin: number;
  fireTileCount: number;
  scoreMultiplier: number;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  scorePerFood: number;
  shrinkEveryPoints: number;
}

export interface GameState {
  mode: GameMode;
  screen: ScreenMode;
  difficulty: DifficultyId;
  seed: number;
  rngState: number;
  snake: Point[];
  direction: Direction;
  queuedDirection: Direction;
  food: Point;
  fireTiles: Point[];
  score: number;
  bestScore: number;
  foodsEaten: number;
  elapsedMs: number;
  bounds: Bounds;
  shrinkLevel: number;
  tickCount: number;
  foodPoints: number;
}

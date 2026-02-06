export type Direction = 'up' | 'down' | 'left' | 'right';
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

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  scorePerFood: number;
  shrinkEveryPoints: number;
}

export interface GameState {
  mode: GameMode;
  snake: Point[];
  direction: Direction;
  queuedDirection: Direction;
  food: Point;
  score: number;
  bestScore: number;
  bounds: Bounds;
  shrinkLevel: number;
  tickCount: number;
}

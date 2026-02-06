import type { Direction, GameConfig, GameState } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  gridWidth: 24,
  gridHeight: 18,
  scorePerFood: 10,
  shrinkEveryPoints: 30
};

export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
  throw new Error(`Not implemented: ${config.gridWidth}`);
}

export function changeDirection(state: GameState, nextDirection: Direction): GameState {
  throw new Error(`Not implemented: ${nextDirection} ${state.mode}`);
}

export function stepGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
  throw new Error(`Not implemented: ${config.gridHeight} ${state.tickCount}`);
}

export function resetGame(bestScore = 0, config: GameConfig = DEFAULT_CONFIG): GameState {
  throw new Error(`Not implemented: ${bestScore} ${config.shrinkEveryPoints}`);
}

import type { Bounds, Direction, GameConfig, GameState, Point } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  gridWidth: 24,
  gridHeight: 18,
  scorePerFood: 10,
  shrinkEveryPoints: 30
};

const DIRECTION_DELTAS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function inBounds(point: Point, bounds: Bounds): boolean {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}

function shrinkBounds(bounds: Bounds): Bounds {
  return {
    minX: bounds.minX + 1,
    maxX: bounds.maxX - 1,
    minY: bounds.minY + 1,
    maxY: bounds.maxY - 1
  };
}

function canShrink(bounds: Bounds): boolean {
  return bounds.maxX - bounds.minX > 2 && bounds.maxY - bounds.minY > 2;
}

function spawnFood(snake: Point[], bounds: Bounds): Point | null {
  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const candidate = { x, y };
      if (!snake.some((segment) => pointsEqual(segment, candidate))) {
        return candidate;
      }
    }
  }
  return null;
}

function withGameOver(state: GameState): GameState {
  return {
    ...state,
    mode: 'game_over',
    bestScore: Math.max(state.bestScore, state.score)
  };
}

export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
  const centerX = Math.floor(config.gridWidth / 2);
  const centerY = Math.floor(config.gridHeight / 2);
  const snake: Point[] = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];

  const bounds: Bounds = {
    minX: 0,
    maxX: config.gridWidth - 1,
    minY: 0,
    maxY: config.gridHeight - 1
  };

  const food = spawnFood(snake, bounds) ?? { x: 0, y: 0 };

  return {
    mode: 'ready',
    snake,
    direction: 'right',
    queuedDirection: 'right',
    food,
    score: 0,
    bestScore: 0,
    bounds,
    shrinkLevel: 0,
    tickCount: 0
  };
}

export function changeDirection(state: GameState, nextDirection: Direction): GameState {
  if (state.mode === 'game_over') {
    return state;
  }

  if (OPPOSITE_DIRECTION[state.direction] === nextDirection) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection
  };
}

export function stepGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
  if (state.mode !== 'running') {
    return state;
  }

  const movement = DIRECTION_DELTAS[state.queuedDirection];
  const nextHead = {
    x: state.snake[0].x + movement.x,
    y: state.snake[0].y + movement.y
  };

  if (!inBounds(nextHead, state.bounds)) {
    return withGameOver({
      ...state,
      direction: state.queuedDirection,
      tickCount: state.tickCount + 1
    });
  }

  const eatsFood = pointsEqual(nextHead, state.food);
  const collisionBody = eatsFood ? state.snake : state.snake.slice(0, -1);

  if (collisionBody.some((segment) => pointsEqual(segment, nextHead))) {
    return withGameOver({
      ...state,
      direction: state.queuedDirection,
      tickCount: state.tickCount + 1
    });
  }

  const nextSnake = eatsFood
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)];

  const nextScore = eatsFood ? state.score + config.scorePerFood : state.score;
  let nextBounds = state.bounds;
  let nextShrinkLevel = state.shrinkLevel;

  if (
    eatsFood &&
    config.shrinkEveryPoints > 0 &&
    nextScore > 0 &&
    nextScore % config.shrinkEveryPoints === 0 &&
    canShrink(state.bounds)
  ) {
    nextBounds = shrinkBounds(state.bounds);
    nextShrinkLevel = state.shrinkLevel + 1;
  }

  if (!nextSnake.every((segment) => inBounds(segment, nextBounds))) {
    return withGameOver({
      ...state,
      snake: nextSnake,
      score: nextScore,
      bounds: nextBounds,
      shrinkLevel: nextShrinkLevel,
      direction: state.queuedDirection,
      tickCount: state.tickCount + 1
    });
  }

  const nextFood = eatsFood ? spawnFood(nextSnake, nextBounds) : state.food;

  if (!nextFood) {
    return withGameOver({
      ...state,
      snake: nextSnake,
      score: nextScore,
      bounds: nextBounds,
      shrinkLevel: nextShrinkLevel,
      direction: state.queuedDirection,
      tickCount: state.tickCount + 1
    });
  }

  return {
    ...state,
    snake: nextSnake,
    direction: state.queuedDirection,
    food: nextFood,
    score: nextScore,
    bestScore: Math.max(state.bestScore, nextScore),
    bounds: nextBounds,
    shrinkLevel: nextShrinkLevel,
    tickCount: state.tickCount + 1
  };
}

export function resetGame(bestScore = 0, config: GameConfig = DEFAULT_CONFIG): GameState {
  return {
    ...createInitialState(config),
    bestScore
  };
}

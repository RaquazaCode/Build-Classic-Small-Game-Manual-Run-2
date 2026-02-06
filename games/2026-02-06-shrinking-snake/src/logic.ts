import { BOARD_HEIGHT, BOARD_WIDTH, DEFAULT_DIFFICULTY, DIFFICULTY_CONFIGS, FOOD_POINTS } from './constants';
import { createSeed, nextRandom } from './rng';
import type {
  Bounds,
  DifficultyConfig,
  DifficultyId,
  Direction,
  GameConfig,
  GameState,
  Point
} from './types';

export const DEFAULT_CONFIG: GameConfig = {
  gridWidth: BOARD_WIDTH,
  gridHeight: BOARD_HEIGHT,
  scorePerFood: FOOD_POINTS,
  shrinkEveryPoints: DIFFICULTY_CONFIGS[DEFAULT_DIFFICULTY].shrinkEveryPoints
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

function pointKey(point: Point): string {
  return `${point.x},${point.y}`;
}

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

function getSpawnCandidates(
  bounds: Bounds,
  occupied: Set<string>,
  wallMargin: number
): Point[] {
  const candidates: Point[] = [];

  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      if (
        x < bounds.minX + wallMargin ||
        x > bounds.maxX - wallMargin ||
        y < bounds.minY + wallMargin ||
        y > bounds.maxY - wallMargin
      ) {
        continue;
      }

      const key = `${x},${y}`;
      if (occupied.has(key)) {
        continue;
      }

      candidates.push({ x, y });
    }
  }

  return candidates;
}

function pickRandomPoint(candidates: Point[], rngState: number): { point: Point | null; rngState: number } {
  if (candidates.length === 0) {
    return { point: null, rngState };
  }

  const step = nextRandom(rngState);
  const index = Math.min(candidates.length - 1, Math.floor(step.value * candidates.length));

  return {
    point: candidates[index],
    rngState: step.state
  };
}

function spawnFood(
  snake: Point[],
  bounds: Bounds,
  fireTiles: Point[],
  minimumWallMargin: number,
  rngState: number
): { point: Point | null; rngState: number } {
  const occupied = new Set<string>();

  snake.forEach((segment) => occupied.add(pointKey(segment)));
  fireTiles.forEach((tile) => occupied.add(pointKey(tile)));

  for (let margin = minimumWallMargin; margin >= 0; margin -= 1) {
    const candidates = getSpawnCandidates(bounds, occupied, margin);
    if (candidates.length > 0) {
      return pickRandomPoint(candidates, rngState);
    }
  }

  return { point: null, rngState };
}

function withGameOver(state: GameState): GameState {
  return {
    ...state,
    mode: 'game_over',
    screen: 'game_over',
    bestScore: Math.max(state.bestScore, state.score)
  };
}

export function getDifficultyConfig(difficulty: DifficultyId): DifficultyConfig {
  return DIFFICULTY_CONFIGS[difficulty];
}

export function createInitialState(
  difficulty: DifficultyId = DEFAULT_DIFFICULTY,
  seed: number = createSeed(),
  bestScore = 0
): GameState {
  const normalizedSeed = seed >>> 0;
  const config = getDifficultyConfig(difficulty);

  const centerX = Math.floor(BOARD_WIDTH / 2);
  const centerY = Math.floor(BOARD_HEIGHT / 2);
  const snake: Point[] = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];

  const bounds: Bounds = {
    minX: 0,
    maxX: BOARD_WIDTH - 1,
    minY: 0,
    maxY: BOARD_HEIGHT - 1
  };

  const spawn = spawnFood(snake, bounds, [], config.foodWallMargin, normalizedSeed);

  return {
    mode: 'ready',
    screen: 'playing',
    difficulty,
    seed: normalizedSeed,
    rngState: spawn.rngState,
    snake,
    direction: 'right',
    queuedDirection: 'right',
    food: spawn.point ?? { x: centerX, y: centerY - 1 },
    fireTiles: [],
    score: 0,
    bestScore,
    foodsEaten: 0,
    elapsedMs: 0,
    bounds,
    shrinkLevel: 0,
    tickCount: 0,
    foodPoints: 0
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

export function stepGame(state: GameState): GameState {
  if (state.mode !== 'running') {
    return state;
  }

  const difficultyConfig = getDifficultyConfig(state.difficulty);
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

  if (state.fireTiles.some((tile) => pointsEqual(tile, nextHead))) {
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

  const nextFoodsEaten = eatsFood ? state.foodsEaten + 1 : state.foodsEaten;
  const nextFoodPoints = eatsFood ? state.foodPoints + FOOD_POINTS : state.foodPoints;
  const nextScore = nextFoodsEaten * FOOD_POINTS;

  let nextBounds = state.bounds;
  let nextShrinkLevel = state.shrinkLevel;

  if (eatsFood && difficultyConfig.shrinkEveryPoints > 0) {
    const targetShrinkLevel = Math.floor(nextFoodPoints / difficultyConfig.shrinkEveryPoints);

    while (nextShrinkLevel < targetShrinkLevel && canShrink(nextBounds)) {
      nextBounds = shrinkBounds(nextBounds);
      nextShrinkLevel += 1;
    }
  }

  if (!nextSnake.every((segment) => inBounds(segment, nextBounds))) {
    return withGameOver({
      ...state,
      snake: nextSnake,
      score: nextScore,
      foodsEaten: nextFoodsEaten,
      foodPoints: nextFoodPoints,
      bounds: nextBounds,
      shrinkLevel: nextShrinkLevel,
      direction: state.queuedDirection,
      tickCount: state.tickCount + 1
    });
  }

  let nextFood = state.food;
  let nextRngState = state.rngState;

  if (eatsFood) {
    const spawn = spawnFood(
      nextSnake,
      nextBounds,
      state.fireTiles,
      difficultyConfig.foodWallMargin,
      state.rngState
    );

    if (!spawn.point) {
      return withGameOver({
        ...state,
        snake: nextSnake,
        score: nextScore,
        foodsEaten: nextFoodsEaten,
        foodPoints: nextFoodPoints,
        bounds: nextBounds,
        shrinkLevel: nextShrinkLevel,
        direction: state.queuedDirection,
        tickCount: state.tickCount + 1
      });
    }

    nextFood = spawn.point;
    nextRngState = spawn.rngState;
  }

  return {
    ...state,
    snake: nextSnake,
    direction: state.queuedDirection,
    food: nextFood,
    rngState: nextRngState,
    score: nextScore,
    foodsEaten: nextFoodsEaten,
    foodPoints: nextFoodPoints,
    bestScore: Math.max(state.bestScore, nextScore),
    bounds: nextBounds,
    shrinkLevel: nextShrinkLevel,
    tickCount: state.tickCount + 1
  };
}

export function resetGame(
  bestScore = 0,
  difficulty: DifficultyId = DEFAULT_DIFFICULTY,
  seed: number = createSeed()
): GameState {
  return createInitialState(difficulty, seed, bestScore);
}

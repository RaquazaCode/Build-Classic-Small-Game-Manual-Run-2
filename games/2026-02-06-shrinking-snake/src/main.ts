import './style.css';
import { BOARD_HEIGHT, BOARD_WIDTH, DEFAULT_DIFFICULTY, DIFFICULTY_CONFIGS } from './constants';
import { advanceElapsed, changeDirection, createInitialState, resetGame, stepGame } from './logic';
import type { Direction, GameMode, GameState } from './types';

declare global {
  interface Window {
    render_game_to_text: () => string;
    advanceTime: (ms: number) => void;
  }
}

const MAX_ACCUMULATOR_MS = 1000;
const PADDING = 20;

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}

function require2dContext(targetCanvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = targetCanvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context not available');
  }
  return context;
}

const app = requireElement<HTMLDivElement>('#app');

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <h1>Shrinking Snake</h1>
      <p>Classic grid snake with collapsing walls.</p>
    </header>
    <canvas id="game-canvas" aria-label="Shrinking Snake game canvas"></canvas>
    <div class="hud" id="hud-text"></div>
  </main>
`;

const canvas = requireElement<HTMLCanvasElement>('#game-canvas');
const hudText = requireElement<HTMLDivElement>('#hud-text');
const ctx = require2dContext(canvas);

let state: GameState = createInitialState(DEFAULT_DIFFICULTY);
let accumulator = 0;
let lastFrameTime = performance.now();

function currentTickMs(): number {
  return DIFFICULTY_CONFIGS[state.difficulty].tickMs;
}

function colorForMode(mode: GameMode): string {
  switch (mode) {
    case 'ready':
      return '#8de59a';
    case 'running':
      return '#ffcf6a';
    case 'paused':
      return '#7dc3ff';
    case 'game_over':
      return '#ff8b8b';
    default:
      return '#ffffff';
  }
}

function directionFromKey(key: string): Direction | null {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return 'up';
    case 'ArrowDown':
    case 's':
    case 'S':
      return 'down';
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return 'left';
    case 'ArrowRight':
    case 'd':
    case 'D':
      return 'right';
    default:
      return null;
  }
}

function formatDuration(totalMs: number): string {
  const totalSeconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function resizeCanvas(): void {
  const ratio = BOARD_WIDTH / BOARD_HEIGHT;
  const maxWidth = Math.min(window.innerWidth - 32, 980);
  const maxHeight = Math.min(window.innerHeight - 200, 720);

  let cssWidth = maxWidth;
  let cssHeight = cssWidth / ratio;

  if (cssHeight > maxHeight) {
    cssHeight = maxHeight;
    cssWidth = cssHeight * ratio;
  }

  cssWidth = Math.max(cssWidth, 320);
  cssHeight = Math.max(cssHeight, 240);

  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function boardMetrics() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const cell = Math.floor(
    Math.min(
      (width - PADDING * 2) / BOARD_WIDTH,
      (height - PADDING * 2) / BOARD_HEIGHT
    )
  );

  const boardWidth = cell * BOARD_WIDTH;
  const boardHeight = cell * BOARD_HEIGHT;

  return {
    cell,
    x: Math.floor((width - boardWidth) / 2),
    y: Math.floor((height - boardHeight) / 2),
    width: boardWidth,
    height: boardHeight
  };
}

function fillBackground(width: number, height: number): void {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0b1324');
  gradient.addColorStop(1, '#16243f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i < width; i += 30) {
    ctx.fillRect(i, 0, 1, height);
  }
}

function drawBoard(): void {
  const { cell, x, y, width, height } = boardMetrics();
  const pulse = Math.sin(state.tickCount * 0.2) * 0.5 + 0.5;

  ctx.fillStyle = '#1c2a46';
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = '#4f6ea5';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  for (let gy = 0; gy < BOARD_HEIGHT; gy += 1) {
    for (let gx = 0; gx < BOARD_WIDTH; gx += 1) {
      const outOfBounds =
        gx < state.bounds.minX ||
        gx > state.bounds.maxX ||
        gy < state.bounds.minY ||
        gy > state.bounds.maxY;

      if (outOfBounds) {
        ctx.fillStyle = `rgba(167, 45, 45, ${0.3 + pulse * 0.35})`;
        ctx.fillRect(x + gx * cell, y + gy * cell, cell, cell);
      }
    }
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let gx = 1; gx < BOARD_WIDTH; gx += 1) {
    const lineX = x + gx * cell;
    ctx.beginPath();
    ctx.moveTo(lineX, y);
    ctx.lineTo(lineX, y + height);
    ctx.stroke();
  }
  for (let gy = 1; gy < BOARD_HEIGHT; gy += 1) {
    const lineY = y + gy * cell;
    ctx.beginPath();
    ctx.moveTo(x, lineY);
    ctx.lineTo(x + width, lineY);
    ctx.stroke();
  }

  ctx.fillStyle = '#f76f6f';
  const foodX = x + state.food.x * cell + cell / 2;
  const foodY = y + state.food.y * cell + cell / 2;
  ctx.beginPath();
  ctx.arc(foodX, foodY, cell * (0.24 + pulse * 0.08), 0, Math.PI * 2);
  ctx.fill();

  state.fireTiles.forEach((tile, idx) => {
    const fireX = x + tile.x * cell;
    const fireY = y + tile.y * cell;
    const glow = (Math.sin((state.tickCount + idx) * 0.45) + 1) / 2;

    ctx.fillStyle = '#4d1808';
    ctx.fillRect(fireX + 1, fireY + 1, cell - 2, cell - 2);

    ctx.fillStyle = `rgba(255, 120, 40, ${0.65 + glow * 0.25})`;
    ctx.fillRect(fireX + 2, fireY + cell * 0.45, cell - 4, cell * 0.5 - 2);

    ctx.fillStyle = `rgba(255, 205, 65, ${0.5 + glow * 0.4})`;
    ctx.fillRect(fireX + cell * 0.28, fireY + cell * 0.2, cell * 0.44, cell * 0.45);
  });

  state.snake.forEach((segment, index) => {
    const segmentX = x + segment.x * cell;
    const segmentY = y + segment.y * cell;
    ctx.fillStyle = index === 0 ? '#99f6a4' : '#54b76e';
    ctx.fillRect(segmentX + 1, segmentY + 1, cell - 2, cell - 2);
  });

  if (state.mode !== 'running') {
    ctx.fillStyle = 'rgba(5, 8, 15, 0.68)';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#f6f8ff';
    ctx.textAlign = 'center';
    ctx.font = '700 28px "American Typewriter", "Trebuchet MS", serif';

    const modeText =
      state.mode === 'ready'
        ? 'Press an Arrow Key or WASD to Begin'
        : state.mode === 'paused'
          ? 'Paused - Press P to Resume'
          : 'Game Over - Press R to Restart';

    ctx.fillText(modeText, x + width / 2, y + height / 2 - 8);
    ctx.font = '500 16px "Trebuchet MS", sans-serif';
    ctx.fillText('Eat food, avoid walls, and survive each arena collapse.', x + width / 2, y + height / 2 + 26);
  }
}

function render(): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  fillBackground(width, height);
  drawBoard();

  const modeLabel = state.mode.replace('_', ' ').toUpperCase();
  hudText.innerHTML = `
    <span><strong>Difficulty:</strong> ${state.difficulty.toUpperCase()}</span>
    <span><strong>Time:</strong> ${formatDuration(state.elapsedMs)}</span>
    <span><strong>Foods:</strong> ${state.foodsEaten}</span>
    <span><strong>Score:</strong> ${state.score}</span>
    <span><strong>Best:</strong> ${state.bestScore}</span>
    <span><strong>Shrink:</strong> ${state.shrinkLevel}</span>
    <span style="color:${colorForMode(state.mode)}"><strong>Mode:</strong> ${modeLabel}</span>
    <span><strong>Controls:</strong> Move Arrows/WASD, Pause P, Reset R, Fullscreen F</span>
  `;
}

function stepOneTick(): void {
  state = stepGame(state);
}

function runSimulation(deltaMs: number): void {
  if (state.mode !== 'running') {
    return;
  }

  state = advanceElapsed(state, deltaMs);
  accumulator = Math.min(accumulator + deltaMs, MAX_ACCUMULATOR_MS);

  const tickMs = currentTickMs();

  while (accumulator >= tickMs) {
    stepOneTick();
    accumulator -= tickMs;
    if (state.mode !== 'running') {
      accumulator = 0;
      break;
    }
  }
}

function ensurePlayableStateForDirectionInput(): void {
  if (state.mode === 'game_over') {
    state = resetGame(state.bestScore, state.difficulty);
  }
  if (state.mode === 'ready') {
    state = {
      ...state,
      mode: 'running'
    };
  }
}

function togglePause(): void {
  if (state.mode === 'running') {
    state = { ...state, mode: 'paused' };
  } else if (state.mode === 'paused') {
    state = { ...state, mode: 'running' };
  }
}

async function toggleFullscreen(): Promise<void> {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }

  await app.requestFullscreen();
}

function handleKeyDown(event: KeyboardEvent): void {
  const direction = directionFromKey(event.key);
  if (direction) {
    event.preventDefault();
    ensurePlayableStateForDirectionInput();
    state = changeDirection(state, direction);
    return;
  }

  if (event.key === 'p' || event.key === 'P') {
    event.preventDefault();
    togglePause();
    return;
  }

  if (event.key === 'r' || event.key === 'R') {
    event.preventDefault();
    state = resetGame(state.bestScore, state.difficulty);
    accumulator = 0;
    return;
  }

  if (event.key === 'f' || event.key === 'F') {
    event.preventDefault();
    void toggleFullscreen();
  }
}

window.render_game_to_text = () => {
  return JSON.stringify({
    coordinateSystem: 'origin at top-left, x increases right, y increases down, units are grid cells',
    mode: state.mode,
    score: state.score,
    bestScore: state.bestScore,
    shrinkLevel: state.shrinkLevel,
    tickCount: state.tickCount,
    difficulty: state.difficulty,
    elapsedMs: state.elapsedMs,
    foodsEaten: state.foodsEaten,
    bounds: state.bounds,
    direction: state.direction,
    queuedDirection: state.queuedDirection,
    snake: state.snake,
    food: state.food,
    fireTiles: state.fireTiles
  });
};

window.advanceTime = (ms: number) => {
  const tickMs = currentTickMs();
  const steps = Math.max(1, Math.round(ms / tickMs));
  for (let i = 0; i < steps; i += 1) {
    if (state.mode !== 'running') {
      break;
    }
    state = advanceElapsed(state, tickMs);
    stepOneTick();
  }
  render();
};

function frame(now: number): void {
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  runSimulation(delta);
  render();
  window.requestAnimationFrame(frame);
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('resize', () => {
  resizeCanvas();
  render();
});

document.addEventListener('fullscreenchange', () => {
  resizeCanvas();
  render();
});

resizeCanvas();
render();
window.requestAnimationFrame(frame);

import './style.css';
import { BOARD_HEIGHT, BOARD_WIDTH, DEFAULT_DIFFICULTY, DIFFICULTY_CONFIGS } from './constants';
import { createAudioController } from './audio';
import { createSeed } from './rng';
import { renderFrame } from './render';
import { advanceElapsed, changeDirection, createInitialState, resetGame, stepGame } from './logic';
import { loadLeaderboard, saveLeaderboardEntry } from './storage';
import type { DifficultyId, Direction, GameMode, GameState, ScreenMode } from './types';

declare global {
  interface Window {
    render_game_to_text: () => string;
    advanceTime: (ms: number) => void;
  }
}

const MAX_ACCUMULATOR_MS = 1000;

const DIFFICULTY_ORDER: DifficultyId[] = ['easy', 'medium', 'hard'];

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
    <section class="menu-panel" id="menu-panel">
      <p class="menu-label">Select Difficulty</p>
      <div class="menu-buttons" id="menu-buttons">
        <button type="button" data-difficulty="easy">Easy</button>
        <button type="button" data-difficulty="medium">Medium</button>
        <button type="button" data-difficulty="hard">Hard</button>
      </div>
      <p class="menu-help">Keyboard: 1/2/3 or Arrow keys + Enter</p>
    </section>
    <canvas id="game-canvas" aria-label="Shrinking Snake game canvas"></canvas>
    <div class="hud" id="hud-text"></div>
  </main>
`;

const canvas = requireElement<HTMLCanvasElement>('#game-canvas');
const hudText = requireElement<HTMLDivElement>('#hud-text');
const menuPanel = requireElement<HTMLElement>('#menu-panel');
const menuButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-difficulty]'));
const ctx = require2dContext(canvas);
const audio = createAudioController();

let screen: ScreenMode = 'menu';
let selectedDifficulty: DifficultyId = DEFAULT_DIFFICULTY;
let state: GameState | null = null;
let accumulator = 0;
let lastFrameTime = performance.now();
let menuAnimationMs = 0;
let leaderboard = loadLeaderboard();
let gameOverPersisted = false;

function currentTickMs(): number {
  if (state) {
    return DIFFICULTY_CONFIGS[state.difficulty].tickMs;
  }
  return DIFFICULTY_CONFIGS[selectedDifficulty].tickMs;
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

function formatDuration(totalMs: number): string {
  const totalSeconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

function getCurrentBestScore(): number {
  const localBest = leaderboard[0]?.score ?? 0;
  const sessionBest = state?.bestScore ?? 0;
  return Math.max(localBest, sessionBest);
}

function recordGameOverResult(gameState: GameState): void {
  if (gameOverPersisted) {
    return;
  }

  leaderboard = saveLeaderboardEntry({
    score: gameState.score,
    elapsedSeconds: Math.floor(gameState.elapsedMs / 1000),
    foodsEaten: gameState.foodsEaten,
    difficulty: gameState.difficulty,
    date: new Date().toISOString(),
    seed: gameState.seed
  });

  gameOverPersisted = true;
  void audio.playGameOverSting();
}

function startGame(difficulty: DifficultyId): void {
  selectedDifficulty = difficulty;
  const seed = createSeed();
  state = createInitialState(difficulty, seed, getCurrentBestScore());
  state = {
    ...state,
    mode: 'running',
    screen: 'playing'
  };
  screen = 'playing';
  accumulator = 0;
  gameOverPersisted = false;
  syncMenuUi();
  void audio.startGameMusic();
}

function showMenu(): void {
  screen = 'menu';
  if (state) {
    state = {
      ...state,
      mode: 'ready',
      screen: 'menu'
    };
  }
  syncMenuUi();
  void audio.startMenuMusic();
}

function cycleDifficulty(offset: number): void {
  const currentIndex = DIFFICULTY_ORDER.indexOf(selectedDifficulty);
  const nextIndex = (currentIndex + offset + DIFFICULTY_ORDER.length) % DIFFICULTY_ORDER.length;
  selectedDifficulty = DIFFICULTY_ORDER[nextIndex];
  syncMenuUi();
}

function syncMenuUi(): void {
  const showMenuPanel = screen === 'menu';
  menuPanel.style.display = showMenuPanel ? 'grid' : 'none';

  menuButtons.forEach((button) => {
    const difficulty = button.dataset.difficulty as DifficultyId;
    const active = difficulty === selectedDifficulty;
    button.classList.toggle('is-selected', active);
  });
}

function resizeCanvas(): void {
  const ratio = BOARD_WIDTH / BOARD_HEIGHT;
  const maxWidth = Math.min(window.innerWidth - 32, 980);
  const maxHeight = Math.min(window.innerHeight - 220, 720);

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

function renderHud(): void {
  if (screen === 'menu') {
    const top = leaderboard[0];
    hudText.innerHTML = `
      <span><strong>Mode:</strong> MENU</span>
      <span><strong>Pick:</strong> Easy, Medium, or Hard</span>
      <span><strong>Top Score:</strong> ${top ? top.score : 0}</span>
      <span><strong>Top Time:</strong> ${top ? `${top.elapsedSeconds}s` : '0s'}</span>
      <span><strong>Controls:</strong> 1/2/3, Enter, Arrow keys</span>
    `;
    return;
  }

  if (!state) {
    hudText.innerHTML = '';
    return;
  }

  const modeLabel = state.mode.replace('_', ' ').toUpperCase();
  const allTimeBest = Math.max(leaderboard[0]?.score ?? 0, state.bestScore);
  hudText.innerHTML = `
    <span><strong>Difficulty:</strong> ${state.difficulty.toUpperCase()}</span>
    <span><strong>Time:</strong> ${formatDuration(state.elapsedMs)}</span>
    <span><strong>Foods:</strong> ${state.foodsEaten}</span>
    <span><strong>Score:</strong> ${state.score}</span>
    <span><strong>Best:</strong> ${allTimeBest}</span>
    <span><strong>Shrink:</strong> ${state.shrinkLevel}</span>
    <span style="color:${colorForMode(state.mode)}"><strong>Mode:</strong> ${modeLabel}</span>
    <span><strong>Controls:</strong> Move Arrows/WASD, Pause P, Reset R, Menu M, Fullscreen F</span>
  `;
}

function render(): void {
  renderFrame({
    canvas,
    ctx,
    screen,
    game: state,
    menuAnimationMs,
    selectedDifficulty
  });
  renderHud();
}

function stepOneTick(): void {
  if (!state) {
    return;
  }
  state = stepGame(state);
}

function runSimulation(deltaMs: number): void {
  if (screen === 'menu') {
    menuAnimationMs += deltaMs;
    return;
  }

  if (!state || state.mode !== 'running') {
    return;
  }

  state = advanceElapsed(state, deltaMs);
  accumulator = Math.min(accumulator + deltaMs, MAX_ACCUMULATOR_MS);

  const tickMs = currentTickMs();
  while (accumulator >= tickMs) {
    stepOneTick();
    accumulator -= tickMs;

    if (!state || state.mode !== 'running') {
      accumulator = 0;
      break;
    }
  }

  if (state && state.mode === 'game_over') {
    recordGameOverResult(state);
  }
}

function togglePause(): void {
  if (!state) {
    return;
  }

  if (state.mode === 'running') {
    state = { ...state, mode: 'paused', screen: 'paused' };
  } else if (state.mode === 'paused') {
    state = { ...state, mode: 'running', screen: 'playing' };
  }
}

async function toggleFullscreen(): Promise<void> {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }

  await app.requestFullscreen();
}

function handleMenuKey(event: KeyboardEvent): boolean {
  void audio.startMenuMusic();

  if (event.key === '1') {
    event.preventDefault();
    startGame('easy');
    return true;
  }

  if (event.key === '2') {
    event.preventDefault();
    startGame('medium');
    return true;
  }

  if (event.key === '3') {
    event.preventDefault();
    startGame('hard');
    return true;
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    event.preventDefault();
    cycleDifficulty(-1);
    return true;
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault();
    cycleDifficulty(1);
    return true;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    startGame(selectedDifficulty);
    return true;
  }

  return false;
}

function handleGameKey(event: KeyboardEvent): boolean {
  if (!state) {
    return false;
  }

  const direction = directionFromKey(event.key);
  if (direction && state.mode === 'running') {
    event.preventDefault();
    state = changeDirection(state, direction);
    return true;
  }

  if (event.key === 'p' || event.key === 'P') {
    event.preventDefault();
    togglePause();
    return true;
  }

  if (event.key === 'r' || event.key === 'R') {
    event.preventDefault();
    state = resetGame(state.bestScore, state.difficulty, createSeed());
    state = { ...state, mode: 'running', screen: 'playing' };
    accumulator = 0;
    gameOverPersisted = false;
    void audio.startGameMusic();
    return true;
  }

  if (event.key === 'm' || event.key === 'M') {
    event.preventDefault();
    showMenu();
    return true;
  }

  if (event.key === 'f' || event.key === 'F') {
    event.preventDefault();
    void toggleFullscreen();
    return true;
  }

  return false;
}

function handleKeyDown(event: KeyboardEvent): void {
  if (screen === 'menu') {
    if (handleMenuKey(event)) {
      return;
    }
  }

  if (screen !== 'menu') {
    handleGameKey(event);
  }
}

menuButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const difficulty = button.dataset.difficulty as DifficultyId;
    if (!difficulty) {
      return;
    }
    void audio.startMenuMusic();
    startGame(difficulty);
  });
});

window.addEventListener('pointerdown', () => {
  if (screen === 'menu') {
    void audio.prime();
    void audio.startMenuMusic();
  }
});

window.render_game_to_text = () => {
  if (screen === 'menu' || !state) {
    return JSON.stringify({
      coordinateSystem: 'origin at top-left, x increases right, y increases down, units are grid cells',
      screen,
      selectedDifficulty,
      menuAnimationMs,
      leaderboardTop: leaderboard[0] ?? null
    });
  }

  return JSON.stringify({
    coordinateSystem: 'origin at top-left, x increases right, y increases down, units are grid cells',
    screen,
    mode: state.mode,
    difficulty: state.difficulty,
    score: state.score,
    bestScore: state.bestScore,
    foodsEaten: state.foodsEaten,
    elapsedMs: state.elapsedMs,
    shrinkLevel: state.shrinkLevel,
    tickCount: state.tickCount,
    bounds: state.bounds,
    direction: state.direction,
    queuedDirection: state.queuedDirection,
    snake: state.snake,
    food: state.food,
    fireTiles: state.fireTiles,
    leaderboardTop: leaderboard[0] ?? null
  });
};

window.advanceTime = (ms: number) => {
  if (screen === 'menu') {
    menuAnimationMs += ms;
    render();
    return;
  }

  if (!state) {
    render();
    return;
  }

  const tickMs = currentTickMs();
  const steps = Math.max(1, Math.round(ms / tickMs));

  for (let i = 0; i < steps; i += 1) {
    if (state.mode !== 'running') {
      break;
    }
    state = advanceElapsed(state, tickMs);
    state = stepGame(state);
  }

  if (state.mode === 'game_over') {
    recordGameOverResult(state);
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

syncMenuUi();
resizeCanvas();
render();
window.requestAnimationFrame(frame);

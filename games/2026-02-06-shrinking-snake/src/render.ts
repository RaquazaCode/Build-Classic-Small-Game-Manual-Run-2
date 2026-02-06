import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import type { DifficultyId, GameState, ScreenMode } from './types';

const PADDING = 20;

export interface RenderFrameInput {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  screen: ScreenMode;
  game: GameState | null;
  menuAnimationMs: number;
  selectedDifficulty: DifficultyId;
}

function boardMetrics(canvas: HTMLCanvasElement) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const cell = Math.floor(
    Math.min((width - PADDING * 2) / BOARD_WIDTH, (height - PADDING * 2) / BOARD_HEIGHT)
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

function fillBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
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

function drawMenuScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  animationMs: number,
  selectedDifficulty: DifficultyId
): void {
  const cycleWidth = width + 960;
  const movement = ((animationMs * 0.18) % cycleWidth) - 480;
  const headX = width + 420 - movement;
  const headY = height * 0.58;
  const cell = Math.max(26, Math.floor(Math.min(width, height) * 0.05));

  const pelletBaseX = width * 0.15;
  const pelletSpacing = cell * 2;
  const pelletCount = 8;

  ctx.fillStyle = 'rgba(11, 17, 32, 0.8)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(85, 128, 210, 0.25)';
  for (let y = 0; y < height; y += 28) {
    ctx.fillRect(0, y, width, 1);
  }

  const openPhase = (Math.sin(animationMs * 0.012) + 1) / 2;
  const mouthCut = Math.floor(cell * (0.35 + openPhase * 0.3));

  for (let i = 0; i < pelletCount; i += 1) {
    const px = pelletBaseX + i * pelletSpacing;
    const py = headY - cell * 0.45;

    if (px < headX - mouthCut) {
      ctx.fillStyle = '#ff8e6b';
      ctx.fillRect(px, py, Math.max(6, Math.floor(cell * 0.2)), Math.max(6, Math.floor(cell * 0.2)));
    }
  }

  for (let i = 0; i < 18; i += 1) {
    const sx = headX + i * (cell * 0.9);
    const sy = headY + Math.sin((animationMs * 0.007) + i * 0.4) * (cell * 0.25);

    const tone = i === 0 ? '#b4ff9d' : i % 2 === 0 ? '#58c67b' : '#4bad6c';

    ctx.fillStyle = tone;
    ctx.fillRect(sx, sy, cell, cell);

    ctx.fillStyle = 'rgba(11, 18, 31, 0.18)';
    ctx.fillRect(sx + 2, sy + 2, cell - 4, cell - 4);
  }

  ctx.fillStyle = '#0b1324';
  ctx.fillRect(headX - 2, headY + cell * 0.25, mouthCut + 6, Math.max(6, Math.floor(cell * 0.25)));

  ctx.fillStyle = '#14243f';
  ctx.fillRect(width * 0.08, height * 0.12, width * 0.84, height * 0.28);
  ctx.strokeStyle = '#4f6ea5';
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.08, height * 0.12, width * 0.84, height * 0.28);

  ctx.fillStyle = '#f5f7ff';
  ctx.textAlign = 'center';
  ctx.font = '700 42px "American Typewriter", serif';
  ctx.fillText('Shrinking Snake', width * 0.5, height * 0.2);

  ctx.font = '500 18px "Trebuchet MS", sans-serif';
  ctx.fillText('Choose a difficulty and survive the collapsing arena.', width * 0.5, height * 0.27);

  ctx.font = '600 16px "Trebuchet MS", sans-serif';
  ctx.fillStyle = '#d7e5ff';
  ctx.fillText(`Selected: ${selectedDifficulty.toUpperCase()}`, width * 0.5, height * 0.34);
}

function drawGameBoard(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  game: GameState
): void {
  const { cell, x, y, width, height } = boardMetrics(canvas);
  const pulse = Math.sin(game.tickCount * 0.2) * 0.5 + 0.5;

  ctx.fillStyle = '#1c2a46';
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = '#4f6ea5';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  for (let gy = 0; gy < BOARD_HEIGHT; gy += 1) {
    for (let gx = 0; gx < BOARD_WIDTH; gx += 1) {
      const outOfBounds =
        gx < game.bounds.minX ||
        gx > game.bounds.maxX ||
        gy < game.bounds.minY ||
        gy > game.bounds.maxY;

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
  const foodX = x + game.food.x * cell + cell / 2;
  const foodY = y + game.food.y * cell + cell / 2;
  ctx.beginPath();
  ctx.arc(foodX, foodY, cell * (0.24 + pulse * 0.08), 0, Math.PI * 2);
  ctx.fill();

  game.fireTiles.forEach((tile, idx) => {
    const fireX = x + tile.x * cell;
    const fireY = y + tile.y * cell;
    const glow = (Math.sin((game.tickCount + idx) * 0.45) + 1) / 2;

    ctx.fillStyle = '#4d1808';
    ctx.fillRect(fireX + 1, fireY + 1, cell - 2, cell - 2);

    ctx.fillStyle = `rgba(255, 120, 40, ${0.65 + glow * 0.25})`;
    ctx.fillRect(fireX + 2, fireY + cell * 0.45, cell - 4, cell * 0.5 - 2);

    ctx.fillStyle = `rgba(255, 205, 65, ${0.5 + glow * 0.4})`;
    ctx.fillRect(fireX + cell * 0.28, fireY + cell * 0.2, cell * 0.44, cell * 0.45);
  });

  game.snake.forEach((segment, index) => {
    const segmentX = x + segment.x * cell;
    const segmentY = y + segment.y * cell;
    ctx.fillStyle = index === 0 ? '#99f6a4' : '#54b76e';
    ctx.fillRect(segmentX + 1, segmentY + 1, cell - 2, cell - 2);
  });

  if (game.mode !== 'running') {
    ctx.fillStyle = 'rgba(5, 8, 15, 0.68)';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#f6f8ff';
    ctx.textAlign = 'center';
    ctx.font = '700 28px "American Typewriter", "Trebuchet MS", serif';

    const modeText =
      game.mode === 'ready'
        ? 'Press an Arrow Key or WASD to Begin'
        : game.mode === 'paused'
          ? 'Paused - Press P to Resume'
          : 'Game Over - Press R to Restart';

    ctx.fillText(modeText, x + width / 2, y + height / 2 - 8);
    ctx.font = '500 16px "Trebuchet MS", sans-serif';
    ctx.fillText('Press M for menu and pick another difficulty.', x + width / 2, y + height / 2 + 26);
  }
}

export function renderFrame(input: RenderFrameInput): void {
  const { canvas, ctx, screen, game, menuAnimationMs, selectedDifficulty } = input;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  fillBackground(ctx, width, height);

  if (screen === 'menu' || !game) {
    drawMenuScene(ctx, width, height, menuAnimationMs, selectedDifficulty);
    return;
  }

  drawGameBoard(ctx, canvas, game);
}

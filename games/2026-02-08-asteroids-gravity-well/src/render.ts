import { BULLET, COLORS, GRAVITY, SHIP, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from "./constants";
import type { GameState } from "./entities";

export type RenderContext = {
  ctx: CanvasRenderingContext2D;
  scale: number;
};

export function resizeCanvas(canvas: HTMLCanvasElement) {
  const pixelRatio = window.devicePixelRatio || 1;
  const scale = Math.min(window.innerWidth / VIRTUAL_WIDTH, window.innerHeight / VIRTUAL_HEIGHT);
  const width = Math.floor(VIRTUAL_WIDTH * scale);
  const height = Math.floor(VIRTUAL_HEIGHT * scale);
  canvas.width = Math.floor(VIRTUAL_WIDTH * pixelRatio);
  canvas.height = Math.floor(VIRTUAL_HEIGHT * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context missing");
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  return { ctx, scale } as RenderContext;
}

export function render(state: GameState, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  drawStars(ctx);
  drawGravityWell(ctx);
  drawAsteroids(state, ctx);
  drawBullets(state, ctx);
  drawShip(state, ctx);
  drawHud(state, ctx);

  if (state.mode === "title") {
    drawCenterText(ctx, "GRAVITY WELL ASTEROIDS", 36, -20);
    drawCenterText(ctx, "Press Enter or Space to start", 18, 20);
    drawCenterText(ctx, "Twist: The central gravity well pulls everything", 16, 52);
  }

  if (state.mode === "paused") {
    drawCenterText(ctx, "PAUSED", 40, 0);
  }

  if (state.mode === "gameover") {
    drawCenterText(ctx, "SYSTEM LOST", 40, -10);
    drawCenterText(ctx, "Press R to restart", 18, 28);
  }
}

function drawStars(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.stars;
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 97) % VIRTUAL_WIDTH;
    const y = (i * 53) % VIRTUAL_HEIGHT;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawGravityWell(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = COLORS.gravity;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 8]);
  ctx.arc(GRAVITY.x, GRAVITY.y, GRAVITY.bonusRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.fillStyle = "rgba(58, 134, 255, 0.2)";
  ctx.arc(GRAVITY.x, GRAVITY.y, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawShip(state: GameState, ctx: CanvasRenderingContext2D) {
  const ship = state.ship;
  if (state.mode === "title") return;
  if (ship.invuln > 0 && Math.floor(ship.invuln * 10) % 2 === 0) return;

  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(0, -SHIP.radius);
  ctx.lineTo(SHIP.radius * 0.7, SHIP.radius);
  ctx.lineTo(0, SHIP.radius * 0.6);
  ctx.lineTo(-SHIP.radius * 0.7, SHIP.radius);
  ctx.closePath();
  ctx.strokeStyle = COLORS.ship;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawBullets(state: GameState, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.bullet;
  for (const bullet of state.bullets) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, BULLET.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAsteroids(state: GameState, ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = COLORS.asteroid;
  ctx.lineWidth = 2;
  for (const asteroid of state.asteroids) {
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHud(state: GameState, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.ship;
  ctx.font = "16px 'Trebuchet MS', sans-serif";
  ctx.fillText(`Score: ${state.score}`, 20, 24);
  ctx.fillText(`Lives: ${state.lives}`, 20, 44);
  ctx.fillText(`Wave: ${state.wave}`, 20, 64);
  ctx.fillText(`Gravity bonus: x2 inside ring`, 20, 88);

  ctx.textAlign = "right";
  ctx.fillText("Move: Arrow keys / WASD", VIRTUAL_WIDTH - 20, 24);
  ctx.fillText("Shoot: Space", VIRTUAL_WIDTH - 20, 44);
  ctx.fillText("Pause: P  Restart: R", VIRTUAL_WIDTH - 20, 64);
  ctx.fillText("Fullscreen: F", VIRTUAL_WIDTH - 20, 84);
  ctx.textAlign = "left";
}

function drawCenterText(ctx: CanvasRenderingContext2D, text: string, size: number, offset: number) {
  ctx.save();
  ctx.fillStyle = COLORS.ship;
  ctx.font = `${size}px 'Trebuchet MS', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(text, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + offset);
  ctx.restore();
}

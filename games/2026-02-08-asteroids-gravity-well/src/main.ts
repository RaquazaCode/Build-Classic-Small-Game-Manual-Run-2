import "./style.css";
import { FIXED_DT, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from "./constants";
import { resetGame } from "./entities";
import { handleGameControls, update, ensureAsteroidsSafe } from "./game";
import { setupInput } from "./input";
import { render, resizeCanvas } from "./render";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root missing");

app.innerHTML = `
  <div class="shell">
    <canvas id="game"></canvas>
    <div class="footer">Gravity Well Asteroids</div>
  </div>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#game");
if (!canvas) throw new Error("Canvas missing");
const gameCanvas = canvas;

let { ctx } = resizeCanvas(canvas);
const state = resetGame();
ensureAsteroidsSafe(state);
setupInput();

let lastTime = performance.now();
let accumulator = 0;
let running = true;

function step(dt: number) {
  update(state, dt);
  render(state, ctx);
}

function loop(time: number) {
  if (!running) return;
  const delta = Math.min(0.1, (time - lastTime) / 1000);
  lastTime = time;
  accumulator += delta;
  while (accumulator >= FIXED_DT) {
    step(FIXED_DT);
    accumulator -= FIXED_DT;
  }
  render(state, ctx);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "f") {
    toggleFullscreen();
  }
  handleGameControls(state, key);
});

window.addEventListener("resize", () => {
  ({ ctx } = resizeCanvas(canvas));
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    gameCanvas.requestFullscreen().catch(() => undefined);
  } else {
    document.exitFullscreen().catch(() => undefined);
  }
}

function startGameFromAuto() {
  if (state.mode === "title") {
    state.mode = "playing";
    state.ship.invuln = 2;
  }
}

const params = new URLSearchParams(window.location.search);
if (params.has("autostart")) {
  startGameFromAuto();
}

window.advanceTime = (ms: number) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i += 1) {
    step(FIXED_DT);
  }
};

window.render_game_to_text = () => {
  const payload = {
    mode: state.mode,
    score: state.score,
    lives: state.lives,
    wave: state.wave,
    gravityWell: { x: VIRTUAL_WIDTH / 2, y: VIRTUAL_HEIGHT / 2, bonusRadius: 120 },
    ship: {
      x: state.ship.x,
      y: state.ship.y,
      angle: state.ship.angle,
      invuln: state.ship.invuln,
    },
    bullets: state.bullets.map((bullet) => ({ x: bullet.x, y: bullet.y, life: bullet.life })),
    asteroids: state.asteroids.map((asteroid) => ({
      x: asteroid.x,
      y: asteroid.y,
      radius: asteroid.radius,
      size: asteroid.size,
    })),
    coordinateSystem: "Origin (0,0) is top-left. +x right, +y down.",
  };
  return JSON.stringify(payload);
};

declare global {
  interface Window {
    advanceTime: (ms: number) => void;
    render_game_to_text: () => string;
  }
}

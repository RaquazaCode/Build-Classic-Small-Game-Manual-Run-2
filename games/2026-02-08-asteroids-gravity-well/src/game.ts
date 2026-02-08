import { ASTEROID, BULLET, GRAVITY, SHIP, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from "./constants";
import {
  createAsteroidField,
  createBullet,
  gravityAcceleration,
  resetGame,
  splitAsteroid,
} from "./entities";
import type { GameState } from "./entities";
import { isDown } from "./input";
import { dist, clamp, vectorFromAngle, wrapPosition } from "./utils";

export function update(state: GameState, dt: number) {
  if (state.mode === "paused" || state.mode === "title" || state.mode === "gameover") {
    return;
  }

  const ship = state.ship;

  if (isDown("arrowleft", "a")) {
    ship.angle -= SHIP.turnSpeed * dt;
  }
  if (isDown("arrowright", "d")) {
    ship.angle += SHIP.turnSpeed * dt;
  }
  if (isDown("arrowup", "w")) {
    const thrust = vectorFromAngle(ship.angle, SHIP.thrust * dt);
    ship.vx += thrust.x;
    ship.vy += thrust.y;
  }

  const gravity = gravityAcceleration(ship.x, ship.y);
  ship.vx += gravity.ax * dt;
  ship.vy += gravity.ay * dt;

  ship.vx = clamp(ship.vx, -SHIP.maxSpeed, SHIP.maxSpeed);
  ship.vy = clamp(ship.vy, -SHIP.maxSpeed, SHIP.maxSpeed);

  ship.x += ship.vx * dt;
  ship.y += ship.vy * dt;
  ship.vx *= SHIP.friction;
  ship.vy *= SHIP.friction;

  wrapPosition(ship, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  if (ship.invuln > 0) ship.invuln = Math.max(0, ship.invuln - dt);

  state.cooldown = Math.max(0, state.cooldown - dt);

  if (isDown(" ") && state.cooldown <= 0) {
    state.bullets.push(createBullet(ship));
    state.cooldown = SHIP.fireCooldown;
  }

  updateBullets(state, dt);
  updateAsteroids(state, dt);
  handleCollisions(state);

  if (state.asteroids.length === 0) {
    state.wave += 1;
    state.asteroids = createAsteroidField(Math.min(7, 3 + state.wave));
    state.ship.invuln = SHIP.invulnTime;
  }
}

function updateBullets(state: GameState, dt: number) {
  state.bullets = state.bullets
    .map((bullet) => {
      const gravity = gravityAcceleration(bullet.x, bullet.y);
      bullet.vx += gravity.ax * dt * 0.7;
      bullet.vy += gravity.ay * dt * 0.7;
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.life -= dt;
      wrapPosition(bullet, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      return bullet;
    })
    .filter((bullet) => bullet.life > 0);
}

function updateAsteroids(state: GameState, dt: number) {
  for (const asteroid of state.asteroids) {
    const gravity = gravityAcceleration(asteroid.x, asteroid.y);
    asteroid.vx += gravity.ax * dt;
    asteroid.vy += gravity.ay * dt;
    asteroid.x += asteroid.vx * dt;
    asteroid.y += asteroid.vy * dt;
    wrapPosition(asteroid, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  }
}

function handleCollisions(state: GameState) {
  const ship = state.ship;

  for (let i = state.bullets.length - 1; i >= 0; i -= 1) {
    const bullet = state.bullets[i];
    for (let j = state.asteroids.length - 1; j >= 0; j -= 1) {
      const asteroid = state.asteroids[j];
      if (dist(bullet, asteroid) <= asteroid.radius + BULLET.radius) {
        state.bullets.splice(i, 1);
        state.asteroids.splice(j, 1);
        const bonus = dist(asteroid, GRAVITY) <= GRAVITY.bonusRadius ? 2 : 1;
        state.score += (ASTEROID.sizes.length - asteroid.size) * 50 * bonus;
        state.asteroids.push(...splitAsteroid(asteroid));
        break;
      }
    }
  }

  if (ship.invuln > 0) return;

  for (const asteroid of state.asteroids) {
    if (dist(ship, asteroid) <= asteroid.radius + SHIP.radius) {
      state.lives -= 1;
      ship.invuln = SHIP.invulnTime;
      ship.x = VIRTUAL_WIDTH / 2;
      ship.y = VIRTUAL_HEIGHT / 2 + 160;
      ship.vx = 0;
      ship.vy = 0;
      if (state.lives <= 0) {
        state.mode = "gameover";
      }
      break;
    }
  }
}

export function handleGameControls(state: GameState, key: string) {
  if (key === "p") {
    if (state.mode === "playing") state.mode = "paused";
    else if (state.mode === "paused") state.mode = "playing";
  }

  if (key === "r") {
    const reset = resetGame();
    Object.assign(state, reset);
  }

  if ((key === "enter" || key === " ") && state.mode === "title") {
    state.mode = "playing";
    state.ship.invuln = SHIP.invulnTime;
  }

  if (key === "enter" && state.mode === "gameover") {
    const reset = resetGame();
    Object.assign(state, reset);
    state.mode = "playing";
  }
}

export function ensureAsteroidsSafe(state: GameState) {
  if (state.asteroids.length === 0) return;
  const ship = state.ship;
  for (const asteroid of state.asteroids) {
    if (dist(ship, asteroid) < 100) {
      asteroid.x += 140;
      asteroid.y -= 120;
    }
  }
}

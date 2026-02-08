import { ASTEROID, BULLET, GRAVITY, SHIP, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from "./constants";
import { choice, randRange, randSign, vectorFromAngle } from "./utils";

export type Mode = "title" | "playing" | "paused" | "gameover";

export type Ship = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  invuln: number;
};

export type Bullet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export type Asteroid = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  radius: number;
};

export type GameState = {
  mode: Mode;
  score: number;
  lives: number;
  wave: number;
  ship: Ship;
  bullets: Bullet[];
  asteroids: Asteroid[];
  cooldown: number;
  message: string;
};

export function createShip(): Ship {
  return {
    x: VIRTUAL_WIDTH / 2,
    y: VIRTUAL_HEIGHT / 2 + 160,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    invuln: SHIP.invulnTime,
  };
}

export function createAsteroid(size = 0): Asteroid {
  const radius = ASTEROID.sizes[size] ?? ASTEROID.sizes[0];
  const edge = choice(["top", "bottom", "left", "right"] as const);
  const margin = 30;
  let x = randRange(0, VIRTUAL_WIDTH);
  let y = randRange(0, VIRTUAL_HEIGHT);
  if (edge === "top") y = -margin;
  if (edge === "bottom") y = VIRTUAL_HEIGHT + margin;
  if (edge === "left") x = -margin;
  if (edge === "right") x = VIRTUAL_WIDTH + margin;

  const angle = randRange(0, Math.PI * 2);
  const speed = randRange(ASTEROID.speedMin, ASTEROID.speedMax) * (size === 0 ? 1 : 1.1);
  const drift = vectorFromAngle(angle, speed);

  return {
    x,
    y,
    vx: drift.x,
    vy: drift.y,
    size,
    radius,
  };
}

export function createAsteroidField(count: number) {
  const asteroids: Asteroid[] = [];
  for (let i = 0; i < count; i += 1) {
    asteroids.push(createAsteroid(0));
  }
  return asteroids;
}

export function createBullet(ship: Ship): Bullet {
  const nose = vectorFromAngle(ship.angle, SHIP.radius + 2);
  const velocity = vectorFromAngle(ship.angle, BULLET.speed);
  return {
    x: ship.x + nose.x,
    y: ship.y + nose.y,
    vx: ship.vx + velocity.x,
    vy: ship.vy + velocity.y,
    life: BULLET.life,
  };
}

export function resetGame(): GameState {
  return {
    mode: "title",
    score: 0,
    lives: 3,
    wave: 1,
    ship: createShip(),
    bullets: [],
    asteroids: createAsteroidField(4),
    cooldown: 0,
    message: "",
  };
}

export function splitAsteroid(asteroid: Asteroid): Asteroid[] {
  if (asteroid.size >= ASTEROID.sizes.length - 1) return [];
  const nextSize = asteroid.size + 1;
  return Array.from({ length: ASTEROID.splitCount }, () => {
    const offset = randRange(-12, 12);
    const angle = randRange(0, Math.PI * 2);
    const speed = randRange(ASTEROID.speedMin + 30, ASTEROID.speedMax + 80);
    const drift = vectorFromAngle(angle, speed);
    return {
      x: asteroid.x + offset,
      y: asteroid.y - offset,
      vx: drift.x + randSign() * 40,
      vy: drift.y - randSign() * 40,
      size: nextSize,
      radius: ASTEROID.sizes[nextSize],
    };
  });
}

export function gravityAcceleration(x: number, y: number) {
  const dx = GRAVITY.x - x;
  const dy = GRAVITY.y - y;
  const distance = Math.max(Math.hypot(dx, dy), GRAVITY.minDistance);
  const force = GRAVITY.strength / (distance * distance);
  return { ax: (dx / distance) * force, ay: (dy / distance) * force };
}

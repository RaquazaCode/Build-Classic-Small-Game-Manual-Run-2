export const VIRTUAL_WIDTH = 900;
export const VIRTUAL_HEIGHT = 600;
export const FPS = 60;
export const FIXED_DT = 1 / FPS;

export const SHIP = {
  radius: 14,
  turnSpeed: Math.PI * 1.6,
  thrust: 280,
  friction: 0.99,
  maxSpeed: 420,
  fireCooldown: 0.18,
  invulnTime: 2.0,
};

export const BULLET = {
  speed: 520,
  life: 1.25,
  radius: 3,
};

export const ASTEROID = {
  sizes: [48, 28, 16],
  speedMin: 40,
  speedMax: 140,
  splitCount: 2,
};

export const GRAVITY = {
  x: VIRTUAL_WIDTH / 2,
  y: VIRTUAL_HEIGHT / 2,
  strength: 18000,
  minDistance: 60,
  bonusRadius: 120,
};

export const COLORS = {
  background: "#0b1020",
  stars: "#14213d",
  ship: "#f4f1de",
  bullet: "#fca311",
  asteroid: "#e5e5e5",
  gravity: "#3a86ff",
  accent: "#e76f51",
};

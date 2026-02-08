# Gravity Well Asteroids

Asteroids-style survival with a central gravity well that pulls everything inward.

## Setup
```bash
pnpm install
```

## Run
```bash
pnpm dev
```

## Build
```bash
pnpm build
```

## Test (self-check)
```bash
pnpm test
```

## Controls
- Rotate: Left/Right Arrow or A/D
- Thrust: Up Arrow or W
- Shoot: Space
- Pause: P
- Restart: R
- Fullscreen: F

## Rules
- Destroy asteroids to progress waves.
- You have 3 lives. Colliding with an asteroid costs a life.
- Bullets and asteroids wrap around screen edges.

## Twist
A gravity well at the center pulls ships, bullets, and asteroids. Destroying asteroids inside the gravity ring grants 2x score.

## Known Issues
- No audio effects yet.
- Asteroids are simple circles (no sprite variation).

## Next Steps
- Add shield powerup that temporarily negates gravity pull.
- Introduce comet asteroids with higher speed and score.
- Add sound effects and subtle screen shake on collisions.
- Add a tutorial overlay for first-time players.
- Add high-score persistence in localStorage.
- Add particle burst effects when asteroids split.
- Add optional colorblind-friendly palette.
- Add difficulty modes (light/normal/chaos).

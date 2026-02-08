# Gravity Well Asteroids - Design

## Goal
Survive waves of drifting asteroids while a central gravity well pulls every object toward it.

## Core Loop
1. Rotate and thrust to reposition the ship.
2. Shoot asteroids to break them into smaller pieces.
3. Avoid collisions and the pull of the gravity well.
4. Clear the wave to spawn the next one.

## Controls
- Rotate: Left/Right Arrow or A/D
- Thrust: Up Arrow or W
- Shoot: Space
- Pause: P
- Restart: R
- Fullscreen: F

## Win/Lose
- Win condition: None (endless survival). Progression via waves.
- Lose condition: Lives reach 0.

## Scoring
- Base score per asteroid size (large to small).
- Twist bonus: Destroying asteroids inside the gravity ring grants 2x score.

## Twist
A central gravity well pulls all objects (ship, asteroids, bullets). Staying near the ring is risky but doubles score.

## Done Means
- Playable with deterministic update loop.
- Restart works and score updates.
- Gravity well visibly affects movement.
- No obvious bugs during a short play session.

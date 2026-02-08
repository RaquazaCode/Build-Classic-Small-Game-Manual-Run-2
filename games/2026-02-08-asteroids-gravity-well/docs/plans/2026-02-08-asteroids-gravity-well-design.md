# Implementation Plan - Gravity Well Asteroids

## Scope
Deliver a playable Asteroids-style MVP with a gravity well twist in a single run.

## Steps
1. Scaffold Vite + TypeScript app in `games/2026-02-08-asteroids-gravity-well`.
2. Implement core game loop (fixed timestep), input handling, and rendering.
3. Add gravity well force applied to ship, bullets, and asteroids.
4. Implement collisions, scoring, lives, wave progression, and restart/pause.
5. Add `window.advanceTime` and `window.render_game_to_text` hooks for automation tests.
6. Document controls, twist, and known issues.
7. Add lightweight self-check script if no test framework exists.
8. Run install, test, and build commands.

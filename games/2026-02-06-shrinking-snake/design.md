# Design - Shrinking Snake MVP

## Goal
Ship a classic Snake-inspired browser game with a fast arcade loop and one twist: the playable arena shrinks as the run progresses.

## Core Mechanics
- Grid-based snake movement on a deterministic tick.
- Eat food to grow and gain score.
- Colliding with walls, shrink boundaries, or self ends the run.
- Pause and restart are always available.

## Game Loop
1. Start in `ready` mode.
2. First directional input enters `running` mode.
3. Each tick advances snake head, resolves collisions, and checks food.
4. Every `N` points, shrink arena bounds inward by one tile ring.
5. Continue until collision, then enter `game_over` mode.

## Controls
- Movement: Arrow keys or WASD
- Pause/Resume: `P`
- Restart: `R`
- Fullscreen toggle: `F`

## Win/Lose
- Win: Endless score attack (no hard win state in MVP).
- Lose: Hit self or any wall (including collapsed boundary).

## Scoring
- +10 points per food.
- Display score and best run (session memory only).

## Twist
Shrinking arena: each shrink event tightens the legal playfield, forcing route planning and accelerating tension.

## Done Means
- Playable in browser locally.
- Restart works reliably.
- Score updates correctly.
- Shrink mechanic works without soft-lock.
- No obvious bugs in core controls or collision logic.

# Shrinking Snake (2026-02-06)

A browser Snake game with a retro menu, three difficulty tiers, dynamic hazards, survival scoring, and procedural 8-bit audio.

## Features
- Animated home screen with giant 8-bit snake scene.
- Difficulty presets: `Easy`, `Medium`, `Hard`.
- Seeded deterministic food and hazard placement per run.
- Hard-mode static pixel-fire hazards.
- Stopwatch-based survival scoring plus food bonus.
- Local top-10 leaderboard persisted in browser storage.
- Procedural chiptune music for menu and gameplay.

## Setup
```bash
cd games/2026-02-06-shrinking-snake
npm install
```

## Run
```bash
npm run dev
```
Open the Vite URL shown in terminal (default: `http://localhost:5173`).

## Controls
### Menu
- Choose difficulty: `1 / 2 / 3` or Arrow keys + `Enter`

### In Game
- Move: `Arrow Keys` or `WASD`
- Pause/Resume: `P`
- Restart run: `R`
- Return to menu: `M`
- Fullscreen toggle: `F`

## Difficulty Rules
- **Easy**
  - Tick speed: `130ms`
  - No arena shrink
  - Food keeps at least 2 tiles from active walls when possible
  - No fire hazards
- **Medium**
  - Tick speed: `110ms`
  - Arena shrinks every 25 progression points
  - Food keeps at least 1 tile from active walls when possible
  - No fire hazards
- **Hard**
  - Tick speed: `90ms`
  - Arena shrinks every 15 progression points
  - Food may spawn directly on walls
  - Pixel-fire hazards active and refresh after food pickups

## Scoring
Real-time score uses a survival-dominant formula:

`score = round((elapsedSeconds * 100 + foodsEaten * 50) * difficultyMultiplier)`

Difficulty multipliers:
- Easy: `1.0`
- Medium: `1.25`
- Hard: `1.5`

## Persistence
Leaderboard is stored in localStorage under key:
- `shrinking-snake-v1-leaderboard`

Each entry includes:
- score
- elapsedSeconds
- foodsEaten
- difficulty
- date
- seed

## Verification Performed
- `npm test -- --run`
- `npm run build`
- Automated browser play-check via Playwright client with screenshot/state capture.

## Known Limitations
- Audio playback depends on user interaction because of browser autoplay policy.
- Leaderboard is local-only (no backend sync).

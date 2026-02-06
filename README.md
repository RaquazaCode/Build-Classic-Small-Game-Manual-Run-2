# Build-Classic-Small-Game-Manual-Run-2

<p align="center">
  <strong>Shrinking Snake</strong><br/>
  Retro grid snake with difficulty tiers, collapsing arena pressure, hard-mode fire hazards, local high scores, and procedural 8-bit audio.
</p>

<p align="center">
  <img alt="Shrinking Snake menu" src="games/2026-02-06-shrinking-snake/assets/screenshots/menu.png" width="900" />
</p>

## GIF Captures
### Menu Animation (8-bit Hero Snake)
<p align="center">
  <img alt="Menu animation" src="games/2026-02-06-shrinking-snake/assets/gifs/menu-animation.gif" width="900" />
</p>

### Difficulty Selection
<p align="center">
  <img alt="Difficulty selection" src="games/2026-02-06-shrinking-snake/assets/gifs/difficulty-select.gif" width="900" />
</p>

### Easy Mode Mid-Game
<p align="center">
  <img alt="Easy mode gameplay" src="games/2026-02-06-shrinking-snake/assets/gifs/easy-midgame.gif" width="900" />
</p>

### Hard Mode Mid-Game
<p align="center">
  <img alt="Hard mode gameplay" src="games/2026-02-06-shrinking-snake/assets/gifs/hard-midgame.gif" width="900" />
</p>

## Quick Start
```bash
cd games/2026-02-06-shrinking-snake
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

## How To Play
- Pick difficulty from menu: `Easy`, `Medium`, or `Hard`
- Move with `Arrow Keys` or `WASD`
- Pause with `P`
- Restart with `R`
- Return to menu with `M`
- Toggle fullscreen with `F`

## Difficulty Rules
- `Easy`: slower tick, no arena shrink, safer food spawn margin
- `Medium`: faster tick, periodic arena shrink, moderate pressure
- `Hard`: fastest tick, aggressive shrink, pixel-fire hazards, wall-adjacent food allowed

## Scoring
Survival-forward scoring:

`score = round((elapsedSeconds * 100 + foodsEaten * 50) * difficultyMultiplier)`

Leaderboard is stored in local storage (`shrinking-snake-v1-leaderboard`) and keeps top 10 runs.

## Project Location
All game code and media are organized under:

- `games/2026-02-06-shrinking-snake`

Main in-folder docs:

- `games/2026-02-06-shrinking-snake/README.md`
- `games/2026-02-06-shrinking-snake/design.md`
- `games/2026-02-06-shrinking-snake/progress.md`

## Verification
```bash
cd games/2026-02-06-shrinking-snake
npm test -- --run
npm run build
```

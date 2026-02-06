# Shrinking Snake (2026-02-06)

A classic Snake-style browser game with one twist: the arena collapses inward as your score increases.

## Twist
Every 30 points, the board shrinks by one full tile ring. Collapsed tiles become permanent deadly wall tiles.

## Setup
```bash
cd games/2026-02-06-shrinking-snake
npm install
```

## Run
```bash
npm run dev
```
Then open the local Vite URL (default: `http://localhost:5173`).

## Controls
- Move: `Arrow Keys` or `WASD`
- Pause/Resume: `P`
- Restart: `R`
- Fullscreen toggle: `F`

## Rules
- Eat food to gain `+10` score and grow.
- Avoid walls, collapsed boundary tiles, and your own body.
- The game is an endless score attack; death ends the run.

## Verification Performed
- `npm test -- --run`
- `npm run build`
- Automated browser play check via Playwright client script (`web_game_playwright_client.js`) with screenshot + `render_game_to_text` capture.

## Known Issues
- Food spawn is deterministic (first available tile scan), so replay patterns are somewhat predictable.
- No touch controls yet.
- No audio feedback yet.

## Next Steps
- Add random-food spawn seeded per run.
- Add on-screen settings for tick speed and shrink threshold.
- Add touch swipe controls for mobile.
- Add sound effects and mute toggle.
- Add local leaderboard persistence.

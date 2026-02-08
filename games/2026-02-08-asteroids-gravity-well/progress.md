Original prompt: You are Codex running an unattended nightly “build a classic small game” automation in a cloud dev environment.

## Progress
- 2026-02-08: Scaffolding Vite TS app, implemented Gravity Well Asteroids MVP.
- Added deterministic update loop, render_game_to_text, advanceTime, fullscreen toggle.
- Added self-check script and README/design docs.
- Verified Playwright screenshots and text state.
- Tests: pnpm test (pass). Build: pnpm build (pass).

## TODO / Notes
- Open PR with the new game and attach report details.
- Confirm state.json and backlog history if prior runs exist.

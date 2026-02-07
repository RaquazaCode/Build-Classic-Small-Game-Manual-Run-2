Original prompt: Build a classic small game MVP nightly with docs, state tracking, tests, and PR.

- Initialized Vite vanilla-ts scaffold.
- Added vitest test script and dev dependency.
- Added TDD coverage for paddle bounce and brick hit logic in `src/game/physics.ts`.
- Verified vitest run passes.
- Added wall collision logic with tests and verified vitest.
- Added circle-rectangle collision helper with tests.
- Added level generation helpers with tests.
- Implemented core Breakout game loop, rendering, and UI shell.
- Added fullscreen toggle and render_game_to_text/advanceTime hooks.
- Fixed TypeScript build issues (type-only imports, global window types) and verified build.

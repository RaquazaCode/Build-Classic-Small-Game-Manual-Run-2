# Account Rules

- For daily game runs, keep all run artifacts inside the game folder: `games/YYYY-MM-DD-<slug>/`.
- Store implementation plans under the game folder: `games/YYYY-MM-DD-<slug>/docs/plans/`.
- Store `progress.md` inside the same game folder: `games/YYYY-MM-DD-<slug>/progress.md`.
- Avoid creating root-level `docs/` or root-level `progress.md` for daily game runs unless explicitly requested.

# Package Manager: pnpm (MANDATORY)

- Use `pnpm` instead of `npm`/`npx`.
- Install dependencies with `pnpm install`.
- Run development with `pnpm dev`.
- Run tests with `pnpm test -- --run`.
- Run builds with `pnpm build`.
- Add dependencies with `pnpm add <package>` or `pnpm add -D <package>`.
- Do not create or commit `package-lock.json`; use `pnpm-lock.yaml`.

## Working Agreements for Codex

### Repo Commands (Current)

- `cd games/2026-02-06-shrinking-snake && pnpm install`
- `cd games/2026-02-06-shrinking-snake && pnpm dev`
- `cd games/2026-02-06-shrinking-snake && pnpm test -- --run`
- `cd games/2026-02-06-shrinking-snake && pnpm build`
- `lint`: no lint script exists in `games/2026-02-06-shrinking-snake/package.json`; do not invent lint steps in unattended automations.

### Preferred Stack

- Runtime: Vite + TypeScript + Canvas 2D.
- Tests: Vitest unit tests in `src/*.test.ts`.
- Keep deterministic game logic in `src/logic.ts` and runtime orchestration in `src/main.ts` + `src/render.ts`.

### Communication and Work Style

- Bias to speed: ship the smallest working diff that solves the task.
- Base instruction changes on repo evidence, not assumptions.
- Keep updates short and operational: what changed, why, and what to review next.

### File and Folder Conventions

- For each daily run, create and work inside `games/YYYY-MM-DD-<slug>/`.
- Keep plans in `games/YYYY-MM-DD-<slug>/docs/plans/`.
- Keep progress in `games/YYYY-MM-DD-<slug>/progress.md`.
- Keep personalization automation artifacts in `.codex/automations/personalization/`.

### PR Expectations

- Use title format: `Automation: <scope> (YYYY-MM-DD)`.
- In PR description, include friction patterns addressed, exact rules added, evidence pointers, and verification commands run.
- Required verification for current game project updates: `pnpm test -- --run` and `pnpm build` from the game folder.

### Safety Rules

- Never add secrets, tokens, private keys, or personal data.
- Never run destructive git or data-deleting commands in recurring automation.
- Avoid risky cross-cutting refactors in unattended runs.

### If Unsure

- Do not guess preferences.
- Choose the smallest reversible change backed by repo evidence.
- If blocked, record blocker + fallback in `.codex/automations/personalization/reports/YYYY-MM-DD.md` and continue with safe work.

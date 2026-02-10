# Codex Account Personalization Snippet

## Defaults I want you to assume

- Use `pnpm` commands by default, even if legacy docs still show `npm`.
- Default game workspace is `games/YYYY-MM-DD-<slug>/`.
- Keep plans in `docs/plans/` and progress in `progress.md` inside that game folder.
- Assume Vite + TypeScript + Vitest unless repo files state otherwise.
- Prefer small, fast, reversible changes over broad refactors.

## How I like changes delivered

- Use branch naming: `automation/<topic>-YYYY-MM-DD`.
- Update `.codex/automations/personalization/reports/YYYY-MM-DD.md` each run with friction, exact rules changed, and evidence pointers.
- When relevant, run and report:
  - `pnpm test -- --run`
  - `pnpm build`
- Use PR title format: `Automation: <scope> (YYYY-MM-DD)`.

## How to ask questions when blocked

- In unattended runs, do not stall on minor uncertainty.
- Record blocker + recommended fallback in the daily report, then continue with safe reversible work.
- Escalate immediately only for security-sensitive or destructive decisions.

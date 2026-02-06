# Daily Classic Game MVP (2026-02-06) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a playable browser MVP of a classic Snake-style game with one low-risk original twist, clear docs, and automation-state updates.

**Architecture:** Create a standalone Vite + TypeScript app under `games/2026-02-06-shrinking-snake/`. Keep game logic in pure modules (`logic.ts`, `types.ts`) and UI/render/input in `main.ts` for testability. Use a fixed-step deterministic simulation (`tickMs = 120`) with pure state transitions and a canvas renderer.

**Tech Stack:** Vite, TypeScript, Canvas 2D, Vitest.

---

### Task 1: Concept + Design Docs

**Files:**
- Create: `.codex/automations/daily-game/reports/2026-02-06.md`
- Create: `games/2026-02-06-shrinking-snake/design.md`
- Create: `progress.md`

**Step 1: Write concept report**
- Include selection seed, candidate mechanics, chosen concept, and twist rationale.

**Step 2: Write design spec**
- Include loop, controls, win/lose, scoring, twist, done criteria.

**Step 3: Initialize progress handoff log**
- Add the original user prompt summary and implementation checkpoints.

**Step 4: Commit**
```bash
git add .codex/automations/daily-game/reports/2026-02-06.md games/2026-02-06-shrinking-snake/design.md progress.md docs/plans/2026-02-06-daily-classic-game-mvp.md
git commit -m "docs: add daily game concept report and plan"
```

### Task 2: Project Scaffold + Failing Tests (RED)

**Files:**
- Create: `games/2026-02-06-shrinking-snake/package.json`
- Create: `games/2026-02-06-shrinking-snake/tsconfig.json`
- Create: `games/2026-02-06-shrinking-snake/vite.config.ts`
- Create: `games/2026-02-06-shrinking-snake/index.html`
- Create: `games/2026-02-06-shrinking-snake/src/types.ts`
- Create: `games/2026-02-06-shrinking-snake/src/logic.ts`
- Create: `games/2026-02-06-shrinking-snake/src/logic.test.ts`

**Step 1: Write failing tests for pure game logic**
- Cover movement, wall/self collision, food scoring growth, and shrinking arena behavior.

**Step 2: Run tests and verify failure**
```bash
npm test -- --run
```
- Expected: failing assertions because logic is not implemented.

**Step 3: Commit red phase**
```bash
git add games/2026-02-06-shrinking-snake
git commit -m "test: add failing snake logic tests"
```

### Task 3: Minimal Logic Implementation (GREEN)

**Files:**
- Modify: `games/2026-02-06-shrinking-snake/src/logic.ts`
- Modify: `games/2026-02-06-shrinking-snake/src/types.ts`

**Step 1: Implement minimal pure logic to pass tests**
- Implement `createInitialState`, `stepGame`, `changeDirection`, `resetGame`.

**Step 2: Run tests and verify green**
```bash
npm test -- --run
```
- Expected: all logic tests pass.

**Step 3: Commit logic implementation**
```bash
git add games/2026-02-06-shrinking-snake/src
git commit -m "feat: implement deterministic snake core logic"
```

### Task 4: Rendering + Input + Runtime Hooks

**Files:**
- Create: `games/2026-02-06-shrinking-snake/src/main.ts`
- Create: `games/2026-02-06-shrinking-snake/src/style.css`
- Create: `games/2026-02-06-shrinking-snake/src/assets/README.md`

**Step 1: Build canvas renderer and HUD**
- Show arena, snake, food, score, lives/status text.

**Step 2: Wire controls and loop**
- Arrow/WASD movement, `P` pause, `R` reset, `F` fullscreen.

**Step 3: Add automation hooks**
- Expose `window.render_game_to_text` and `window.advanceTime(ms)`.

**Step 4: Run app build validation**
```bash
npm run build
```

**Step 5: Commit gameplay UI**
```bash
git add games/2026-02-06-shrinking-snake
git commit -m "feat: add playable canvas runtime and controls"
```

### Task 5: Verification + Docs + Automation State

**Files:**
- Create: `games/2026-02-06-shrinking-snake/README.md`
- Create: `.codex/automations/daily-game/backlog.md`
- Create/Modify: `.codex/automations/daily-game/state.json`
- Modify: `progress.md`

**Step 1: Run required verification commands**
```bash
npm install
npm run test -- --run
npm run build
```

**Step 2: Write README**
- Include setup, run, controls, rules, twist, known issues, next steps.

**Step 3: Update rolling backlog (5-10 items)**
- Append date-stamped next-step list.

**Step 4: Update state JSON**
- Set `last_run_timestamp_utc`, game entry, attempted concepts, PR placeholders.

**Step 5: Commit completion docs/state**
```bash
git add .
git commit -m "chore: finalize daily game docs state and backlog"
```

### Task 6: Branch Sync + Push

**Files:**
- None (git ops)

**Step 1: Ensure branch name is date-specific**
```bash
git branch --show-current
```

**Step 2: Push commits**
```bash
git push -u origin codex/automation/daily-game-2026-02-06
```

**Step 3: Prepare PR metadata text**
- Title: `Automation: Daily classic game MVP (2026-02-06)`
- Include concept, twist, run steps, verification commands, known issues.

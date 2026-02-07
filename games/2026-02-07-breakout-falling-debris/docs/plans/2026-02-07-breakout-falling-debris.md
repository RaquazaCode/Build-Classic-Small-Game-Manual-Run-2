# Falling Debris Breakout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a playable Breakout MVP with falling debris twist, docs, and tests.

**Architecture:** Canvas-rendered game loop with deterministic update step, pure logic helpers for collisions/scoring, and DOM shell for layout/controls.

**Tech Stack:** Vite + TypeScript, Canvas 2D, Vitest.

---

### Task 1: Scaffold and base tests

**Files:**
- Create: `games/2026-02-07-breakout-falling-debris/src/game/physics.test.ts`
- Create: `games/2026-02-07-breakout-falling-debris/src/game/physics.ts`

**Step 1: Write the failing test**

```ts
import { computePaddleBounce } from './physics'

// expect centered bounce to go straight up
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with missing module or missing function.

**Step 3: Write minimal implementation**

```ts
export const computePaddleBounce = () => ({ vx: 0, vy: -1 })
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the new test.

**Step 5: Commit**

```bash
git add src/game/physics.ts src/game/physics.test.ts

git commit -m "test: add paddle bounce tests"
```

### Task 2: Brick resolution and wall collisions

**Files:**
- Modify: `games/2026-02-07-breakout-falling-debris/src/game/physics.ts`
- Modify: `games/2026-02-07-breakout-falling-debris/src/game/physics.test.ts`

**Step 1: Write the failing test**

```ts
// expect brick hit to destroy single-hit bricks
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with missing function or wrong behavior.

**Step 3: Write minimal implementation**

```ts
export const resolveBrickHit = () => ({ destroyed: true })
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for brick tests.

**Step 5: Commit**

```bash
git add src/game/physics.ts src/game/physics.test.ts

git commit -m "feat: add brick hit resolution"
```

### Task 3: Level generation helpers

**Files:**
- Create: `games/2026-02-07-breakout-falling-debris/src/game/level.ts`
- Create: `games/2026-02-07-breakout-falling-debris/src/game/level.test.ts`

**Step 1: Write the failing test**

```ts
import { createBrickGrid } from './level'
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL for missing module.

**Step 3: Write minimal implementation**

```ts
export const createBrickGrid = () => []
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for grid length expectations.

**Step 5: Commit**

```bash
git add src/game/level.ts src/game/level.test.ts

git commit -m "feat: add level helpers"
```

### Task 4: Core game loop and rendering

**Files:**
- Create: `games/2026-02-07-breakout-falling-debris/src/game/game.ts`
- Modify: `games/2026-02-07-breakout-falling-debris/src/main.ts`
- Modify: `games/2026-02-07-breakout-falling-debris/src/style.css`

**Step 1: Write the failing test**

```ts
// add a pure helper test for collisions or scoring
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL for missing helper behavior.

**Step 3: Write minimal implementation**

```ts
// implement helper in physics.ts
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/game/game.ts src/main.ts src/style.css

git commit -m "feat: add breakout gameplay"
```

### Task 5: Documentation and verification

**Files:**
- Create: `games/2026-02-07-breakout-falling-debris/README.md`
- Create: `games/2026-02-07-breakout-falling-debris/design.md`
- Update: `.codex/automations/daily-game/backlog.md`

**Step 1: Write docs**

```md
# Falling Debris Breakout
```

**Step 2: Run verification**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: SUCCESS.

**Step 3: Commit**

```bash
git add README.md design.md .codex/automations/daily-game/backlog.md

git commit -m "docs: add game docs and backlog"
```

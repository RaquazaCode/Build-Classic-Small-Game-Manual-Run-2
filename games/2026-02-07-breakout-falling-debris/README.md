# Falling Debris Breakout

Classic brick breaker with a risky twist: destroyed bricks rain debris that can help or hurt.

## Setup

```bash
cd games/2026-02-07-breakout-falling-debris
npm install
```

## Run

```bash
npm run dev
```

## Tests

```bash
npm test
```

## Controls
- Mouse move or Arrow Left/Right (A/D): move paddle
- Space / Click: launch ball or start
- P: pause / resume
- R: restart
- F: fullscreen toggle

## Twist
Destroyed bricks drop debris. Catch green for bonus points and a temporary paddle boost. Catch orange to lose points and shrink the paddle. Missed debris boosts ball speed for a few seconds.

## Known Issues
- Touch controls are not implemented.
- Ball/brick collision is simplified and may clip at extreme angles.

## Next Steps
See `.codex/automations/daily-game/backlog.md` for follow-up ideas.

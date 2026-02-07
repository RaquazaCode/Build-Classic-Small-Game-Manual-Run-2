# Falling Debris Breakout - Design

## Goal
Recreate a fast Breakout-style loop with a twist: destroyed bricks rain debris that can help or hurt. Keep rounds short, readable, and restartable.

## Core Loop
- Start in a menu screen.
- Launch the ball and clear bricks.
- Catch falling debris to gain bonuses; avoid hazards.
- Missed debris temporarily speeds up the ball.
- Clear all bricks to win; lose all lives to fail.

## Controls
- Mouse move or Arrow Left/Right (A/D) to move paddle
- Space / Click: launch ball or start
- P: pause / resume
- R: restart
- F: fullscreen toggle

## Scoring
- Brick hit: +50 to +100 based on durability
- Bonus debris caught: +150
- Hazard debris caught: -120 (floored at 0)

## Win / Lose
- Win: all bricks cleared
- Lose: lives reach 0

## Twist
Destroyed bricks drop debris: green grants a score boost and temporarily widens the paddle, orange penalizes score and shrinks the paddle. Missed debris triggers a short ball speed boost to intensify play.

## Done Means
- Playable loop from menu to win/lose
- Score and lives update correctly
- Restart and pause work
- No obvious runtime errors

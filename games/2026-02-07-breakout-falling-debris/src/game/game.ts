import {
  circleRectIntersect,
  computePaddleBounce,
  resolveBrickHit,
  resolveWallCollision,
} from './physics'
import type { Brick, DebrisType } from './level'
import { createBrickGrid, pickDebrisType } from './level'

type GameMode = 'menu' | 'playing' | 'paused' | 'gameover' | 'won'

type Ball = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  baseSpeed: number
}

type Paddle = {
  x: number
  y: number
  width: number
  height: number
  speed: number
  effectUntil: number
  effectScale: number
}

type Debris = {
  id: string
  x: number
  y: number
  width: number
  height: number
  vy: number
  type: DebrisType
  active: boolean
}

type GameState = {
  mode: GameMode
  score: number
  lives: number
  ball: Ball
  paddle: Paddle
  bricks: Brick[]
  debris: Debris[]
  speedBoostUntil: number
  lastStepTime: number
  bounds: { width: number; height: number; topOffset: number }
}

type InputState = {
  left: boolean
  right: boolean
  pointerX: number | null
}

const HUD_HEIGHT = 48
const PADDLE_HEIGHT = 14
const BALL_RADIUS = 7
const BASE_SPEED = 320
const PADDLE_SPEED = 520
const DEBRIS_SPEED = 180
const SPEED_BOOST_DURATION = 3
const SPEED_BOOST_FACTOR = 1.2
const PADDLE_EFFECT_DURATION = 5

const backgroundGradient = (ctx: CanvasRenderingContext2D, height: number) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#0b0b15')
  gradient.addColorStop(0.6, '#15203d')
  gradient.addColorStop(1, '#1f324f')
  return gradient
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const createInitialState = (width: number, height: number): GameState => {
  const bricks = createBrickGrid({
    rows: 5,
    columns: 10,
    startX: 40,
    startY: HUD_HEIGHT + 24,
    brickWidth: Math.floor((width - 80 - 9 * 8) / 10),
    brickHeight: 20,
    gap: 8,
  })

  const paddleWidth = Math.min(140, width * 0.22)
  const paddleX = (width - paddleWidth) / 2
  const paddleY = height - 50

  return {
    mode: 'menu',
    score: 0,
    lives: 3,
    ball: {
      x: paddleX + paddleWidth / 2,
      y: paddleY - BALL_RADIUS - 2,
      r: BALL_RADIUS,
      vx: 0,
      vy: 0,
      baseSpeed: BASE_SPEED,
    },
    paddle: {
      x: paddleX,
      y: paddleY,
      width: paddleWidth,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED,
      effectUntil: 0,
      effectScale: 1,
    },
    bricks,
    debris: [],
    speedBoostUntil: 0,
    lastStepTime: 0,
    bounds: {
      width,
      height,
      topOffset: HUD_HEIGHT,
    },
  }
}

const resetBall = (state: GameState) => {
  state.ball.x = state.paddle.x + state.paddle.width / 2
  state.ball.y = state.paddle.y - state.ball.r - 2
  state.ball.vx = 0
  state.ball.vy = 0
}

const launchBall = (state: GameState) => {
  if (state.ball.vx !== 0 || state.ball.vy !== 0) return
  const angle = -Math.PI / 3
  state.ball.vx = state.ball.baseSpeed * Math.cos(angle)
  state.ball.vy = state.ball.baseSpeed * Math.sin(angle)
}

const normalizeBallSpeed = (ball: Ball, target: number) => {
  const magnitude = Math.hypot(ball.vx, ball.vy)
  if (magnitude === 0) return
  const scale = target / magnitude
  ball.vx *= scale
  ball.vy *= scale
}

export class BreakoutGame {
  private state: GameState
  private input: InputState
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas 2D context not available')
    }
    this.ctx = ctx
    this.state = createInitialState(canvas.width, canvas.height)
    this.input = { left: false, right: false, pointerX: null }
  }

  resize(width: number, height: number) {
    const previousWidth = this.state.bounds.width
    const previousHeight = this.state.bounds.height

    this.canvas.width = width
    this.canvas.height = height
    this.state.bounds.width = width
    this.state.bounds.height = height

    const scaleX = width / previousWidth
    const scaleY = height / previousHeight

    this.state.paddle.x *= scaleX
    this.state.paddle.y *= scaleY
    this.state.paddle.width *= scaleX
    this.state.ball.x *= scaleX
    this.state.ball.y *= scaleY

    for (const brick of this.state.bricks) {
      brick.x *= scaleX
      brick.y *= scaleY
      brick.width *= scaleX
      brick.height *= scaleY
    }

    for (const piece of this.state.debris) {
      piece.x *= scaleX
      piece.y *= scaleY
      piece.width *= scaleX
      piece.height *= scaleY
    }

    this.state.bounds.topOffset = HUD_HEIGHT
  }

  getState() {
    return this.state
  }

  setPointer(x: number | null) {
    this.input.pointerX = x
  }

  setKey(key: 'left' | 'right', pressed: boolean) {
    this.input[key] = pressed
  }

  togglePause() {
    if (this.state.mode === 'playing') {
      this.state.mode = 'paused'
    } else if (this.state.mode === 'paused') {
      this.state.mode = 'playing'
    }
  }

  restart() {
    const width = this.state.bounds.width
    const height = this.state.bounds.height
    this.state = createInitialState(width, height)
  }

  start() {
    if (this.state.mode === 'menu') {
      this.state.mode = 'playing'
      launchBall(this.state)
    }
  }

  step(deltaSeconds: number) {
    const state = this.state
    state.lastStepTime += deltaSeconds

    if (state.mode !== 'playing') return

    const now = state.lastStepTime
    const speedBoostActive = now < state.speedBoostUntil
    const paddleEffectActive = now < state.paddle.effectUntil

    if (!paddleEffectActive) {
      state.paddle.effectScale = 1
    }

    const paddleWidth = Math.max(80, state.paddle.width * state.paddle.effectScale)

    const inputDirection = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0)
    if (inputDirection !== 0) {
      state.paddle.x += inputDirection * state.paddle.speed * deltaSeconds
    } else if (this.input.pointerX !== null) {
      state.paddle.x = this.input.pointerX - paddleWidth / 2
    }

    state.paddle.x = clamp(state.paddle.x, 0, state.bounds.width - paddleWidth)
    state.paddle.width = paddleWidth

    if (state.ball.vx === 0 && state.ball.vy === 0) {
      resetBall(state)
      return
    }

    const speedMultiplier = speedBoostActive ? SPEED_BOOST_FACTOR : 1
    normalizeBallSpeed(state.ball, state.ball.baseSpeed * speedMultiplier)

    state.ball.x += state.ball.vx * deltaSeconds
    state.ball.y += state.ball.vy * deltaSeconds

    const wallResult = resolveWallCollision({
      x: state.ball.x,
      y: state.ball.y,
      r: state.ball.r,
      vx: state.ball.vx,
      vy: state.ball.vy,
      bounds: {
        minX: 0,
        maxX: state.bounds.width,
        minY: state.bounds.topOffset,
        maxY: state.bounds.height,
      },
    })

    state.ball.x = wallResult.x
    state.ball.y = wallResult.y
    state.ball.vx = wallResult.vx
    state.ball.vy = wallResult.vy

    if (wallResult.fellOut) {
      state.lives -= 1
      if (state.lives <= 0) {
        state.mode = 'gameover'
      } else {
        resetBall(state)
      }
      return
    }

    const paddleRect = {
      x: state.paddle.x,
      y: state.paddle.y,
      width: state.paddle.width,
      height: state.paddle.height,
    }

    if (state.ball.vy > 0 && circleRectIntersect({ circle: state.ball, rect: paddleRect })) {
      const bounce = computePaddleBounce({
        ballX: state.ball.x,
        paddleX: state.paddle.x,
        paddleWidth: state.paddle.width,
        speed: state.ball.baseSpeed * speedMultiplier,
      })
      state.ball.vx = bounce.vx
      state.ball.vy = bounce.vy
      state.ball.y = state.paddle.y - state.ball.r - 1
    }

    for (const brick of state.bricks) {
      if (brick.hitPoints <= 0) continue
      const hit = circleRectIntersect({
        circle: state.ball,
        rect: { x: brick.x, y: brick.y, width: brick.width, height: brick.height },
      })
      if (!hit) continue

      const result = resolveBrickHit({
        id: brick.id,
        hitPoints: brick.hitPoints,
        maxHitPoints: brick.maxHitPoints,
      })
      brick.hitPoints = result.hitPoints
      state.score += result.scoreDelta

      if (result.spawnDebris) {
        state.debris.push({
          id: `debris-${brick.id}-${state.debris.length}`,
          x: brick.x + brick.width / 2 - 6,
          y: brick.y + brick.height / 2 - 6,
          width: 12,
          height: 12,
          vy: DEBRIS_SPEED,
          type: pickDebrisType(),
          active: true,
        })
      }

      state.ball.vy *= -1
      break
    }

    for (const piece of state.debris) {
      if (!piece.active) continue
      piece.y += piece.vy * deltaSeconds

      if (
        piece.y + piece.height >= state.paddle.y &&
        piece.y <= state.paddle.y + state.paddle.height &&
        piece.x + piece.width >= state.paddle.x &&
        piece.x <= state.paddle.x + state.paddle.width
      ) {
        piece.active = false
        if (piece.type === 'bonus') {
          state.score += 150
          state.paddle.effectScale = 1.2
          state.paddle.effectUntil = now + PADDLE_EFFECT_DURATION
        } else {
          state.score = Math.max(0, state.score - 120)
          state.paddle.effectScale = 0.8
          state.paddle.effectUntil = now + PADDLE_EFFECT_DURATION
        }
      } else if (piece.y > state.bounds.height) {
        piece.active = false
        state.speedBoostUntil = now + SPEED_BOOST_DURATION
      }
    }

    if (state.bricks.every((brick) => brick.hitPoints <= 0)) {
      state.mode = 'won'
    }
  }

  render() {
    const ctx = this.ctx
    const { width, height } = this.state.bounds

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = backgroundGradient(ctx, height)
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(0, this.state.bounds.topOffset - 6, width, 2)

    ctx.fillStyle = '#f5f1ff'
    ctx.font = '600 16px "Space Grotesk", sans-serif'
    ctx.fillText(`Score ${this.state.score}`, 16, 28)
    ctx.fillText(`Lives ${this.state.lives}`, width - 100, 28)

    for (const brick of this.state.bricks) {
      if (brick.hitPoints <= 0) continue
      ctx.fillStyle = brick.maxHitPoints === 1 ? '#7dd3fc' : '#fda4af'
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height)
    }

    ctx.fillStyle = '#fef3c7'
    ctx.fillRect(
      this.state.paddle.x,
      this.state.paddle.y,
      this.state.paddle.width,
      this.state.paddle.height
    )

    ctx.fillStyle = '#fde68a'
    ctx.beginPath()
    ctx.arc(this.state.ball.x, this.state.ball.y, this.state.ball.r, 0, Math.PI * 2)
    ctx.fill()

    for (const piece of this.state.debris) {
      if (!piece.active) continue
      ctx.fillStyle = piece.type === 'bonus' ? '#86efac' : '#f97316'
      ctx.fillRect(piece.x, piece.y, piece.width, piece.height)
    }

    if (this.state.mode !== 'playing') {
      this.renderOverlay()
    }
  }

  private renderOverlay() {
    const ctx = this.ctx
    const { width, height } = this.state.bounds

    ctx.fillStyle = 'rgba(10, 12, 24, 0.75)'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = '#f8fafc'
    ctx.textAlign = 'center'
    ctx.font = '700 34px "Space Grotesk", sans-serif'

    const title =
      this.state.mode === 'menu'
        ? 'Falling Debris Breakout'
        : this.state.mode === 'won'
        ? 'You Cleared the Deck!'
        : this.state.mode === 'gameover'
        ? 'Out of Lives'
        : 'Paused'

    ctx.fillText(title, width / 2, height / 2 - 40)

    ctx.font = '500 16px "Space Grotesk", sans-serif'
    const lines =
      this.state.mode === 'menu'
        ? [
            'Move with mouse or arrow keys.',
            'Catch green debris for bonus, avoid orange.',
            'Missed debris boosts ball speed for 3s.',
            'Press Space or click to start.',
          ]
        : this.state.mode === 'paused'
        ? ['Press P to resume.', 'Press R to restart.']
        : ['Press R to restart.']

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, height / 2 + index * 24)
    })

    ctx.textAlign = 'left'
  }
}

export const createGame = (canvas: HTMLCanvasElement) => new BreakoutGame(canvas)

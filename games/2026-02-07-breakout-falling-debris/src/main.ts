import './style.css'
import { createGame } from './game/game'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('App root not found')
}

app.innerHTML = `
  <div class="shell">
    <header class="title-bar">
      <div>
        <h1>Falling Debris Breakout</h1>
        <p>Classic brick breaker with a risky debris twist.</p>
      </div>
      <div class="hint">Press <strong>F</strong> for fullscreen</div>
    </header>
    <div class="canvas-wrap">
      <canvas id="game" width="900" height="600" aria-label="Breakout game"></canvas>
    </div>
  </div>
`

const canvas = document.querySelector<HTMLCanvasElement>('#game')
if (!canvas) {
  throw new Error('Canvas not found')
}

const game = createGame(canvas)

const resize = () => {
  const padding = 32
  const headerHeight = 110
  const width = Math.min(960, window.innerWidth - padding)
  const height = Math.min(640, window.innerHeight - headerHeight)
  game.resize(Math.max(600, width), Math.max(420, height))
}

resize()
window.addEventListener('resize', resize)

const keys: Record<string, boolean> = {}

window.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === 'ArrowLeft' || event.key === 'a') {
    game.setKey('left', true)
  }
  if (event.key === 'ArrowRight' || event.key === 'd') {
    game.setKey('right', true)
  }
  if (event.key === 'p' || event.key === 'P') {
    game.togglePause()
  }
  if (event.key === 'r' || event.key === 'R') {
    game.restart()
  }
  if (event.key === ' ' || event.key === 'Spacebar') {
    game.start()
  }
  if (event.key === 'f' || event.key === 'F') {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined)
    } else {
      document.exitFullscreen().catch(() => undefined)
    }
  }
})

window.addEventListener('keyup', (event) => {
  keys[event.key] = false
  if (event.key === 'ArrowLeft' || event.key === 'a') {
    game.setKey('left', false)
  }
  if (event.key === 'ArrowRight' || event.key === 'd') {
    game.setKey('right', false)
  }
})

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const x = (event.clientX - rect.left) * scaleX
  game.setPointer(x)
})

canvas.addEventListener('mouseleave', () => {
  game.setPointer(null)
})

canvas.addEventListener('click', () => {
  game.start()
})

let lastTime = performance.now()
const step = (time: number) => {
  const delta = Math.min(0.05, (time - lastTime) / 1000)
  lastTime = time
  game.step(delta)
  game.render()
  requestAnimationFrame(step)
}

requestAnimationFrame(step)

window.render_game_to_text = () => {
  const state = game.getState()
  return JSON.stringify({
    mode: state.mode,
    score: state.score,
    lives: state.lives,
    ball: { x: state.ball.x, y: state.ball.y, r: state.ball.r },
    paddle: {
      x: state.paddle.x,
      y: state.paddle.y,
      width: state.paddle.width,
      height: state.paddle.height,
    },
    bricksRemaining: state.bricks.filter((brick) => brick.hitPoints > 0).length,
    debris: state.debris.filter((piece) => piece.active).map((piece) => ({
      x: piece.x,
      y: piece.y,
      width: piece.width,
      height: piece.height,
      type: piece.type,
    })),
    speedBoostActive: state.lastStepTime < state.speedBoostUntil,
    coordinateSystem: 'origin top-left, x right, y down, units in canvas pixels',
  })
}

window.advanceTime = (ms: number) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)))
  const dt = 1 / 60
  for (let i = 0; i < steps; i += 1) {
    game.step(dt)
  }
  game.render()
}

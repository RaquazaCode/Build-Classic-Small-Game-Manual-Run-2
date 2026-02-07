const MAX_BOUNCE_ANGLE_RAD = (65 * Math.PI) / 180

type PaddleBounceInput = {
  ballX: number
  paddleX: number
  paddleWidth: number
  speed: number
}

type Velocity = {
  vx: number
  vy: number
}

type BrickHitInput = {
  id: string
  hitPoints: number
  maxHitPoints: number
}

type BrickHitResult = {
  id: string
  hitPoints: number
  destroyed: boolean
  scoreDelta: number
  spawnDebris: boolean
}

type WallCollisionInput = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  bounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
}

type WallCollisionResult = {
  x: number
  y: number
  vx: number
  vy: number
  hitWall: boolean
  fellOut: boolean
}

type CircleRectInput = {
  circle: { x: number; y: number; r: number }
  rect: { x: number; y: number; width: number; height: number }
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const computePaddleBounce = ({
  ballX,
  paddleX,
  paddleWidth,
  speed,
}: PaddleBounceInput): Velocity => {
  const paddleCenter = paddleX + paddleWidth / 2
  const normalizedOffset = clamp((ballX - paddleCenter) / (paddleWidth / 2), -1, 1)
  const angle = normalizedOffset * MAX_BOUNCE_ANGLE_RAD

  return {
    vx: speed * Math.sin(angle),
    vy: -speed * Math.cos(angle),
  }
}

export const resolveBrickHit = ({
  id,
  hitPoints,
  maxHitPoints,
}: BrickHitInput): BrickHitResult => {
  const nextHitPoints = Math.max(0, hitPoints - 1)
  const destroyed = nextHitPoints === 0
  const scoreDelta = 50 * maxHitPoints

  return {
    id,
    hitPoints: nextHitPoints,
    destroyed,
    scoreDelta,
    spawnDebris: destroyed,
  }
}

export const resolveWallCollision = ({
  x,
  y,
  r,
  vx,
  vy,
  bounds,
}: WallCollisionInput): WallCollisionResult => {
  let nextX = x
  let nextY = y
  let nextVx = vx
  let nextVy = vy
  let hitWall = false
  let fellOut = false

  if (x - r <= bounds.minX) {
    nextX = bounds.minX + r
    nextVx = Math.abs(vx)
    hitWall = true
  } else if (x + r >= bounds.maxX) {
    nextX = bounds.maxX - r
    nextVx = -Math.abs(vx)
    hitWall = true
  }

  if (y - r <= bounds.minY) {
    nextY = bounds.minY + r
    nextVy = Math.abs(vy)
    hitWall = true
  } else if (y - r > bounds.maxY) {
    fellOut = true
  }

  return {
    x: nextX,
    y: nextY,
    vx: nextVx,
    vy: nextVy,
    hitWall,
    fellOut,
  }
}

export const circleRectIntersect = ({ circle, rect }: CircleRectInput): boolean => {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width)
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height)
  const dx = circle.x - closestX
  const dy = circle.y - closestY
  return dx * dx + dy * dy <= circle.r * circle.r
}

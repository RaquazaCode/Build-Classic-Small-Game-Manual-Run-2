export type Brick = {
  id: string
  x: number
  y: number
  width: number
  height: number
  hitPoints: number
  maxHitPoints: number
}

export type DebrisType = 'bonus' | 'hazard'

type BrickGridInput = {
  rows: number
  columns: number
  startX: number
  startY: number
  brickWidth: number
  brickHeight: number
  gap: number
}

export const createBrickGrid = ({
  rows,
  columns,
  startX,
  startY,
  brickWidth,
  brickHeight,
  gap,
}: BrickGridInput): Brick[] => {
  const bricks: Brick[] = []
  let counter = 0

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const x = startX + col * (brickWidth + gap)
      const y = startY + row * (brickHeight + gap)
      const maxHitPoints = row % 2 === 0 ? 1 : 2

      bricks.push({
        id: `brick-${counter}`,
        x,
        y,
        width: brickWidth,
        height: brickHeight,
        hitPoints: maxHitPoints,
        maxHitPoints,
      })
      counter += 1
    }
  }

  return bricks
}

export const pickDebrisType = (): DebrisType => {
  return Math.random() < 0.7 ? 'bonus' : 'hazard'
}

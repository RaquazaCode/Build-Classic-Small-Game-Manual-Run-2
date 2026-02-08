export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function randSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

export function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function wrapPosition(pos: { x: number; y: number }, width: number, height: number) {
  if (pos.x < 0) pos.x += width;
  if (pos.x > width) pos.x -= width;
  if (pos.y < 0) pos.y += height;
  if (pos.y > height) pos.y -= height;
}

export function choice<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function vectorFromAngle(angle: number, magnitude: number) {
  return { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude };
}

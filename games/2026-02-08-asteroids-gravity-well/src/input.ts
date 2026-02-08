const activeKeys = new Set<string>();

export function setupInput() {
  window.addEventListener("keydown", (event) => {
    activeKeys.add(event.key.toLowerCase());
  });
  window.addEventListener("keyup", (event) => {
    activeKeys.delete(event.key.toLowerCase());
  });
}

export function isDown(...keys: string[]) {
  return keys.some((key) => activeKeys.has(key));
}

export function clearInput() {
  activeKeys.clear();
}

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);

function assert(condition, message) {
  if (!condition) {
    console.error(`Self-check failed: ${message}`);
    process.exit(1);
  }
}

const mainSource = readFileSync(resolve(root, "src/main.ts"), "utf8");
const gameSource = readFileSync(resolve(root, "src/game.ts"), "utf8");

assert(mainSource.includes("window.advanceTime"), "advanceTime hook missing");
assert(mainSource.includes("window.render_game_to_text"), "render_game_to_text hook missing");
assert(gameSource.includes("handleCollisions"), "collision handling missing");

console.log("Self-check passed: hooks and core loop present.");

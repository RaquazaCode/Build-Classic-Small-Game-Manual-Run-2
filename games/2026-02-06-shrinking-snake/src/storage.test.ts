import { describe, expect, test } from 'vitest';
import { loadLeaderboard, saveLeaderboardEntry, STORAGE_KEY } from './storage';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem(key: string): string | null {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      map.set(key, value);
    }
  };
}

describe('local leaderboard storage', () => {
  test('sorts entries by score and keeps top 10', () => {
    const storage = createMemoryStorage();

    for (let i = 0; i < 12; i += 1) {
      saveLeaderboardEntry(
        {
          score: i * 100,
          elapsedSeconds: i,
          foodsEaten: i,
          difficulty: 'easy',
          date: '2026-02-06T00:00:00Z',
          seed: i + 1
        },
        storage
      );
    }

    const entries = loadLeaderboard(storage);
    expect(entries).toHaveLength(10);
    expect(entries[0].score).toBe(1100);
    expect(entries[9].score).toBe(200);
  });

  test('handles malformed JSON payload by returning empty list', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: 'not valid json'
    });

    const entries = loadLeaderboard(storage);
    expect(entries).toEqual([]);
  });
});

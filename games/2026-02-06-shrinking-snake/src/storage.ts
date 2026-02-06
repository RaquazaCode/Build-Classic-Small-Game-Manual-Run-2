import type { DifficultyId } from './types';

export const STORAGE_KEY = 'shrinking-snake-v1-leaderboard';

export interface LeaderboardEntry {
  score: number;
  elapsedSeconds: number;
  foodsEaten: number;
  difficulty: DifficultyId;
  date: string;
  seed: number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

function isDifficulty(value: unknown): value is DifficultyId {
  return value === 'easy' || value === 'medium' || value === 'hard';
}

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Partial<LeaderboardEntry>;
  return (
    typeof entry.score === 'number' &&
    typeof entry.elapsedSeconds === 'number' &&
    typeof entry.foodsEaten === 'number' &&
    isDifficulty(entry.difficulty) &&
    typeof entry.date === 'string' &&
    typeof entry.seed === 'number'
  );
}

function normalize(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries
    .filter((entry) => Number.isFinite(entry.score))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.elapsedSeconds !== a.elapsedSeconds) {
        return b.elapsedSeconds - a.elapsedSeconds;
      }
      if (b.foodsEaten !== a.foodsEaten) {
        return b.foodsEaten - a.foodsEaten;
      }
      return a.date < b.date ? 1 : -1;
    })
    .slice(0, 10);
}

export function loadLeaderboard(storage: StorageLike | null = getDefaultStorage()): LeaderboardEntry[] {
  if (!storage) {
    return [];
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const validEntries = parsed.filter(isLeaderboardEntry);
    return normalize(validEntries);
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(
  entry: LeaderboardEntry,
  storage: StorageLike | null = getDefaultStorage()
): LeaderboardEntry[] {
  if (!storage) {
    return [];
  }

  const nextEntries = normalize([...loadLeaderboard(storage), entry]);
  storage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
  return nextEntries;
}

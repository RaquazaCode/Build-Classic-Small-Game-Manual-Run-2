import { describe, expect, test } from 'vitest';
import { computeScore } from './scoring';

describe('survival scoring', () => {
  test('applies survival-dominant formula with multiplier and rounding', () => {
    const score = computeScore(3, 12, 1.5);
    expect(score).toBe(Math.round((12 * 100 + 3 * 50) * 1.5));
  });

  test('returns zero score for zero foods and zero elapsed time', () => {
    expect(computeScore(0, 0, 1)).toBe(0);
  });
});

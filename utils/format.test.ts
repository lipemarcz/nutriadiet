import { describe, it, expect } from 'vitest';
import { formatKcal, formatGrams, formatPercent, clampPercent } from './format';

describe('format utils', () => {
  it('formatKcal rounds and appends unit', () => {
    expect(formatKcal(199.6)).toBe('200 kcal');
  });

  it('formatGrams rounds to 1 decimal by default', () => {
    expect(formatGrams(12.34)).toBe('12.3g');
    expect(formatGrams(12.35)).toBe('12.4g');
  });

  it('formatPercent formats with default 0 digits', () => {
    expect(formatPercent(33.3)).toBe('33%');
  });

  it('clampPercent clamps to [0, 100]', () => {
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(120)).toBe(100);
    expect(clampPercent(55)).toBe(55);
  });
});


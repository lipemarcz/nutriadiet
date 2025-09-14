import { describe, it, expect } from 'vitest';
import { computePaginationMeta } from '../utils/pagination';

describe('computePaginationMeta', () => {
  it('computes basic meta', () => {
    const m = computePaginationMeta(100, 1, 25);
    expect(m.totalPages).toBe(4);
    expect(m.currentPage).toBe(1);
    expect(m.hasPrev).toBe(false);
    expect(m.hasNext).toBe(true);
  });

  it('caps page within bounds', () => {
    const m = computePaginationMeta(10, 99, 3);
    expect(m.currentPage).toBe(4);
    expect(m.hasNext).toBe(false);
  });

  it('handles zero total gracefully', () => {
    const m = computePaginationMeta(0, 1, 25);
    expect(m.totalPages).toBe(1);
    expect(m.currentPage).toBe(1);
    expect(m.hasPrev).toBe(false);
    expect(m.hasNext).toBe(false);
  });
});



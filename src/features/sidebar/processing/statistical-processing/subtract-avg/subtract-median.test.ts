import { describe, expect, it } from 'vitest';
import Grid2D from '@/shared/grid2d';
import { subtractMedian } from './subtract-median';

describe('subtractMedian', () => {
  it('subtracts the median at each row index across all columns', () => {
    const grid = Grid2D.fromArray([[0], [3], [6], [9]]);

    const result = subtractMedian(grid, 3);

    expect(Array.from(result.buffer)).toEqual([0, 0, 0, 0]);
  });

  it('returns an empty grid for empty input', () => {
    const grid = new Grid2D(0, 0);
    const result = subtractMedian(grid, 1);
    expect(result.rows).toBe(0);
    expect(result.cols).toBe(0);
  });

  it('does not mutate the input grid', () => {
    const grid = Grid2D.fromArray([[0], [3], [6], [9]]);

    const result = subtractMedian(grid, 1);

    expect(Array.from(result.buffer)).toEqual([0, 0, 0, 0]);
  });
});

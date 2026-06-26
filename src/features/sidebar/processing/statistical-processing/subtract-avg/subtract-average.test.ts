import { describe, expect, it } from 'vitest';
import Grid2D from '@/shared/grid2d';
import { subtractAverage } from './subtract-average';

describe('subtractAverage', () => {
  it('subtracts the average at each row index across all columns', () => {
    const grid = Grid2D.fromArray([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);

    const result = subtractAverage(grid);

    expect(result.getColumn(0)).toEqual([-3, -3, -3]);
    expect(result.getColumn(1)).toEqual([0, 0, 0]);
    expect(result.getColumn(2)).toEqual([3, 3, 3]);
  });

  it('returns an empty grid for empty input', () => {
    const grid = new Grid2D(0, 0);
    const result = subtractAverage(grid);
    expect(result.rows).toBe(0);
    expect(result.cols).toBe(0);
  });

  it('does not mutate the input grid', () => {
    const grid = Grid2D.fromArray([[1, 2, 3]]);
    subtractAverage(grid);
    expect(grid.getColumn(0)).toEqual([1, 2, 3]);
  });
});

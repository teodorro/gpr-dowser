import { describe, expect, it } from 'vitest';
import Grid2D from '@/shared/grid2d';
import { dewow, dewowAscan } from './dewow';

describe('dewowAscan', () => {
  it('returns an empty array for an empty trace', () => {
    expect(dewowAscan([], 3)).toEqual([]);
  });

  it('removes a constant offset', () => {
    expect(dewowAscan([5, 5, 5, 5, 5], 3)).toEqual([0, 0, 0, 0, 0]);
  });

  it('uses an odd window when an even size is given', () => {
    const ascan = [1, 2, 3, 4, 5];
    expect(dewowAscan(ascan, 4)).toEqual(dewowAscan(ascan, 5));
  });

  it('computes moving-mean subtraction at edges', () => {
    expect(dewowAscan([1, 2, 3, 4, 5], 3)).toEqual([-0.5, 0, 0, 0, 0.5]);
  });
});

describe('dewow', () => {
  it('throws when window size is less than 3', () => {
    const grid = Grid2D.fromArray([[1, 2, 3]]);
    expect(() => dewow(grid, 2)).toThrow('Window size must be not less than 3');
  });

  it('throws when window size is even', () => {
    const grid = Grid2D.fromArray([[1, 2, 3, 4, 5]]);
    expect(() => dewow(grid, 4)).toThrow('Window size must be odd');
  });

  it('throws when window size is greater than data rows', () => {
    const grid = Grid2D.fromArray([[1, 2, 3]]);
    expect(() => dewow(grid, 5)).toThrow(
      'Window size must be not greater than data rows',
    );
  });

  it('throws for an empty grid when window size exceeds rows', () => {
    const grid = new Grid2D(0, 0);
    expect(() => dewow(grid, 3)).toThrow(
      'Window size must be not greater than data rows',
    );
  });

  it('preserves grid dimensions', () => {
    const grid = Grid2D.fromArray([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    const result = dewow(grid, 3);
    expect(result.rows).toBe(grid.rows);
    expect(result.cols).toBe(grid.cols);
  });

  it('does not mutate the input grid', () => {
    const grid = Grid2D.fromArray([[10, 10, 10, 10]]);
    dewow(grid, 3);
    expect(grid.getColumn(0)).toEqual([10, 10, 10, 10]);
  });

  it('dewows each column independently', () => {
    const grid = Grid2D.fromArray([
      [1, 2, 3, 4, 5],
      [5, 5, 5, 5, 5],
    ]);

    const result = dewow(grid, 3);

    expect(result.getColumn(0)).toEqual([-0.5, 0, 0, 0, 0.5]);
    expect(result.getColumn(1)).toEqual([0, 0, 0, 0, 0]);
  });

  it('accepts a window size equal to the number of rows', () => {
    const grid = Grid2D.fromArray([[5, 5, 5, 5, 5]]);
    const result = dewow(grid, 5);
    expect(result.getColumn(0)).toEqual([0, 0, 0, 0, 0]);
  });
});

import { describe, expect, it } from 'vitest';
import Grid2D from '@/shared/grid2d';
import { setLeftAScansToZero } from './set-left-ascans-to-zero';

describe('setLeftAScansToZero', () => {
  it('should fill columns from 0 to zeroBreakpoint indices with value 0', () => {
    const grid = Grid2D.fromArray([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
    ]);

    const result = setLeftAScansToZero(grid, 2);

    expect(result.getColumn(0)).toEqual([0, 0]);
    expect(result.getColumn(1)).toEqual([0, 0]);
    expect(result.getColumn(2)).toEqual([5, 6]);
    expect(result.getColumn(3)).toEqual([7, 8]);
  });

  it('should not change anything if 0 === zeroBreakpoint', () => {
    const grid = Grid2D.fromArray([
      [1, 2],
      [3, 4],
    ]);

    const result = setLeftAScansToZero(grid, 0);

    expect(result.getColumn(0)).toEqual([1, 2]);
    expect(result.getColumn(1)).toEqual([3, 4]);
  });

  it('should throw an error if zeroBreakpoint is negative', () => {
    const grid = Grid2D.fromArray([[1, 2]]);

    expect(() => setLeftAScansToZero(grid, -1)).toThrow(RangeError);
  });

  it('should throw an error if zeroBreakpoint is greater than the number of columns', () => {
    const grid = Grid2D.fromArray([
      [1, 2],
      [3, 4],
    ]);

    expect(() => setLeftAScansToZero(grid, 3)).toThrow(RangeError);
  });
});

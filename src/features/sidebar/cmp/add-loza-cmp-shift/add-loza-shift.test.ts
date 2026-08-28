import Grid2D from '@/shared/grid2d';
import { describe, expect, it } from 'vitest';
import addLozaShift from './add-loza-shift';

describe('addLozaShift', () => {
  it('should add a loza shift to the b scan', () => {
    const bScan = new Grid2D(3, 10, [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ]);
    const newBScan = addLozaShift(bScan, 1, 1);
    expect(newBScan.getColumn(0)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(newBScan.getColumn(1)).toEqual([0, 0, 0, 1, 2, 3, 4, 5, 6, 7]);
    expect(newBScan.getColumn(2)).toEqual([0, 0, 0, 0, 0, 0, 0, 1, 2, 3]);
  });
});

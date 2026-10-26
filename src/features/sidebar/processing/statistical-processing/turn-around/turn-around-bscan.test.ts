import { describe, expect, it } from 'vitest';
import turnAroundBscan from './turn-around-bscan';
import Grid2D from '@/shared/grid2d';

describe('turnAroundBscan', () => {
  it('should turn around the bscan', () => {
    const bScan = new Grid2D(2, 2);
    bScan.set(0, 0, 1);
    bScan.set(0, 1, 2);
    bScan.set(1, 0, 3);
    bScan.set(1, 1, 4);

    const result = turnAroundBscan(bScan);

    expect(result.get(0, 0)).toBe(3);
    expect(result.get(0, 1)).toBe(4);
    expect(result.get(1, 0)).toBe(1);
    expect(result.get(1, 1)).toBe(2);
  });
});

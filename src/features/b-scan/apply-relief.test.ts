import { describe, expect, it } from 'vitest';
import Grid2D from '@/shared/grid2d';
import applyRelief from './apply-relief';

const FLAT: [number, number][] = [
  [0, 0],
  [2, 0],
];
const SLOPE: [number, number][] = [
  [0, 0],
  [2, 2],
];

describe('applyRelief', () => {
  const bScan = Grid2D.fromArray([
    [1, 2],
    [3, 4],
    [5, 6],
  ]);

  it('starts each trace on the curve and grows the grid', () => {
    const result = applyRelief(bScan, FLAT, SLOPE);

    expect(result.toArray()).toEqual([
      [1, 2, 0, 0],
      [0, 3, 4, 0],
      [0, 0, 5, 6],
    ]);
  });

  it('measures the shift from the top of the grid', () => {
    const result = applyRelief(bScan, FLAT, [
      [0, 2],
      [2, 1],
    ]);

    // Curve values are 2, 1.5 and 1
    expect(result.toArray()).toEqual([
      [0, 0, 1, 2],
      [0, 0, 3, 4],
      [0, 5, 6, 0],
    ]);
  });

  it('does not shift traces above the top of the grid', () => {
    const result = applyRelief(bScan, FLAT, [
      [0, -4],
      [2, -4],
    ]);

    expect(result.toArray()).toEqual(bScan.toArray());
  });

  it('replaces the previous shift instead of adding to it', () => {
    const shifted = applyRelief(bScan, FLAT, SLOPE);

    const result = applyRelief(shifted, SLOPE, [
      [0, 1],
      [2, 1],
    ]);

    expect(result.toArray()).toEqual([
      [0, 1, 2],
      [0, 3, 4],
      [0, 5, 6],
    ]);
  });

  it('takes the shift back when the curve is flattened', () => {
    const shifted = applyRelief(bScan, FLAT, SLOPE);

    expect(applyRelief(shifted, SLOPE, FLAT).toArray()).toEqual(
      bScan.toArray(),
    );
  });

  it('does not change the original grid', () => {
    applyRelief(bScan, FLAT, SLOPE);

    expect(bScan.toArray()).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });
});

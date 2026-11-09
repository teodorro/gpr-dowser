import { describe, expect, it } from 'vitest';
import { mirrorRelief, splitRelief } from './relief-slice';

describe('mirrorRelief', () => {
  it('reverses the curve and keeps it sorted', () => {
    expect(
      mirrorRelief(
        [
          [0, 1],
          [3, 5],
          [9, 2],
        ],
        10,
      ),
    ).toEqual([
      [0, 2],
      [6, 5],
      [9, 1],
    ]);
  });
});

describe('splitRelief', () => {
  it('gives both parts the curve value at the split', () => {
    const [left, right] = splitRelief(
      [
        [0, 10],
        [4, 20],
        [10, 40],
      ],
      6,
    );
    const splitValue = left[left.length - 1][1];

    // Split between two points, so the value is neither of them
    expect(splitValue).toBeGreaterThan(20);
    expect(splitValue).toBeLessThan(40);
    expect(left).toEqual([
      [0, 10],
      [4, 20],
      [6, splitValue],
    ]);
    expect(right).toEqual([
      [0, splitValue],
      [4, 40],
    ]);
  });
});

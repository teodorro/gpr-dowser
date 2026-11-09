import { describe, expect, it } from 'vitest';
import { curveMonotoneX, line } from 'd3';
import { sampleRelief } from './sample-relief';

const POINTS: [number, number][] = [
  [0, 0],
  [40, 25],
  [55, 10],
  [200, 90],
  [201, 3],
  [500, 60],
  [799, 0],
];

const curveValueFromSvgPath = (points: [number, number][], col: number) => {
  const path = line().curve(curveMonotoneX)(points) ?? '';
  const numbers = path.match(/-?\d+(\.\d+)?(e-?\d+)?/g)?.map(Number) ?? [];
  for (let i = 0; i + 7 < numbers.length; i += 6) {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = numbers.slice(i, i + 8);
    if (col < x0 || col > x3) continue;
    const at = (a: number, b: number, c: number, d: number, t: number) => {
      const u = 1 - t;
      return (
        u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
      );
    };
    let lo = 0;
    let hi = 1;
    for (let step = 0; step < 60; step++) {
      const t = (lo + hi) / 2;
      if (at(x0, x1, x2, x3, t) < col) lo = t;
      else hi = t;
    }
    return at(y0, y1, y2, y3, (lo + hi) / 2);
  }
  throw new Error(`Column ${col} is not on the curve`);
};

describe('sampleRelief', () => {
  it('matches the curve d3 draws at every column', () => {
    const values = sampleRelief(POINTS, 800);

    for (let col = 0; col < 800; col++) {
      expect(values[col]).toBeCloseTo(curveValueFromSvgPath(POINTS, col), 2);
    }
  });

  it('passes through the points', () => {
    const values = sampleRelief(POINTS, 800);

    POINTS.forEach(([x, y]) => expect(values[x]).toBeCloseTo(y, 4));
  });

  it('does not overshoot the points', () => {
    const values = sampleRelief(POINTS, 800);

    values.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(-1e-4);
      expect(value).toBeLessThanOrEqual(90 + 1e-4);
    });
  });

  it('draws a straight line through two points', () => {
    expect(
      Array.from(
        sampleRelief(
          [
            [0, 0],
            [4, 8],
          ],
          5,
        ),
      ),
    ).toEqual([0, 2, 4, 6, 8]);
  });

  it('uses the nearest end value outside the points', () => {
    expect(
      Array.from(
        sampleRelief(
          [
            [2, 5],
            [4, 9],
          ],
          7,
        ),
      ),
    ).toEqual([5, 5, 5, 7, 9, 9, 9]);
  });

  it('is constant for one point', () => {
    expect(Array.from(sampleRelief([[1, 3]], 3))).toEqual([3, 3, 3]);
  });

  it('is zero without points', () => {
    expect(Array.from(sampleRelief([], 3))).toEqual([0, 0, 0]);
  });
});

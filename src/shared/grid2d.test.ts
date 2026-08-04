import { describe, expect, it } from 'vitest';
import Grid2D from './grid2d';

describe('Grid2D', () => {
  it('should create a grid2d with the correct rows and cols', () => {
    const grid2d = new Grid2D(10, 10);
    expect(grid2d.rows).toBe(10);
    expect(grid2d.cols).toBe(10);
  });

  it('should set and get values correctly', () => {
    const grid2d = new Grid2D(10, 10);
    grid2d.set(2, 3, 123);
    expect(grid2d.get(2, 3)).toBe(123);
  });

  it('should get column values correctly', () => {
    const grid2d = new Grid2D(2, 2);
    grid2d.set(0, 0, 1);
    grid2d.set(0, 1, 2);
    expect(grid2d.getColumn(0)).toEqual([1, 2]);
  });

  it('should clone correctly', () => {
    const grid2d = new Grid2D(3, 2);
    grid2d.set(0, 0, 1);
    grid2d.set(0, 1, 2);
    grid2d.set(1, 0, 3);
    grid2d.set(1, 1, 4);
    grid2d.set(2, 0, 5);
    grid2d.set(2, 1, 6);

    const clone = grid2d.clone();
    expect(clone.cols).toBe(3);
    expect(clone.rows).toBe(2);
    expect(clone.get(0, 0)).toBe(1);
    expect(clone.get(0, 1)).toBe(2);
    expect(clone.get(1, 0)).toBe(3);
    expect(clone.get(1, 1)).toBe(4);
    expect(clone.get(2, 0)).toBe(5);
    expect(clone.get(2, 1)).toBe(6);

    clone.set(0, 0, 99);
    expect(grid2d.get(0, 0)).toBe(1);
  });

  it('should split correctly', () => {
    const grid2d = Grid2D.fromArray([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);

    const [left, right] = grid2d.split(2);

    expect(left.cols).toBe(2);
    expect(left.rows).toBe(2);
    expect(left.getColumn(0)).toEqual([1, 2]);
    expect(left.getColumn(1)).toEqual([3, 4]);

    expect(right.cols).toBe(1);
    expect(right.rows).toBe(2);
    expect(right.getColumn(0)).toEqual([5, 6]);
  });

  it('should throw an error if the index is out of bounds', () => {
    const grid2d = new Grid2D(2, 2);

    expect(() => grid2d.split(-1)).toThrow(RangeError);
    expect(() => grid2d.split(3)).toThrow(RangeError);
  });

  it('should split if only one column', () => {
    const grid2d = Grid2D.fromArray([[1, 2]]);

    const [left, right] = grid2d.split(1);

    expect(left.cols).toBe(1);
    expect(left.rows).toBe(2);
    expect(left.getColumn(0)).toEqual([1, 2]);

    expect(right.cols).toBe(0);
    expect(right.rows).toBe(2);
  });

  it('should convert to a column-major array', () => {
    const grid2d = new Grid2D(3, 2);
    grid2d.set(0, 0, 1);
    grid2d.set(0, 1, 2);
    grid2d.set(1, 0, 3);
    grid2d.set(1, 1, 4);
    grid2d.set(2, 0, 5);
    grid2d.set(2, 1, 6);

    expect(grid2d.toArray()).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it('should round-trip through fromArray and toArray', () => {
    const data = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const grid2d = Grid2D.fromArray(data);

    expect(grid2d.cols).toBe(2);
    expect(grid2d.rows).toBe(3);
    expect(grid2d.toArray()).toEqual(data);
  });

  it('should return an empty array for a 0-size grid', () => {
    expect(new Grid2D(0, 0).toArray()).toEqual([]);
  });

  it('should construct from a Float32Array copy', () => {
    // column-major: col0=[1,2], col1=[3,4]
    const buf = new Float32Array([1, 2, 3, 4]);
    const grid2d = new Grid2D(2, 2, buf);

    expect(grid2d.cols).toBe(2);
    expect(grid2d.rows).toBe(2);
    expect(grid2d.get(0, 0)).toBe(1);
    expect(grid2d.get(0, 1)).toBe(2);
    expect(grid2d.get(1, 0)).toBe(3);
    expect(grid2d.get(1, 1)).toBe(4);

    buf[0] = 99;
    expect(grid2d.get(0, 0)).toBe(1);
  });

  it('should throw if Float32Array length does not match cols*rows', () => {
    expect(() => new Grid2D(2, 2, new Float32Array(3))).toThrow(RangeError);
  });
});

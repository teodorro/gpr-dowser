import { describe, expect, it } from "vitest";
import Grid2D from "./grid2d";

describe("Grid2D", () => {
  it("should create a grid2d with the correct rows and cols", () => {
    const grid2d = new Grid2D(10, 10);
    expect(grid2d.rows).toBe(10);
    expect(grid2d.cols).toBe(10);
  });

  it("should set and get values correctly", () => {
    const grid2d = new Grid2D(10, 10);
    grid2d.set(2, 3, 123);
    expect(grid2d.get(2, 3)).toBe(123);
  });

  it("should get column values correctly", () => {
    const grid2d = new Grid2D(2, 2);
    grid2d.set(0, 0, 1);
    grid2d.set(0, 1, 2);
    expect(grid2d.getColumn(0)).toEqual([1, 2]);
  });
});

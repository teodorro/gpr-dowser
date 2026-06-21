import Grid2D from './grid2d';

export const logTransform = (data: number[][]): number[][] => {
  return data.map((row) =>
    row.map((cell) => Math.sign(cell) * Math.log(Math.abs(cell) + 1)),
  );
};

export const logTransformGrid2D = (data: Grid2D): Grid2D => {
  const result = new Grid2D(data.cols, data.rows);
  for (let col = 0; col < data.cols; col++) {
    for (let row = 0; row < data.rows; row++) {
      const val = data.get(col, row);
      result.set(col, row, Math.sign(val) * Math.log(Math.abs(val) + 1));
    }
  }
  return result;
};

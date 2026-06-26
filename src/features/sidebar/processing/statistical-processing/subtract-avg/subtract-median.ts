import Grid2D from '@/shared/grid2d';

export const subtractMedian = (data: Grid2D): Grid2D => {
  if (data.cols === 0 || data.rows === 0) {
    return new Grid2D(data.cols, data.rows);
  }

  const medianByRow = new Array<number>(data.rows);
  for (let row = 0; row < data.rows; row++) {
    const values = new Array<number>(data.cols);
    for (let col = 0; col < data.cols; col++) {
      values[col] = data.get(col, row);
    }
    values.sort((a, b) => a - b);
    medianByRow[row] = values[Math.floor(values.length / 2)];
  }

  const result = new Grid2D(data.cols, data.rows);
  for (let col = 0; col < data.cols; col++) {
    for (let row = 0; row < data.rows; row++) {
      result.set(col, row, data.get(col, row) - medianByRow[row]);
    }
  }
  return result;
};

export default subtractMedian;

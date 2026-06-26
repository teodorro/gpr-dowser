import Grid2D from '@/shared/grid2d';

export const subtractAverage = (data: Grid2D): Grid2D => {
  if (data.cols === 0 || data.rows === 0) {
    return new Grid2D(data.cols, data.rows);
  }

  const avgByRow = new Array<number>(data.rows).fill(0);
  for (let col = 0; col < data.cols; col++) {
    for (let row = 0; row < data.rows; row++) {
      avgByRow[row] += data.get(col, row);
    }
  }
  for (let row = 0; row < data.rows; row++) {
    avgByRow[row] /= data.cols;
  }

  const result = new Grid2D(data.cols, data.rows);
  for (let col = 0; col < data.cols; col++) {
    for (let row = 0; row < data.rows; row++) {
      result.set(col, row, data.get(col, row) - avgByRow[row]);
    }
  }
  return result;
};

export default subtractAverage;

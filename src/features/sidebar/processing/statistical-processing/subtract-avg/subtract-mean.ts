import Grid2D from '@/shared/grid2d';

export const subtractMean = (data: Grid2D, windowSize: number): Grid2D => {
  if (data.cols === 0 || data.rows === 0) {
    return new Grid2D(data.cols, data.rows);
  }

  const avg = new Grid2D(data.cols, data.rows);
  for (let row = 0; row < data.rows; row++) {
    for (let col = 0; col < data.cols; col++) {
      let sum = 0;
      const winHalf = (windowSize - 1) / 2;
      for (let i = -winHalf; i <= winHalf; i++) {
        let c = col + i;
        if (c < 0) {
          c = 0;
        } else if (c >= data.cols) {
          c = data.cols - 1;
        } else {
          c = Math.floor(c);
        }
        sum += data.get(c, row);
      }
      avg.set(col, row, sum / windowSize);
    }
  }

  const result = new Grid2D(data.cols, data.rows);
  for (let col = 0; col < data.cols; col++) {
    for (let row = 0; row < data.rows; row++) {
      result.set(col, row, data.get(col, row) - avg.get(col, row));
    }
  }
  return result;
};

export default subtractMean;

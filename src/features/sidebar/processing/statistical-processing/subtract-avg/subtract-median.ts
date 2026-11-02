import Grid2D from '@/shared/grid2d';

export const subtractMedian = (data: Grid2D, windowSize: number): Grid2D => {
  if (data.cols === 0 || data.rows === 0) {
    return new Grid2D(data.cols, data.rows);
  }

  const median = new Grid2D(data.cols, data.rows);
  for (let col = 0; col < data.cols; col++) {
    for (let row = 0; row < data.rows; row++) {
      const winHalf = (windowSize - 1) / 2;
      const windowValues = new Array<number>(windowSize);
      for (let i = -winHalf; i <= winHalf; i++) {
        const m = Math.floor(i);
        let c = col + m;
        if (c < 0) {
          c = 0;
        }
        if (c >= data.cols) {
          c = data.cols - 1;
        }
        windowValues[i + winHalf] = data.get(c, row);
      }
      const sorted = windowValues.sort((a, b) => a - b);
      median.set(col, row, sorted[Math.floor(windowValues.length / 2)]);
    }
  }

  const result = new Grid2D(data.cols, data.rows);
  for (let col = 0; col < data.cols; col++) {
    for (let row = 0; row < data.rows; row++) {
      result.set(col, row, data.get(col, row) - median.get(col, row));
    }
  }
  return result;
};

export default subtractMedian;

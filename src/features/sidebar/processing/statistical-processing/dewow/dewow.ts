import Grid2D from '@/shared/grid2d';

export const dewow = (data: Grid2D, windowSize: number): Grid2D => {
  if (windowSize < 3) {
    throw new Error('Window size must be not less than 3');
  }
  if (windowSize % 2 === 0) {
    throw new Error('Window size must be odd');
  }
  if (windowSize > data.rows) {
    throw new Error('Window size must be not greater than data rows');
  }

  const result = new Grid2D(data.cols, data.rows);
  for (let col = 0; col < data.cols; col++) {
    const dewowed = dewowAscan(data.getColumn(col), windowSize);
    for (let row = 0; row < data.rows; row++) {
      result.set(col, row, dewowed[row]);
    }
  }
  return result;
};

export const dewowAscan = (ascan: number[], windowSize: number): number[] => {
  let W = Math.max(3, Math.floor(windowSize));
  if (W % 2 === 0) W += 1;
  const half = Math.floor(W / 2);

  const n = ascan.length;
  if (n === 0) return [];

  const ps = new Array<number>(n + 1);
  ps[0] = 0;
  for (let i = 0; i < n; i++) ps[i + 1] = ps[i] + ascan[i];

  const dewowed = new Array<number>(n);

  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - half);
    const b = Math.min(n - 1, i + half);
    const sum = ps[b + 1] - ps[a];
    const mean = sum / (b - a + 1);
    dewowed[i] = ascan[i] - mean;
  }
  return dewowed;
};

export default dewow;

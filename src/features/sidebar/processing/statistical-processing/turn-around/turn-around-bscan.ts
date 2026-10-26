import Grid2D from '@/shared/grid2d';

const turnAroundBscan = (bScan: Grid2D): Grid2D => {
  const result = new Grid2D(bScan.cols, bScan.rows);
  for (let col = 0; col < bScan.cols; col++) {
    for (let row = 0; row < bScan.rows; row++) {
      result.set(bScan.cols - col - 1, row, bScan.get(col, row));
    }
  }
  return result;
};

export default turnAroundBscan;

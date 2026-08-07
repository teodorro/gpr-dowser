import Grid2D from '@/shared/grid2d';

export const setLeftAScansToZero = (
  bScan: Grid2D,
  zeroBreakpoint: number,
): Grid2D => {
  if (zeroBreakpoint < 0) {
    throw new RangeError('zeroBreakpoint must not be negative');
  }
  if (zeroBreakpoint > bScan.cols) {
    throw new RangeError(
      'zeroBreakpoint is greater than the number of columns',
    );
  }

  const result = bScan.clone();
  for (let col = 0; col < zeroBreakpoint; col++) {
    for (let row = 0; row < result.rows; row++) {
      result.set(col, row, 0);
    }
  }
  return result;
};

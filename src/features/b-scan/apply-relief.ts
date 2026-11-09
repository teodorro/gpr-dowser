import Grid2D from '@/shared/grid2d';
import { sampleRelief } from '@/shared/sample-relief';

type ReliefPoints = [number, number][];

const getOffsets = (points: ReliefPoints, cols: number) =>
  sampleRelief(points, cols).map((value) => Math.round(Math.max(value, 0)));

const max = (values: Float32Array) =>
  values.reduce((result, value) => Math.max(result, value), 0);

const applyRelief = (
  bScan: Grid2D,
  previousPoints: ReliefPoints,
  points: ReliefPoints,
): Grid2D => {
  const previousOffsets = getOffsets(previousPoints, bScan.cols);
  const offsets = getOffsets(points, bScan.cols);
  const traceLength = Math.max(0, bScan.rows - max(previousOffsets));

  const result = new Grid2D(bScan.cols, traceLength + max(offsets));
  for (let col = 0; col < bScan.cols; col++) {
    const start = col * bScan.rows + previousOffsets[col];
    result.buffer.set(
      bScan.buffer.subarray(start, start + traceLength),
      col * result.rows + offsets[col],
    );
  }
  return result;
};

export default applyRelief;

import { getCmpTimePoint, getDepth } from '@/shared/gpr-math';
import Grid2D from '@/shared/grid2d';

export const getSemblanceData = (
  data: Grid2D,
  minVelocity: number,
  maxVelocity: number,
  minTime: number,
  maxTime: number,
  dx: number,
  dt: number,
  gate = 1,
): Grid2D => {
  const res = new Grid2D(data.cols, data.rows);
  for (let i = 0; i < data.cols; i++) {
    const velocity =
      minVelocity + (i / (data.cols - 1)) * (maxVelocity - minVelocity);
    for (let j = 0; j < data.rows; j++) {
      const time = minTime + (j / (data.rows - 1)) * (maxTime - minTime);
      const depth = getDepth(time, velocity);
      const semblance = calcSemblanceForVelocityAndDepth(
        data,
        depth,
        velocity,
        dx,
        dt,
        minTime,
        maxTime,
        { loza: true },
        gate,
      );
      res.set(i, j, semblance);
    }
  }
  return res;
};

/**
 * Semblance (Neidell & Taner, 1971) along a CMP moveout trajectory:
 *
 *            Σ_τ ( Σ_i A_iτ )²
 *   S = ---------------------------      ∈ [0, 1]
 *          N · Σ_τ Σ_i A_iτ²
 *
 * where the sum over τ spans a small time gate around the theoretical arrival
 * time of each trace, and N is the number of live (in-record) traces. The
 * denominator divides out the raw energy, so the result measures how well the
 * traces line up along the curve rather than how bright the reflectors are.
 */
const calcSemblanceForVelocityAndDepth = (
  cmpScan: Grid2D,
  depth: number,
  velocity: number,
  dx: number,
  dt: number,
  minTime: number,
  maxTime: number,
  options: { loza: boolean },
  gate: number,
): number => {
  if (isNaN(depth) || depth < 0) return 0;

  // Pick the nearest sample index on the moveout curve for every trace.
  // Out-of-record traces are skipped (not clamped) so they don't leak the
  // bright first/last row into the stack.
  const rowByTrace: number[] = [];
  const traces: number[] = [];
  for (let i = 0; i < cmpScan.cols; i++) {
    const distance = i * dx;
    const t = getCmpTimePoint(distance, depth, velocity, {
      loza: options.loza,
    });
    if (t < minTime || t > maxTime) continue;
    const tIndex = Math.round((t - minTime) / dt);
    if (tIndex < 0 || tIndex >= cmpScan.rows) continue;
    traces.push(i);
    rowByTrace.push(tIndex);
  }

  const n = traces.length;
  if (n < 2) return 0;

  let num = 0; // Σ_τ ( Σ_i A_iτ )²
  let den = 0; // N · Σ_τ Σ_i A_iτ²
  for (let w = -gate; w <= gate; w++) {
    let stack = 0; // Σ_i A_iτ
    let energy = 0; // Σ_i A_iτ²
    for (let k = 0; k < n; k++) {
      const row = rowByTrace[k] + w;
      if (row < 0 || row >= cmpScan.rows) continue;
      const a = cmpScan.get(traces[k], row);
      if (isNaN(a)) continue;
      stack += a;
      energy += a * a;
    }
    num += stack * stack;
    den += n * energy;
  }

  return den > 0 ? num / den : 0;
};

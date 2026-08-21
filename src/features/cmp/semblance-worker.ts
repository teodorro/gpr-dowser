import { getCmpTimePoint, getDepth } from '@/shared/gpr-math';
import Grid2D from '@/shared/grid2d';

export type SemblanceMessage =
  | {
      type: 'progress';
      progress: number;
    }
  | {
      type: 'complete';
      result: { cols: number; rows: number; buf: Float32Array };
    };

export type DataContainer = {
  data: { cols: number; rows: number; buf: Float32Array };
  minVelocity: number;
  maxVelocity: number;
  minTime: number;
  maxTime: number;
  dx: number;
  dt: number;
  cmpGate: number;
};

self.onmessage = (e: MessageEvent<{ d: DataContainer }>) => {
  const dc = e.data as unknown as DataContainer;
  const res = new Grid2D(dc.data.cols, dc.data.rows);
  const data = new Grid2D(dc.data.cols, dc.data.rows, dc.data.buf);
  for (let i = 0; i < dc.data.cols; i++) {
    const velocity =
      dc.minVelocity +
      (i / (dc.data.cols - 1)) * (dc.maxVelocity - dc.minVelocity);
    for (let j = 0; j < dc.data.rows; j++) {
      const time =
        dc.minTime + (j / (dc.data.rows - 1)) * (dc.maxTime - dc.minTime);
      const depth = getDepth(time, velocity);
      const semblance = calcSemblanceForVelocityAndDepth(
        data,
        depth,
        velocity,
        dc.dx,
        dc.dt,
        dc.minTime,
        dc.maxTime,
        { loza: true },
        dc.cmpGate,
      );
      res.set(i, j, semblance);
    }
    self.postMessage({ type: 'progress', progress: (i + 1) / dc.data.cols });
  }
  self.postMessage({ type: 'complete', result: res });
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
  cmpGate: number,
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
  for (let w = -cmpGate; w <= cmpGate; w++) {
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

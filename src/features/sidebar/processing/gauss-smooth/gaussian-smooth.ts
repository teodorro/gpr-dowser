import Grid2D from '@/shared/grid2d';

function gaussianKernel(sigma: number): Float32Array {
  const radius = Math.max(1, Math.ceil(sigma * 3));
  const size = radius * 2 + 1;
  const kernel = new Float32Array(size);
  const twoSigmaSq = 2 * sigma * sigma;

  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    const w = Math.exp(-(i * i) / twoSigmaSq);
    kernel[i + radius] = w;
    sum += w;
  }
  for (let i = 0; i < size; i++) kernel[i] /= sum;

  return kernel;
}

function convolveHorizontal(
  src: Float32Array,
  dst: Float32Array,
  traceCount: number,
  sampleCount: number,
  kernel: Float32Array,
): void {
  const radius = (kernel.length - 1) / 2;

  for (let t = 0; t < traceCount; t++) {
    for (let s = 0; s < sampleCount; s++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        let tt = t + k;
        if (tt < 0) tt = 0;
        else if (tt >= traceCount) tt = traceCount - 1;
        acc += src[tt * sampleCount + s] * kernel[k + radius];
      }
      dst[t * sampleCount + s] = acc;
    }
  }
}

function convolveVertical(
  src: Float32Array,
  dst: Float32Array,
  traceCount: number,
  sampleCount: number,
  kernel: Float32Array,
): void {
  const radius = (kernel.length - 1) / 2;

  for (let t = 0; t < traceCount; t++) {
    const base = t * sampleCount;
    for (let s = 0; s < sampleCount; s++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        let ss = s + k;
        if (ss < 0) ss = 0;
        else if (ss >= sampleCount) ss = sampleCount - 1;
        acc += src[base + ss] * kernel[k + radius];
      }
      dst[base + s] = acc;
    }
  }
}

export function gaussianSmooth(
  bScan: Grid2D,
  sigmaHorizontal: number,
  sigmaVertical: number,
): Grid2D {
  let a = bScan.buffer.slice();
  let b = new Float32Array(bScan.cols * bScan.rows);

  if (sigmaHorizontal > 0) {
    convolveHorizontal(
      a,
      b,
      bScan.cols,
      bScan.rows,
      gaussianKernel(sigmaHorizontal),
    );
    [a, b] = [b, a];
  }
  if (sigmaVertical > 0) {
    convolveVertical(
      a,
      b,
      bScan.cols,
      bScan.rows,
      gaussianKernel(sigmaVertical),
    );
    // eslint-disable-next-line no-useless-assignment
    [a, b] = [b, a];
  }
  const res = new Grid2D(bScan.cols, bScan.rows, a);
  return res;
}

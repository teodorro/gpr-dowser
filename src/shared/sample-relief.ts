import { curveMonotoneX, line } from 'd3';

type Segment = {
  x0: number;
  y0: number;
  c1: number;
  c2: number;
  x1: number;
  y1: number;
};

const getCurveSegments = (points: [number, number][]): Segment[] => {
  const segments: Segment[] = [];
  let x0 = 0;
  let y0 = 0;
  const context = {
    moveTo(x: number, y: number) {
      x0 = x;
      y0 = y;
    },
    lineTo(x: number, y: number) {
      const c1 = y0 + (y - y0) / 3;
      const c2 = y - (y - y0) / 3;
      segments.push({ x0, y0, c1, c2, x1: x, y1: y });
      x0 = x;
      y0 = y;
    },
    bezierCurveTo(
      _c1x: number,
      c1: number,
      _c2x: number,
      c2: number,
      x: number,
      y: number,
    ) {
      segments.push({ x0, y0, c1, c2, x1: x, y1: y });
      x0 = x;
      y0 = y;
    },
    closePath() {},
  };
  line()
    .curve(curveMonotoneX)
    .context(context as unknown as CanvasRenderingContext2D)(points);
  return segments;
};

export const sampleRelief = (
  points: [number, number][],
  cols: number,
): Float32Array => {
  const values = new Float32Array(cols);
  if (points.length === 0) {
    return values;
  }

  const segments = getCurveSegments(points);
  const [firstX, firstY] = points[0];
  const [lastX, lastY] = points[points.length - 1];

  let index = 0;
  for (let col = 0; col < cols; col++) {
    if (col <= firstX) {
      values[col] = firstY;
    } else if (col >= lastX) {
      values[col] = lastY;
    } else {
      while (segments[index].x1 < col) {
        index++;
      }
      const { x0, y0, c1, c2, x1, y1 } = segments[index];
      const t = (col - x0) / (x1 - x0);
      const u = 1 - t;
      values[col] =
        u * u * u * y0 +
        3 * u * u * t * c1 +
        3 * u * t * t * c2 +
        t * t * t * y1;
    }
  }
  return values;
};

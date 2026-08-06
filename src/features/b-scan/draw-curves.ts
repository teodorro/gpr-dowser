import type Grid2D from '@/shared/grid2d';
import clamp from '@/visual/clamp';
import type { RefObject } from 'react';

export const drawCurves = (
  ctx: CanvasRenderingContext2D,
  displayBuffer: Grid2D,
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  shiftX: number,
  shiftY: number,
  scale: number,
  indexTimeZero: number,
  foregroundColor: string,
) => {
  if (displayBuffer.buffer.length === 0) return;
  const vp = vpRef.current;
  const rows = displayBuffer.rows;
  const cols = displayBuffer.cols;

  const wyMin = clamp((0 - shiftY) / scale, 0, rows);
  const wyMax = clamp((vp.h - shiftY) / scale, 0, rows);
  const wxMin = clamp((0 - shiftX) / scale, 0, cols);
  const wxMax = clamp((vp.w - shiftX) / scale, 0, cols);

  // TODO: delete this
  console.log(wyMin, wyMax, wxMin, wxMax);
  console.log(indexTimeZero);
  console.log(foregroundColor);
  console.log(ctx);
};

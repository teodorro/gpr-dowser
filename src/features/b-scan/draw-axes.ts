import * as d3 from "d3";
import type { RefObject } from "react";
import type Grid2D from "@/shared/grid2d";
import clamp from "@/visual/clamp";
import { LEFT_BORDER_WIDTH } from "@/stores/data-slice-stores";

export const drawAxes = (
  ctx: CanvasRenderingContext2D,
  displayBuffer: Grid2D,
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  shiftX: number,
  shiftY: number,
  scale: number,
  dx: number,
  dt: number,
  velocity: number,
  axisBorders: { left: number; top: number; right: number; bottom: number },
  backgroundColor: string,
  foregroundColor: string,
) => {
  if (displayBuffer.buffer.length === 0) return;
  const vp = vpRef.current;
  const rows = displayBuffer.rows;
  // const cols = displayBuffer.cols;

  console.log(shiftX, dx, velocity);
  const wyMin = clamp((0 - shiftY) / scale, 0, rows);
  const wyMax = clamp((vp.h - shiftY) / scale, 0, rows);
  // const wxMin = clamp((0 - tx) / scale, 0, cols);
  // const wxMax = clamp((vp.w - tx) / scale, 0, cols);

  drawTimeAxis(
    ctx,
    wyMin,
    wyMax,
    displayBuffer,
    vpRef,
    axisBorders,
    shiftX,
    shiftY,
    dt,
    scale,
    backgroundColor,
    foregroundColor,
  );
  // drawLengthAxis(ctx, wxMin, wxMax, bscan, vpRef, ruler, tx, dx, scale);
  // drawDepthAxis(
  //   ctx,
  //   wyMin,
  //   wyMax,
  //   bscan,
  //   vpRef,
  //   ruler,
  //   ty,
  //   dt,
  //   velocity,
  //   scale,
  // );
};

const drawTimeAxis = (
  ctx: CanvasRenderingContext2D,
  wyMin: number,
  wyMax: number,
  displayBuffer: Grid2D,
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  axisBorders: { left: number; top: number; right: number; bottom: number },
  shiftX: number,
  shiftY: number,
  dt: number,
  scale: number,
  backgroundColor: string,
  foregroundColor: string,
) => {
  const rows = displayBuffer.rows;
  const vp = vpRef.current;
  const tVisMin = wyMin * dt;
  const tVisMax = wyMax * dt;
  const axisShift = Math.max(0, shiftX - LEFT_BORDER_WIDTH);

  const minLabelPx = 36;
  let maxTicks = Math.max(2, Math.floor(vp.h / minLabelPx));
  if (scale < 1) {
    maxTicks = Math.floor(maxTicks * scale);
  }
  const ticks = d3.ticks(tVisMin, tVisMax, maxTicks);
  const step = d3.tickStep(tVisMin, tVisMax, maxTicks);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) {
    decimals = 1;
  }
  const fmt = d3.format(`.${decimals}f`);

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(axisShift, vp.y, axisBorders.left, vp.h);

  ctx.strokeStyle = foregroundColor;
  ctx.lineWidth = 1;

  const tToWy = d3
    .scaleLinear()
    .domain([0, rows * dt])
    .range([0, rows]);

  ctx.beginPath();
  ctx.moveTo(axisShift + axisBorders.left - 3, wyMin * scale + shiftY);
  ctx.lineTo(axisShift + axisBorders.left - 3, wyMax * scale + shiftY);
  ctx.stroke();

  ctx.save();
  const x = axisShift + 12;
  const y = ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + shiftY;
  ctx.translate(x, y);
  ctx.font = "12px Arial";
  ctx.fillStyle = foregroundColor;
  ctx.textBaseline = "middle";
  ctx.textAlign = "end";
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Время, нс", 0, 0);
  ctx.restore();

  for (const t of ticks) {
    const wy = tToWy(t);
    const y = vp.y + (wy * scale + shiftY);
    const label = fmt(t);

    if (y < vp.y || y > vp.y + vp.h) continue;

    ctx.beginPath();
    ctx.moveTo(axisShift + axisBorders.left - 8, y);
    ctx.lineTo(axisShift + axisBorders.left - 3, y);
    ctx.stroke();

    ctx.font = "12px Arial";
    ctx.fillStyle = foregroundColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "end";
    ctx.fillText(label, axisShift + axisBorders.left - 10, y);
  }
};

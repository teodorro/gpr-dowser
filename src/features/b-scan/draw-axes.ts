import * as d3 from "d3";
import type { RefObject } from "react";
import type Grid2D from "@/shared/grid2d";
import clamp from "@/visual/clamp";
import {
  LEFT_BORDER_WIDTH,
  RIGHT_BORDER_WIDTH,
  TOP_BORDER_HEIGHT,
  BOTTOM_BORDER_HEIGHT,
} from "@/stores/data-slice-stores";
import { t } from "i18next";

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
  const cols = displayBuffer.cols;

  console.log(shiftX, dx, velocity);
  const wyMin = clamp((0 - shiftY) / scale, 0, rows);
  const wyMax = clamp((vp.h - shiftY) / scale, 0, rows);
  const wxMin = clamp((0 - shiftX) / scale, 0, cols);
  const wxMax = clamp((vp.w - shiftX) / scale, 0, cols);

  drawLengthAxis(
    ctx,
    wxMin,
    wxMax,
    displayBuffer,
    vpRef,
    axisBorders,
    shiftX,
    shiftY,
    dx,
    scale,
    backgroundColor,
    foregroundColor,
  );
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
  drawDepthAxis(
    ctx,
    wxMax,
    wxMin,
    wyMin,
    wyMax,
    displayBuffer,
    vpRef,
    axisBorders,
    shiftX,
    shiftY,
    dt,
    velocity,
    scale,
    backgroundColor,
    foregroundColor,
  );
  drawLeftTopSquare(ctx, axisBorders, vpRef, shiftX, shiftY, backgroundColor);
  drawRightTopSquare(
    ctx,
    axisBorders,
    vpRef,
    wxMax,
    wxMin,
    scale,
    shiftX,
    shiftY,
    backgroundColor,
  );
};

const drawLeftTopSquare = (
  ctx: CanvasRenderingContext2D,
  axisBorders: { left: number; top: number; right: number; bottom: number },
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  shiftX: number,
  shiftY: number,
  backgroundColor: string,
) => {
  const vp = vpRef.current;
  const axisXShift = Math.max(
    0,
    Math.min(
      shiftX - LEFT_BORDER_WIDTH,
      vp.w - LEFT_BORDER_WIDTH - RIGHT_BORDER_WIDTH,
    ),
  );
  const axisYShift = Math.max(
    0,
    Math.min(
      shiftY - TOP_BORDER_HEIGHT,
      vp.h - TOP_BORDER_HEIGHT - BOTTOM_BORDER_HEIGHT,
    ),
  );

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(axisXShift, axisYShift, axisBorders.left, axisBorders.top);
};

const drawRightTopSquare = (
  ctx: CanvasRenderingContext2D,
  axisBorders: { left: number; top: number; right: number; bottom: number },
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  wxMax: number,
  wxMin: number,
  scale: number,
  shiftX: number,
  shiftY: number,
  backgroundColor: string,
) => {
  const vp = vpRef.current;
  const visibleBscanWidth = (wxMax - wxMin) * scale;
  const axisXShift = Math.max(
    0,
    Math.min(
      Math.max(
        visibleBscanWidth - LEFT_BORDER_WIDTH,
        shiftX + visibleBscanWidth - LEFT_BORDER_WIDTH,
      ),
      vpRef.current.w - LEFT_BORDER_WIDTH - RIGHT_BORDER_WIDTH,
    ),
  );
  const axisYShift = Math.max(
    0,
    Math.min(
      shiftY - TOP_BORDER_HEIGHT,
      vp.h - TOP_BORDER_HEIGHT - BOTTOM_BORDER_HEIGHT,
    ),
  );

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    axisXShift + axisBorders.left,
    axisYShift,
    axisBorders.right,
    axisBorders.top,
  );
};

const drawLengthAxis = (
  ctx: CanvasRenderingContext2D,
  wxMin: number,
  wxMax: number,
  displayBuffer: Grid2D,
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  axisBorders: { left: number; top: number; right: number; bottom: number },
  shiftX: number,
  shiftY: number,
  dx: number,
  scale: number,
  backgroundColor: string,
  foregroundColor: string,
) => {
  const rows = displayBuffer.cols;
  const vp = vpRef.current;
  const xVisMin = wxMin * dx;
  const xVisMax = wxMax * dx;
  const axisYShift = Math.max(
    0,
    Math.min(
      shiftY - TOP_BORDER_HEIGHT,
      vp.h - TOP_BORDER_HEIGHT - BOTTOM_BORDER_HEIGHT,
    ),
  );

  const minLabelPx = 64;
  const ticksDensity = Math.floor(((wxMax - wxMin) / minLabelPx) * scale);
  const ticks = d3.ticks(xVisMin, xVisMax, ticksDensity);
  const step = d3.tickStep(xVisMin, xVisMax, ticksDensity);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) {
    decimals = 1;
  }
  const fmx = d3.format(`.${decimals}f`);

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    wxMin * scale + shiftX,
    axisYShift,
    (wxMax - wxMin) * scale,
    axisBorders.top,
  );

  ctx.strokeStyle = foregroundColor;
  ctx.lineWidth = 1;

  const xToWx = d3
    .scaleLinear()
    .domain([0, rows * dx])
    .range([0, rows]);

  ctx.beginPath();
  ctx.moveTo(wxMin * scale + shiftX, axisYShift + axisBorders.top - 3);
  ctx.lineTo(wxMax * scale + shiftX, axisYShift + axisBorders.top - 3);
  ctx.stroke();

  ctx.font = "12px Arial";
  ctx.fillStyle = foregroundColor;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(
    t("Length"),
    ((wxMax - wxMin) / 2 + wxMin) * scale + shiftX,
    axisYShift + axisBorders.top - 35,
  );
  for (const t of ticks) {
    const wx = xToWx(t);
    const x = vp.x + (wx * scale + shiftX);
    const label = fmx(t);

    if (x < vp.x || x > vp.x + vp.w) continue;

    ctx.beginPath();
    ctx.moveTo(x, axisYShift + axisBorders.top - 8);
    ctx.lineTo(x, axisYShift + axisBorders.top - 3);
    ctx.stroke();

    ctx.font = "12px Arial";
    ctx.fillStyle = foregroundColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(label, x, axisYShift + axisBorders.top - 16);
  }
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
  const axisXShift = Math.max(
    0,
    Math.min(
      shiftX - LEFT_BORDER_WIDTH,
      vpRef.current.w - LEFT_BORDER_WIDTH - RIGHT_BORDER_WIDTH,
    ),
  );

  const minLabelPx = 32;
  const ticksDensity = Math.floor(((wyMax - wyMin) / minLabelPx) * scale);
  const ticks = d3.ticks(tVisMin, tVisMax, ticksDensity);
  const step = d3.tickStep(tVisMin, tVisMax, ticksDensity);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) {
    decimals = 1;
  }
  const fmt = d3.format(`.${decimals}f`);

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    axisXShift,
    wyMin * scale + shiftY,
    axisBorders.left,
    (wyMax - wyMin) * scale,
  );

  ctx.strokeStyle = foregroundColor;
  ctx.lineWidth = 1;

  const tToWy = d3
    .scaleLinear()
    .domain([0, rows * dt])
    .range([0, rows]);

  ctx.beginPath();
  ctx.moveTo(axisXShift + axisBorders.left - 3, wyMin * scale + shiftY);
  ctx.lineTo(axisXShift + axisBorders.left - 3, wyMax * scale + shiftY);
  ctx.stroke();

  ctx.save();
  const x = axisXShift + 12;
  const y = ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + shiftY;
  ctx.translate(x, y);
  ctx.font = "12px Arial";
  ctx.fillStyle = foregroundColor;
  ctx.textBaseline = "middle";
  ctx.textAlign = "end";
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(t("Time"), 0, 0);
  ctx.restore();

  for (const t of ticks) {
    const wy = tToWy(t);
    const y = vp.y + (wy * scale + shiftY);
    const label = fmt(t);

    if (y < vp.y || y > vp.y + vp.h) continue;

    ctx.beginPath();
    ctx.moveTo(axisXShift + axisBorders.left - 8, y);
    ctx.lineTo(axisXShift + axisBorders.left - 3, y);
    ctx.stroke();

    ctx.font = "12px Arial";
    ctx.fillStyle = foregroundColor;
    ctx.textBaseline = "top";
    ctx.textAlign = "end";
    ctx.fillText(label, axisXShift + axisBorders.left - 10, y);
  }
};

const drawDepthAxis = (
  ctx: CanvasRenderingContext2D,
  wxMax: number,
  wxMin: number,
  wyMin: number,
  wyMax: number,
  displayBuffer: Grid2D,
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  axisBorders: { left: number; top: number; right: number; bottom: number },
  shiftX: number,
  shiftY: number,
  dt: number,
  velocity: number,
  scale: number,
  backgroundColor: string,
  foregroundColor: string,
) => {
  const rows = displayBuffer.rows;
  const vp = vpRef.current;
  const tVisMin = (wyMin * dt * velocity) / 2;
  const tVisMax = (wyMax * dt * velocity) / 2;
  const visibleBscanWidth = (wxMax - wxMin) * scale;
  const axisXShift = Math.max(
    0,
    Math.min(
      Math.max(
        visibleBscanWidth - LEFT_BORDER_WIDTH,
        shiftX + visibleBscanWidth - LEFT_BORDER_WIDTH,
      ),
      vpRef.current.w - LEFT_BORDER_WIDTH - RIGHT_BORDER_WIDTH,
    ),
  );

  const minLabelPx = 32;
  const ticksDensity = Math.floor(((wyMax - wyMin) / minLabelPx) * scale);
  const ticks = d3.ticks(tVisMin, tVisMax, ticksDensity);
  const step = d3.tickStep(tVisMin, tVisMax, ticksDensity);
  let decimals = Math.max(0, -Math.floor(Math.log10(step)));
  if (!Number.isFinite(decimals)) {
    decimals = 1;
  }
  const fmt = d3.format(`.${decimals}f`);

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    axisXShift + axisBorders.left,
    wyMin * scale + shiftY,
    axisBorders.right,
    (wyMax - wyMin) * scale,
  );

  ctx.strokeStyle = foregroundColor;
  ctx.lineWidth = 1;

  const tToWy = d3
    .scaleLinear()
    .domain([0, (rows * dt * velocity) / 2])
    .range([0, rows]);

  ctx.beginPath();
  ctx.moveTo(axisXShift + axisBorders.left + 3, wyMin * scale + shiftY);
  ctx.lineTo(axisXShift + axisBorders.left + 3, wyMax * scale + shiftY);
  ctx.stroke();

  ctx.save();
  const x = axisXShift + axisBorders.left + 50;
  const y = ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + shiftY;
  ctx.translate(x, y);
  ctx.font = "12px Arial";
  ctx.fillStyle = foregroundColor;
  ctx.textBaseline = "middle";
  ctx.textAlign = "end";
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(t("Depth"), 0, 0);
  ctx.restore();

  for (const t of ticks) {
    const wy = tToWy(t);
    const y = vp.y + (wy * scale + shiftY);
    const label = fmt(t);

    if (y < vp.y || y > vp.y + vp.h) continue;

    ctx.beginPath();
    ctx.moveTo(axisXShift + axisBorders.left + 8, y);
    ctx.lineTo(axisXShift + axisBorders.left + 3, y);
    ctx.stroke();

    ctx.font = "12px Arial";
    ctx.fillStyle = foregroundColor;
    ctx.textBaseline = "top";
    ctx.textAlign = "start";
    ctx.fillText(label, axisXShift + axisBorders.left + 15, y);
  }
};

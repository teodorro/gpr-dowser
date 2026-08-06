import * as d3 from 'd3';
import type { RefObject } from 'react';
import type Grid2D from '@/shared/grid2d';
import clamp from '@/visual/clamp';
import {
  TIME_AXIS_WIDTH,
  DEPTH_AXIS_WIDTH,
  LENGTH_AXIS_HEIGHT,
  BOTTOM_BORDER_HEIGHT,
  PALLETTE_WIDTH,
} from '@/stores/data-slice-stores';
import { t } from 'i18next';
import { getPalette } from '@/visual/get-palette';
import { VELOCITY_WATER } from '@/shared/gpr-math';

export const drawSemblanceAxes = (
  ctx: CanvasRenderingContext2D,
  displayBuffer: Grid2D,
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  shiftX: number,
  shiftY: number,
  scale: number,
  dv: number,
  dt: number,
  indexTimeZero: number,
  axisBorders: { left: number; top: number; right: number; bottom: number },
  backgroundColor: string,
  foregroundColor: string,
  palette: string,
) => {
  if (displayBuffer.buffer.length === 0) return;
  const vp = vpRef.current;
  const rows = displayBuffer.rows;
  const cols = displayBuffer.cols;

  const wyMin = clamp((0 - shiftY) / scale, 0, rows);
  const wyMax = clamp((vp.h - shiftY) / scale, 0, rows);
  const wxMin = clamp((0 - shiftX) / scale, 0, cols);
  const wxMax = clamp((vp.w - shiftX) / scale, 0, cols);

  drawVelocityAxis(
    ctx,
    wxMin,
    wxMax,
    displayBuffer,
    vpRef,
    axisBorders,
    shiftX,
    shiftY,
    dv,
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
    indexTimeZero,
    scale,
    backgroundColor,
    foregroundColor,
  );

  drawVelocityAxis(
    ctx,
    wxMin,
    wxMax,
    displayBuffer,
    vpRef,
    axisBorders,
    shiftX,
    shiftY,
    dv,
    scale,
    backgroundColor,
    foregroundColor,
  );
  drawAmplitudeAxis(
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
    scale,
    palette,
    backgroundColor,
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
  const axisXShift =
    Math.max(
      0,
      Math.min(
        shiftX - TIME_AXIS_WIDTH,
        vp.w - TIME_AXIS_WIDTH - DEPTH_AXIS_WIDTH,
      ),
    ) - 12;
  const axisYShift = Math.max(
    0,
    Math.min(
      shiftY - LENGTH_AXIS_HEIGHT,
      vp.h - LENGTH_AXIS_HEIGHT - BOTTOM_BORDER_HEIGHT,
    ),
  );

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    axisXShift,
    axisYShift + axisBorders.top - 10,
    axisBorders.left - 1 + 12,
    9,
  );
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    axisXShift,
    axisYShift,
    axisBorders.left - 10 + 12,
    axisBorders.top - 1,
  );
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
        visibleBscanWidth - TIME_AXIS_WIDTH,
        shiftX + visibleBscanWidth - TIME_AXIS_WIDTH,
      ),
      vpRef.current.w - TIME_AXIS_WIDTH - PALLETTE_WIDTH - 4,
    ),
  );
  const axisYShift = Math.max(
    0,
    Math.min(
      shiftY - LENGTH_AXIS_HEIGHT,
      vp.h - LENGTH_AXIS_HEIGHT - BOTTOM_BORDER_HEIGHT,
    ),
  );

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    axisXShift + axisBorders.left + 10,
    axisYShift,
    axisBorders.right,
    axisBorders.top - 5,
  );
};

const drawVelocityAxis = (
  ctx: CanvasRenderingContext2D,
  wxMin: number,
  wxMax: number,
  displayBuffer: Grid2D,
  vpRef: RefObject<{ x: number; y: number; w: number; h: number }>,
  axisBorders: { left: number; top: number; right: number; bottom: number },
  shiftX: number,
  shiftY: number,
  dv: number,
  scale: number,
  backgroundColor: string,
  foregroundColor: string,
) => {
  const rows = displayBuffer.cols;
  const vp = vpRef.current;
  const xVisMin = VELOCITY_WATER + wxMin * dv;
  const xVisMax = VELOCITY_WATER + wxMax * dv;
  const axisYShift = Math.max(
    0,
    Math.min(
      shiftY - LENGTH_AXIS_HEIGHT,
      vp.h - LENGTH_AXIS_HEIGHT - BOTTOM_BORDER_HEIGHT,
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
    wxMin * scale + shiftX - 15,
    axisYShift,
    (wxMax - wxMin) * scale + 30,
    axisBorders.top - 1,
  );

  ctx.strokeStyle = foregroundColor;
  ctx.lineWidth = 1;

  const xToWx = d3
    .scaleLinear()
    .domain([VELOCITY_WATER, rows * dv + VELOCITY_WATER])
    .range([0, rows]);

  ctx.beginPath();
  ctx.moveTo(wxMin * scale + shiftX, axisYShift + axisBorders.top - 3);
  ctx.lineTo(wxMax * scale + shiftX, axisYShift + axisBorders.top - 3);
  ctx.stroke();

  ctx.font = '12px Arial';
  ctx.fillStyle = foregroundColor;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(
    t('Velocity'),
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

    ctx.font = '12px Arial';
    ctx.fillStyle = foregroundColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
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
  indexTimeZero: number,
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
      shiftX - TIME_AXIS_WIDTH,
      vpRef.current.w - TIME_AXIS_WIDTH - PALLETTE_WIDTH,
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
    .domain([-indexTimeZero * dt, (rows - indexTimeZero) * dt])
    .range([0, rows]);

  ctx.beginPath();
  ctx.moveTo(axisXShift + axisBorders.left - 3, wyMin * scale + shiftY);
  ctx.lineTo(axisXShift + axisBorders.left - 3, wyMax * scale + shiftY);
  ctx.stroke();

  ctx.save();
  const x = axisXShift + 12;
  const y = ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + shiftY;
  ctx.translate(x, y);
  ctx.font = '12px Arial';
  ctx.fillStyle = foregroundColor;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'end';
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(t('Time'), 0, 0);
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

    ctx.font = '12px Arial';
    ctx.fillStyle = foregroundColor;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'end';
    ctx.fillText(label, axisXShift + axisBorders.left - 10, y);
  }
};

const drawAmplitudeAxis = (
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
  scale: number,
  palette: string,
  backgroundColor: string,
) => {
  const rows = displayBuffer.rows;
  const vp = vpRef.current;
  const visibleBscanWidth = (wxMax - wxMin) * scale;
  const axisXShift = Math.max(
    8,
    Math.min(
      Math.max(
        visibleBscanWidth - TIME_AXIS_WIDTH + 8,
        shiftX + visibleBscanWidth - TIME_AXIS_WIDTH + 8,
      ),
      vpRef.current.w - TIME_AXIS_WIDTH - PALLETTE_WIDTH,
    ) - 5,
  );
  const axisYShift = Math.max(
    0,
    Math.min(
      shiftY - LENGTH_AXIS_HEIGHT,
      vp.h - LENGTH_AXIS_HEIGHT - BOTTOM_BORDER_HEIGHT,
    ),
  );

  ctx.save();
  const x = axisXShift + axisBorders.left + 50;
  const y = ((wyMax - wyMin) / 2 + wyMin) * scale - 40 + shiftY;
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.restore();
  const paletteLut = getPalette(palette);

  const yTop = Math.max(vp.y + shiftY, LENGTH_AXIS_HEIGHT);
  const yBottom = Math.min(
    vp.y + (rows * scale + shiftY),
    vp.h - BOTTOM_BORDER_HEIGHT,
  );

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    axisXShift + axisBorders.left - 3,
    axisYShift + axisBorders.top - 8,
    PALLETTE_WIDTH + 16,
    yBottom - yTop + 8,
  );

  const gradient = ctx.createLinearGradient(0, yTop, 0, yBottom);
  for (let i = 0; i < 256; i++) {
    gradient.addColorStop(
      i / 255,
      `rgb(${paletteLut[i * 4]}, ${paletteLut[i * 4 + 1]}, ${paletteLut[i * 4 + 2]})`,
    );
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(
    axisXShift + axisBorders.left + 3,
    yTop,
    PALLETTE_WIDTH,
    yBottom - yTop,
  );
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    axisXShift + axisBorders.left + 3,
    yTop,
    PALLETTE_WIDTH,
    yBottom - yTop,
  );
};

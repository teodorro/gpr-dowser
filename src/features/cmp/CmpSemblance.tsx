import { VELOCITY_LIGHT, VELOCITY_WATER } from '@/shared/gpr-math';
import { logTransformGrid2D } from '@/shared/log-transform';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import useVisualStore from '@/stores/visual-store';
import clamp from '@/visual/clamp';
import getPalette from '@/visual/get-palette';
import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import { getSemblanceData } from './get-semblance-data';

export default function CmpSemblance() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <CmpSemblanceInternal store={store} />;
}

function CmpSemblanceInternal({ store }: { store: DataStore }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);

  const { i18n } = useTranslation();

  const cmpShiftX = useStore(store, (s) => s.cmpShiftX);
  const cmpShiftY = useStore(store, (s) => s.cmpShiftY);
  const setCmpShift = useStore(store, (s) => s.setCmpShift);
  const setCmpIndexX = useStore(store, (s) => s.setCmpIndexX);
  const setCmpIndexY = useStore(store, (s) => s.setCmpIndexY);
  const cmpDisplayBuffer = useStore(store, (s) => s.cmpDisplayBuffer);
  const cmpScale = useStore(store, (s) => s.cmpScale);
  const setCmpScale = useStore(store, (s) => s.setCmpScale);
  const setCmpDisplayBuffer = useStore(store, (s) => s.setCmpDisplayBuffer);
  const cmpData = useStore(store, (s) => s.cmpData);
  const setCmpData = useStore(store, (s) => s.setCmpData);
  const bScan = useStore(store, (s) => s.bScan);
  const indexTimeZero = useStore(store, (s) => s.indexTimeZero);
  const dx = useStore(store, (s) => s.dx);
  const dt = useStore(store, (s) => s.dt);

  const selectedPalette = useVisualStore.use.selectedPalette();

  const palette = useMemo(() => getPalette(selectedPalette), [selectedPalette]);

  const vpRef = useRef<{ x: number; y: number; w: number; h: number }>({
    x: cmpShiftX,
    y: cmpShiftY,
    w: 0,
    h: 0,
  });

  const dragging = useRef<boolean>(false);
  const lastX = useRef<number>(cmpShiftX);
  const lastY = useRef<number>(cmpShiftY);

  const valueRange = useMemo(
    () => d3.extent(cmpDisplayBuffer.buffer),
    [cmpDisplayBuffer],
  );

  const dims = useMemo(() => {
    return { rows: cmpDisplayBuffer.rows, cols: cmpDisplayBuffer.cols };
  }, [cmpDisplayBuffer]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    const w = Math.floor(cssW * dpr);
    const h = Math.floor(cssH * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const vp = {
      x: 0,
      y: 0,
      w: cssW,
      h: cssH,
    };
    vpRef.current = vp;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    ctx.save();
    ctx.beginPath();
    ctx.rect(vp.x, vp.y, vp.w, vp.h);
    ctx.clip();

    const bmp = bitmapRef.current;

    if (bmp) {
      ctx.imageSmoothingEnabled = false;

      ctx.save();
      ctx.translate(vp.x + cmpShiftX, vp.y + cmpShiftY);
      ctx.scale(cmpScale, cmpScale);
      // Draw the “image” at world origin (0,0)
      ctx.drawImage(bmp, 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // drawAxes(
    //   ctx,
    //   displayBuffer,
    //   vpRef,
    //   shiftX,
    //   shiftY,
    //   scale,
    //   dx,
    //   dt,
    //   velocity,
    //   indexTimeZero,
    //   axisBorders,
    //   backgroundColor,
    //   foregroundColor,
    //   selectedPalette,
    // );
  }, [cmpScale, cmpShiftX, cmpShiftY, bitmapRef]);

  const convertDisplayBufferToImageData = useCallback((): ImageData | null => {
    const { rows, cols } = dims;
    const min = valueRange.length > 0 ? valueRange[0] : Infinity;
    const max = valueRange.length > 0 ? valueRange[1] : -Infinity;
    if (
      !rows ||
      !cols ||
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min == null ||
      max == null
    ) {
      return null;
    }

    const inv = 1 / (max - min);

    const img = new ImageData(cols, rows);
    const data = img.data;
    let p = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = cmpDisplayBuffer.buffer[x * rows + y];
        const t = clamp((v - min) * inv, 0, 1);
        const idx = (t * 255) | 0;
        const o = idx * 4;
        data[p++] = palette[o + 0];
        data[p++] = palette[o + 1];
        data[p++] = palette[o + 2];
        data[p++] = 255;
      }
    }
    return img;
  }, [cmpDisplayBuffer.buffer, dims, valueRange, palette]);

  const toViewportLocal = (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    return { sx: px - vpRef.current.x, sy: py - vpRef.current.y };
  };

  const getBscanIndexFromMouse = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left; // canvas-local CSS px
      const py = e.clientY - rect.top;

      // viewport-local screen
      const sx = px - vpRef.current.x;
      const sy = py - vpRef.current.y;

      const wx = (sx - cmpShiftX) / cmpScale;
      const wy = (sy - cmpShiftY) / cmpScale;

      const col = Math.floor(wx);
      const row = Math.floor(wy);

      const { rows, cols } = dims; // rows = bitmap height, cols = bitmap width
      if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
      if (sx < 0 || sy < 0 || sx > vpRef.current.w || sy > vpRef.current.h) {
        return null;
      }
      return { col, row, wx, wy, px, py };
    },
    [cmpShiftX, cmpShiftY, cmpScale, dims],
  );

  const redrawRef = useRef<() => void>(redraw);

  useEffect(() => {
    redrawRef.current = redraw;
  }, [redraw]);

  useEffect(() => {
    const observer = new MutationObserver(() => redrawRef.current());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => redrawRef.current());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function buildBitmap() {
      const img = convertDisplayBufferToImageData();

      if (!img) {
        bitmapRef.current = null;
        redraw();
        return;
      }

      const off = document.createElement('canvas');
      off.width = dims.cols;
      off.height = dims.rows;
      const offCtx = off.getContext('2d');
      if (!offCtx) return;
      offCtx.putImageData(img, 0, 0);

      const bmp = await createImageBitmap(off);
      if (cancelled) {
        bmp.close();
        return;
      }

      bitmapRef.current?.close?.();
      bitmapRef.current = bmp;

      redraw();
    }

    buildBitmap();
    return () => {
      cancelled = true;
    };
  }, [
    dims.rows,
    dims.cols,
    valueRange,
    palette,
    cmpScale,
    cmpShiftX,
    cmpShiftY,
    setCmpShift,
    setCmpScale,
    convertDisplayBufferToImageData,
    redraw,
    i18n.language,
  ]);

  // Mouse interactions: pan + wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: MouseEvent) => {
      dragging.current = true;
      const { sx, sy } = toViewportLocal(e, canvas);
      lastX.current = sx;
      lastY.current = sy;
    };

    const onMove = (e: MouseEvent) => {
      const { sx, sy } = toViewportLocal(e, canvas);
      const { col, row } = getBscanIndexFromMouse(e) ?? {
        col: undefined,
        row: undefined,
      };
      setCmpIndexX(col);
      setCmpIndexY(row);
      if (!dragging.current) return;

      const dx = sx - lastX.current;
      const dy = sy - lastY.current;
      lastX.current = sx;
      lastY.current = sy;
      setCmpShift(cmpShiftX + dx, cmpShiftY + dy);
    };

    const onUp = () => {
      dragging.current = false;
    };

    const onClick = (e: MouseEvent) => {
      // console.log('canvas clicked', e.clientX, e.clientY);
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // viewport-local screen
      const sx = px - vpRef.current.x;
      const sy = py - vpRef.current.y;

      // world coordinates
      const wx = (sx - cmpShiftX) / cmpScale;
      const wy = (sy - cmpShiftY) / cmpScale;
      const col = Math.floor(wx);
      const row = Math.floor(wy);

      console.log('cmp clicked', col, row);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left; // mouse in CSS px
      const py = e.clientY - rect.top;
      const mx = px - vpRef.current.x; // viewport-local
      const my = py - vpRef.current.y; // viewport-local

      // Zoom factor
      const zoom = Math.exp(-e.deltaY * 0.001);
      const next = clamp(cmpScale * zoom, 0.1, 40);

      // Zoom around cursor: adjust shiftX/shiftY so the point under cursor stays put
      const wx = (mx - cmpShiftX) / cmpScale;
      const wy = (my - cmpShiftY) / cmpScale;
      setCmpShift(mx - wx * next, my - wy * next);
      setCmpScale(next);
    };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('click', onClick);
    };
  }, [
    cmpScale,
    cmpShiftX,
    cmpShiftY,
    dims,
    setCmpShift,
    setCmpScale,
    getBscanIndexFromMouse,
    setCmpIndexX,
    setCmpIndexY,
  ]);

  useEffect(() => {
    const data = getSemblanceData(
      bScan,
      VELOCITY_WATER,
      VELOCITY_LIGHT,
      -indexTimeZero * dt,
      (bScan.rows - indexTimeZero) * dt,
      dx,
      dt,
    );
    setCmpData(data);
  }, [bScan, indexTimeZero, dt, dx, setCmpData]);

  useEffect(() => {
    setCmpDisplayBuffer(logTransformGrid2D(cmpData));
  }, [cmpData, setCmpDisplayBuffer]);

  return (
    <div className="relative flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden rounded-lg bg-scan text-scan-foreground shadow-sm">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
      />
    </div>
  );
}

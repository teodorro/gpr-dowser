import { dataSliceStores, type DataStore } from "@/stores/data-slice-stores";
import useFileRegistryStore from "@/stores/file-registry-store";
import clamp from "@/visual/clamp";
import getPalette from "@/visual/get-palette";
import * as d3 from "d3";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useStore } from "zustand";

export default function BScan() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 border-orange-500 border-solid border-2 bg-background text-foreground" />
    );
  }

  return <BScanInternal store={store} />;
}

function BScanInternal({ store }: { store: DataStore }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);

  const selectedPalette = useStore(store, (s) => s.selectedPalette);
  const displayBuffer = useStore(store, (s) => s.displayBuffer);
  const scale = useStore(store, (s) => s.scale);
  const shiftX = useStore(store, (s) => s.shiftX);
  const shiftY = useStore(store, (s) => s.shiftY);
  const setScale = useStore(store, (s) => s.setScale);
  const setShift = useStore(store, (s) => s.setShift);

  const vpRef = useRef<{ x: number; y: number; w: number; h: number }>({
    x: shiftX,
    y: shiftY,
    w: 0,
    h: 0,
  });

  const dragging = useRef<boolean>(false);
  const lastX = useRef<number>(shiftX);
  const lastY = useRef<number>(shiftY);

  const palette = useMemo(() => getPalette(selectedPalette), [selectedPalette]);

  const valueRange = useMemo(
    () => d3.extent(displayBuffer.buffer),
    [displayBuffer],
  );

  const dims = useMemo(() => {
    return { rows: displayBuffer.rows, cols: displayBuffer.cols };
  }, [displayBuffer]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
      ctx.translate(vp.x + shiftX, vp.y + shiftY);
      ctx.scale(scale, scale);
      // Draw the “image” at world origin (0,0)
      ctx.drawImage(bmp, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }, [scale, shiftX, shiftY, bitmapRef]);

  const redrawRef = useRef<() => void>(redraw);

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
        const v = displayBuffer.buffer[x * rows + y];
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
  }, [displayBuffer.buffer, dims, valueRange, palette]);

  const toViewportLocal = (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    return { sx: px - vpRef.current.x, sy: py - vpRef.current.y };
  };

  useEffect(() => {
    redrawRef.current = redraw;
  }, [redraw]);

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

      const off = document.createElement("canvas");
      off.width = dims.cols;
      off.height = dims.rows;
      const offCtx = off.getContext("2d");
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
    scale,
    shiftX,
    shiftY,
    setShift,
    setScale,
    convertDisplayBufferToImageData,
    redraw,
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
      if (!dragging.current) return;
      const dx = sx - lastX.current;
      const dy = sy - lastY.current;
      lastX.current = sx;
      lastY.current = sy;
      setShift(shiftX + dx, shiftY + dy);
    };
    const onUp = () => {
      dragging.current = false;
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
      const next = clamp(scale * zoom, 0.1, 40);

      // Zoom around cursor: adjust shiftX/shiftY so the point under cursor stays put
      const wx = (mx - shiftX) / scale;
      const wy = (my - shiftY) / scale;
      setShift(mx - wx * next, my - wy * next);
      setScale(next);
    };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [scale, shiftX, shiftY, dims, setShift, setScale]);

  return (
    <div className="relative flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden border-orange-500 border-solid border-2 bg-background text-foreground">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
      />
    </div>
  );
}

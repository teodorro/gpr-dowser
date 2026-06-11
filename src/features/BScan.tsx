import {
  createDataSliceStore,
  dataSliceStores,
} from "@/stores/data-slice-stores";
import useFileRegistry from "@/stores/file-registry-store";
import clamp from "@/visual/clamp";
import getPalette from "@/visual/get-palette";
import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import { useStore } from "zustand";

export default function BScan() {
  const selectedFileId = useFileRegistry.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 border-orange-500 border-solid border-2 bg-background text-foreground" />
    );
  }

  return <BScanCanvas store={store} />;
}

type DataStore = ReturnType<typeof createDataSliceStore>;

function BScanCanvas({ store }: { store: DataStore }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const vpRef = useRef<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  const selectedPalette = useStore(store, (s) => s.selectedPalette);
  const displayBuffer = useStore(store, (s) => s.displayBuffer);
  const scale = useStore(store, (s) => s.scale);
  const tx = useStore(store, (s) => s.tx);
  const ty = useStore(store, (s) => s.ty);

  const palette = useMemo(() => getPalette(selectedPalette), [selectedPalette]);

  const valueRange = useMemo(
    () => d3.extent(displayBuffer.buffer),
    [displayBuffer],
  );

  const dims = useMemo(() => {
    return { rows: displayBuffer.rows, cols: displayBuffer.cols };
  }, [displayBuffer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => redrawRef.current());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  const redraw = () => {
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
      ctx.translate(vp.x + tx, vp.y + ty);
      ctx.scale(scale, scale);
      // Draw the “image” at world origin (0,0)
      ctx.drawImage(bmp, 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // drawRulers(ctx, bscanToShow, vpRef, tx, ty, scale, dx, dt, velocity, ruler);
  };

  const redrawRef = useRef<() => void>(redraw);

  useEffect(() => {
    let cancelled = false;

    async function buildBitmap() {
      const { rows, cols } = dims;
      if (!rows || !cols) {
        bitmapRef.current = null;
        redraw();
        return;
      }

      let min = valueRange.length > 0 ? valueRange[0] : Infinity;
      let max = valueRange.length > 0 ? valueRange[1] : -Infinity;
      if (
        !Number.isFinite(min) ||
        !Number.isFinite(max) ||
        min == null ||
        max == null
      )
        return;
      if (!valueRange) {
        for (let y = 0; y < cols; y++) {
          const col = displayBuffer.getColumn(y);
          for (let x = 0; x < rows; x++) {
            const v = col[x];
            if (v < min) min = v;
            if (v > max) max = v;
          }
        }
        if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
          min = 0;
          max = 1;
        }
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

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.rows, dims.cols, valueRange, palette]);

  return (
    <div className="flex flex-col flex-1 border-orange-500 border-solid border-2 bg-background text-foreground">
      <canvas
        ref={canvasRef}
        className="border-white border-solid border-2 w-full h-full"
      />
    </div>
  );
}

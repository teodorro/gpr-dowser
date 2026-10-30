import { BACKSHIFT_HALFWAVES, getCmpLinePoint } from '@/shared/gpr-math';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import useVisualStore from '@/stores/visual-store';
import clamp from '@/visual/clamp';
import * as d3 from 'd3';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import { selectScaleX, selectScaleY } from '@/stores/visual-slice';

export default function CmpCurves() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <CmpCurvesInternal store={store} />;
}

function CmpCurvesInternal({ store }: { store: DataStore }) {
  const roRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const cmpLayers = useStore(store, (s) => s.cmpLayers);
  const scaleX = useStore(store, selectScaleX);
  const scaleY = useStore(store, selectScaleY);
  const shiftX = useStore(store, (s) => s.shiftX);
  const shiftY = useStore(store, (s) => s.shiftY);
  const indexTimeZero = useStore(store, (s) => s.indexTimeZero);
  const dt = useStore(store, (s) => s.dt);
  const dx = useStore(store, (s) => s.dx);
  const bScan = useStore(store, (s) => s.bScan);
  const lozaMode = useStore(store, (s) => s.lozaMode);
  const cmpHalfwave = useStore(store, (s) => s.cmpHalfwave);
  const backshift = useStore(store, (s) => s.backshift);

  const cmpBScanLinesColor = useVisualStore.use.bScanLinesColor();
  const bScanLinesWidth = useVisualStore.use.bScanLinesWidth();
  const bScanTransparency = useVisualStore.use.bScanTransparency();

  const setContainer = useCallback((node: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(node);
    roRef.current = ro;
  }, []);

  const wyMin = useMemo(
    () => clamp((0 - shiftY) / scaleY, 0, bScan.rows),
    [bScan.rows, scaleY, shiftY],
  );
  const wyMax = useMemo(
    () => clamp((size.height - shiftY) / scaleY, 0, bScan.rows),
    [bScan.rows, scaleY, shiftY, size.height],
  );
  const wxMin = useMemo(
    () => clamp((0 - shiftX) / scaleX, 0, bScan.cols),
    [bScan.cols, scaleX, shiftX],
  );
  const wxMax = useMemo(
    () => clamp((size.width - shiftX) / scaleX, 0, bScan.cols),
    [bScan.cols, scaleX, shiftX, size.width],
  );

  const tToWy = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([-indexTimeZero * dt, (bScan.rows - indexTimeZero) * dt])
        .range([0, bScan.rows]),
    [bScan.rows, indexTimeZero, dt],
  );

  const xToWx = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, bScan.cols * dx])
        .range([0, bScan.cols]),
    [bScan.cols, dx],
  );

  const timeToY = useCallback(
    (time: number) => tToWy(time) * scaleY + shiftY,
    [scaleY, shiftY, tToWy],
  );

  const distanceToX = useCallback(
    (distance: number) => xToWx(distance) * scaleX + shiftX,
    [scaleX, shiftX, xToWx],
  );

  const pathLineGenerator = useMemo(
    () =>
      d3
        .line<[number, number]>()
        .x((d) => distanceToX(d[0]))
        .y((d) => timeToY(d[1]))
        .curve(d3.curveCatmullRom),
    [distanceToX, timeToY],
  );

  const curvePoints = useMemo(
    () =>
      cmpLayers.layers.map((layer) => ({
        id: layer.id,
        points: Array.from({ length: bScan.cols }, (_, i) => {
          const x = i * dx;
          return [
            x,
            getCmpLinePoint(layer.time, layer.rmsVelocity, x, {
              loza: lozaMode,
              deltaTime: backshift ? cmpHalfwave * BACKSHIFT_HALFWAVES : 0,
            }),
          ] as [number, number];
        }),
      })),
    [cmpLayers.layers, bScan.cols, dx, lozaMode, cmpHalfwave, backshift],
  );

  return (
    <div
      ref={setContainer}
      className="absolute inset-0 min-w-0 min-h-0 overflow-hidden pointer-events-none"
    >
      <svg
        width={size.width}
        height={size.height}
        className="block"
        style={{ overflow: 'hidden', backgroundColor: 'transparent' }}
      >
        <clipPath id="cmp-curves">
          <rect x={0} y={0} width={size.width} height={size.height} />
        </clipPath>
        <rect
          x={wxMin * scaleX + shiftX}
          y={wyMin * scaleY + shiftY}
          width={(wxMax - wxMin) * scaleX}
          height={(wyMax - wyMin) * scaleY}
          fill={`rgba(255, 255, 255, ${bScanTransparency})`}
        />
        {curvePoints.map(({ id, points }) => (
          <path
            key={id}
            d={pathLineGenerator(points) ?? ''}
            clipPath="url(#cmp-curves)"
            fill="none"
            stroke={cmpBScanLinesColor}
            strokeWidth={bScanLinesWidth}
          />
        ))}
      </svg>
    </div>
  );
}

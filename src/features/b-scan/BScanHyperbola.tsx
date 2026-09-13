import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import useVisualStore from '@/stores/visual-store';
import clamp from '@/visual/clamp';
import { useCallback, useMemo, useState } from 'react';
import { useRef } from 'react';
import { useStore } from 'zustand';
import * as d3 from 'd3';

export default function BScanHyperbola() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <BScanHyperbolaInternal store={store} />;
}

function BScanHyperbolaInternal({ store }: { store: DataStore }) {
  const roRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const scale = useStore(store, (s) => s.scale);
  const shiftX = useStore(store, (s) => s.shiftX);
  const shiftY = useStore(store, (s) => s.shiftY);
  const indexTimeZero = useStore(store, (s) => s.indexTimeZero);
  const dt = useStore(store, (s) => s.dt);
  const dx = useStore(store, (s) => s.dx);
  const velocity = useStore(store, (s) => s.velocity);
  const bScan = useStore(store, (s) => s.bScan);
  const hyperbolaApex = useStore(store, (s) => s.hyperbolaApex);

  const cmpBScanLinesColor = useVisualStore.use.bScanLinesColor();
  const bScanCmpTransparency = useVisualStore.use.bScanTransparency();

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
    () => clamp((0 - shiftY) / scale, 0, bScan.rows),
    [bScan.rows, scale, shiftY],
  );
  const wyMax = useMemo(
    () => clamp((size.height - shiftY) / scale, 0, bScan.rows),
    [bScan.rows, scale, shiftY, size.height],
  );
  const wxMin = useMemo(
    () => clamp((0 - shiftX) / scale, 0, bScan.cols),
    [bScan.cols, scale, shiftX],
  );
  const wxMax = useMemo(
    () => clamp((size.width - shiftX) / scale, 0, bScan.cols),
    [bScan.cols, scale, shiftX, size.width],
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
    (time: number) => tToWy(time) * scale + shiftY,
    [scale, shiftY, tToWy],
  );

  const distanceToX = useCallback(
    (distance: number) => xToWx(distance) * scale + shiftX,
    [scale, shiftX, xToWx],
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

  const hyperbolaPoints = useMemo(() => {
    const x0 = hyperbolaApex[0] * dx;
    const t0 = (hyperbolaApex[1] - indexTimeZero) * dt;
    const points: [number, number][] = Array.from(
      { length: bScan.cols },
      (_, i) => {
        const x = i * dx;
        const t = Math.sqrt(
          (4 * Math.pow(x - x0, 2)) / velocity ** 2 + Math.pow(t0, 2),
        );
        return [x, t];
      },
    );
    return points;
  }, [bScan.cols, dx, dt, hyperbolaApex, velocity, indexTimeZero]);

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
          x={wxMin * scale + shiftX}
          y={wyMin * scale + shiftY}
          width={(wxMax - wxMin) * scale}
          height={(wyMax - wyMin) * scale}
          fill={`rgba(255, 255, 255, ${bScanCmpTransparency})`}
        />
        <path
          d={pathLineGenerator(hyperbolaPoints) ?? ''}
          clipPath="url(#cmp-curves)"
          fill="none"
          stroke={cmpBScanLinesColor}
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}

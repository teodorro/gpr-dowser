import { VELOCITY_LIGHT, VELOCITY_WATER } from '@/shared/gpr-math';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import useVisualStore from '@/stores/visual-store';
import * as d3 from 'd3';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';

export default function CmpSemblanceLines() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <CmpSemblanceLinesInternal store={store} />;
}

function CmpSemblanceLinesInternal({ store }: { store: DataStore }) {
  const roRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const cmpLayers = useStore(store, (s) => s.cmpLayers);
  const cmpScale = useStore(store, (s) => s.cmpScale);
  const cmpShiftX = useStore(store, (s) => s.cmpShiftX);
  const cmpShiftY = useStore(store, (s) => s.cmpShiftY);
  const cmpData = useStore(store, (s) => s.cmpData);
  const indexTimeZero = useStore(store, (s) => s.indexTimeZero);
  const dt = useStore(store, (s) => s.dt);

  const cmpSemblanceLinesColor = useVisualStore.use.cmpSemblanceLinesColor();

  const dv = useMemo(
    () => (VELOCITY_LIGHT - VELOCITY_WATER) / cmpData.cols,
    [cmpData.cols],
  );

  const vToWx = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([VELOCITY_WATER, VELOCITY_LIGHT])
        .range([0, cmpData.cols]),
    [cmpData.cols],
  );

  const tToWy = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([-indexTimeZero * dt, (cmpData.rows - indexTimeZero) * dt])
        .range([0, cmpData.rows]),
    [cmpData.rows, indexTimeZero, dt],
  );

  const getVelocityInRange = (velocity: number) => {
    return Math.max(VELOCITY_WATER, Math.min(velocity, VELOCITY_LIGHT));
  };

  const velocityToX = useCallback(
    (velocity: number) =>
      vToWx(getVelocityInRange(velocity + dv / 2)) * cmpScale + cmpShiftX,
    [cmpScale, cmpShiftX, vToWx, dv],
  );

  const timeToY = useCallback(
    (time: number) => tToWy(time + dt / 2) * cmpScale + cmpShiftY,
    [cmpScale, cmpShiftY, tToWy, dt],
  );

  const pathLineGenerator = useMemo(() => {
    return d3
      .line<[number, number]>()
      .x((d) => velocityToX(d[1]))
      .y((d) => timeToY(d[0]))
      .curve(d3.curveStepAfter);
  }, [velocityToX, timeToY]);

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
        <clipPath id="cmp-chart">
          <rect x={0} y={0} width={size.width} height={size.height} />
        </clipPath>
        {cmpLayers.layers.length > 0 && (
          <path
            d={
              pathLineGenerator([
                [-indexTimeZero * dt, cmpLayers.layers?.[0]?.velocity ?? 0],
                ...cmpLayers.layers.map((l): [number, number] => [
                  l.time,
                  l.velocity,
                ]),
              ]) ?? ''
            }
            clipPath="url(#cmp-chart)"
            fill="none"
            stroke={cmpSemblanceLinesColor}
            strokeWidth={1.5}
            strokeDasharray="5,5"
          />
        )}
        {cmpLayers.layers.length > 0 && (
          <path
            d={
              pathLineGenerator([
                [-indexTimeZero * dt, cmpLayers.layers?.[0]?.rmsVelocity ?? 0],
                ...cmpLayers.layers.map((l): [number, number] => [
                  l.time,
                  l.rmsVelocity,
                ]),
              ]) ?? ''
            }
            clipPath="url(#cmp-chart)"
            fill="none"
            stroke={cmpSemblanceLinesColor}
            strokeWidth={1}
          />
        )}
      </svg>
    </div>
  );
}

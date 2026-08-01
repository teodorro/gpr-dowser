import {
  BOTTOM_BORDER_HEIGHT,
  dataSliceStores,
  LENGTH_AXIS_HEIGHT,
  PALLETTE_WIDTH,
  TIME_AXIS_WIDTH,
  type DataStore,
} from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import clamp from '@/visual/clamp';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import * as d3 from 'd3';
import { VELOCITY_LIGHT, VELOCITY_WATER } from '@/shared/gpr-math';
import getPalette from '@/visual/get-palette';
import useVisualStore from '@/stores/visual-store';

export default function CmpSemblanceAxes() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <CmpSemblanceAxesInternal store={store} />;
}

function CmpSemblanceAxesInternal({ store }: { store: DataStore }) {
  const roRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const cmpData = useStore(store, (s) => s.cmpData);
  const cmpScale = useStore(store, (s) => s.cmpScale);
  const cmpShiftX = useStore(store, (s) => s.cmpShiftX);
  const cmpShiftY = useStore(store, (s) => s.cmpShiftY);
  const indexTimeZero = useStore(store, (s) => s.indexTimeZero);
  const dt = useStore(store, (s) => s.dt);

  const palette = useVisualStore.use.selectedPalette();

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
    () => clamp((0 - cmpShiftY) / cmpScale, 0, cmpData.rows),
    [cmpData.rows, cmpScale, cmpShiftY],
  );
  const wyMax = useMemo(
    () => clamp((size.height - cmpShiftY) / cmpScale, 0, cmpData.rows),
    [cmpData.rows, cmpScale, cmpShiftY, size.height],
  );
  const wxMin = useMemo(
    () => clamp((0 - cmpShiftX) / cmpScale, 0, cmpData.cols),
    [cmpData.cols, cmpScale, cmpShiftX],
  );
  const wxMax = useMemo(
    () => clamp((size.width - cmpShiftX) / cmpScale, 0, cmpData.cols),
    [cmpData.cols, cmpScale, cmpShiftX, size.width],
  );
  const dv = useMemo(
    () => (VELOCITY_LIGHT - VELOCITY_WATER) / cmpData.cols,
    [cmpData.cols],
  );

  const vDomainRange = useMemo(() => {
    const vMin = VELOCITY_WATER + dv * wxMin;
    const vMax = VELOCITY_WATER + dv * wxMax;
    return d3
      .scaleLinear()
      .domain([vMin, vMax])
      .range([wxMin * cmpScale + cmpShiftX, wxMax * cmpScale + cmpShiftX])
      .nice();
  }, [dv, wxMin, wxMax, cmpScale, cmpShiftX]);

  const tDomainRange = useMemo(() => {
    const tMin = (-indexTimeZero + wyMin) * dt;
    const tMax = (-indexTimeZero + wyMax) * dt;
    return d3
      .scaleLinear()
      .domain([tMin, tMax])
      .range([wyMin * cmpScale + cmpShiftY, wyMax * cmpScale + cmpShiftY]);
  }, [indexTimeZero, dt, cmpScale, cmpShiftY, wyMin, wyMax]);

  const axisVelocityYShift = useMemo(() => {
    return Math.max(
      0,
      Math.min(
        cmpShiftY - LENGTH_AXIS_HEIGHT,
        size.height - LENGTH_AXIS_HEIGHT,
      ),
    );
  }, [cmpShiftY, size.height]);

  const paletteLut = useMemo(() => getPalette(palette), [palette]);

  const paletteStops = useMemo(() => {
    const n = 256;
    return Array.from({ length: n + 1 }, (_, i) => ({
      offset: i / n,
      color: `rgb(${paletteLut[Math.round(i * 4)]}, ${paletteLut[Math.round(i * 4 + 1)]}, ${paletteLut[Math.round(i * 4 + 2)]})`,
    }));
  }, [paletteLut]);

  const axisXShift = useMemo(
    () =>
      Math.max(
        TIME_AXIS_WIDTH - 2,
        Math.min(cmpShiftX - 2, size.width - PALLETTE_WIDTH - 2),
      ),
    [cmpShiftX, size.width],
  );

  const velocityAxisRef = useRef<SVGGElement | null>(null);

  const axisXAmpShift = useMemo(
    () =>
      Math.max(
        8,
        Math.min(
          Math.max(
            (wxMax - wxMin) * cmpScale - TIME_AXIS_WIDTH + 8,
            cmpShiftX + (wxMax - wxMin) * cmpScale - TIME_AXIS_WIDTH + 8,
          ),
          size.width - TIME_AXIS_WIDTH - PALLETTE_WIDTH,
        ) - 5,
      ),
    [cmpShiftX, size.width, wxMax, wxMin, cmpScale],
  );

  const paletteHeight = useMemo(() => {
    const h = Math.max(
      0,
      Math.min(
        cmpData.rows * cmpScale + cmpShiftY,
        size.height - BOTTOM_BORDER_HEIGHT,
      ) - Math.max(cmpShiftY, LENGTH_AXIS_HEIGHT),
    );
    return h;
  }, [cmpData.rows, cmpScale, cmpShiftY, size.height]);

  useEffect(() => {
    const g = velocityAxisRef.current;
    if (!g) return;
    const [r0, r1] = vDomainRange.range();
    const pixelWidth = Math.abs(r1 - r0);
    const tickCount = Math.max(1, Math.round(pixelWidth / 70));
    const velocityAxis = d3
      .axisTop(vDomainRange)
      .ticks(tickCount)
      .tickFormat(d3.format('.3~f'));
    d3.select(g)
      .call(velocityAxis)
      .selectAll('.tick text')
      .attr('font-size', '12px');
  }, [vDomainRange]);

  const timeAxisRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const g = timeAxisRef.current;
    if (!g) return;
    const [r0, r1] = tDomainRange.range();
    const pixelWidth = Math.abs(r1 - r0);
    const tickCount = Math.max(1, Math.round(pixelWidth / 50));
    const timeAxis = d3
      .axisLeft(tDomainRange)
      .ticks(tickCount)
      .tickFormat(d3.format('.3~f'));
    d3.select(g)
      .call(timeAxis)
      .selectAll('.tick text')
      .attr('font-size', '12px')
      .attr('dx', '0.1em')
      .attr('dy', '0.7em')
      .attr('text-anchor', 'end');
  }, [tDomainRange]);

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
        <rect
          x={0}
          y={0}
          width={TIME_AXIS_WIDTH}
          height={size.height}
          className="fill-scan"
        />
        <g
          ref={timeAxisRef}
          className="text-scan-foreground"
          transform={`translate(${axisXShift}, 0)`}
        ></g>
        <rect
          x={TIME_AXIS_WIDTH + axisXAmpShift - 3}
          y={axisVelocityYShift - 2}
          width={TIME_AXIS_WIDTH}
          height={size.height}
          className="fill-scan"
        />
        <defs>
          <linearGradient
            id="cmp-palette"
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={axisVelocityYShift + LENGTH_AXIS_HEIGHT}
            x2={0}
            y2={axisVelocityYShift + LENGTH_AXIS_HEIGHT + paletteHeight}
          >
            {paletteStops.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
        <rect
          x={TIME_AXIS_WIDTH + axisXAmpShift}
          y={axisVelocityYShift + LENGTH_AXIS_HEIGHT}
          width={PALLETTE_WIDTH}
          height={paletteHeight}
          fill="url(#cmp-palette)"
          stroke="gray"
        />
        <rect
          x={0}
          y={axisVelocityYShift - 2}
          width={size.width}
          height={LENGTH_AXIS_HEIGHT + 2}
          className="fill-scan"
        />
        <g
          ref={velocityAxisRef}
          className="text-scan-foreground"
          transform={`translate(0, ${axisVelocityYShift + LENGTH_AXIS_HEIGHT - 2})`}
        ></g>
        <rect
          x={0}
          y={axisVelocityYShift + LENGTH_AXIS_HEIGHT - 8}
          width={TIME_AXIS_WIDTH}
          height={8}
          className="fill-scan"
        />
        <rect
          x={0}
          y={axisVelocityYShift}
          width={TIME_AXIS_WIDTH - 12}
          height={LENGTH_AXIS_HEIGHT}
          className="fill-scan"
        />
        <rect
          x={TIME_AXIS_WIDTH + axisXAmpShift - 2}
          y={axisVelocityYShift + LENGTH_AXIS_HEIGHT - 8}
          width={TIME_AXIS_WIDTH}
          height={8}
          className="fill-scan"
        />
        <rect
          x={TIME_AXIS_WIDTH + axisXAmpShift + 12}
          y={axisVelocityYShift}
          width={TIME_AXIS_WIDTH - 5}
          height={LENGTH_AXIS_HEIGHT}
          className="fill-scan"
        />
      </svg>
    </div>
  );
}

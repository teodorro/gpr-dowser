import {
  BOTTOM_BORDER_HEIGHT,
  dataSliceStores,
  DEPTH_AXIS_WIDTH,
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
import getPalette from '@/visual/get-palette';
import useVisualStore from '@/stores/visual-store';
import { useTranslation } from 'react-i18next';

export default function BScanAxes() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <BScanAxesInternal store={store} />;
}

function BScanAxesInternal({ store }: { store: DataStore }) {
  const roRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const bScan = useStore(store, (s) => s.bScan);
  const scale = useStore(store, (s) => s.scale);
  const shiftX = useStore(store, (s) => s.shiftX);
  const shiftY = useStore(store, (s) => s.shiftY);
  const indexTimeZero = useStore(store, (s) => s.indexTimeZero);
  const dt = useStore(store, (s) => s.dt);
  const dx = useStore(store, (s) => s.dx);
  const velocity = useStore(store, (s) => s.velocity);

  const palette = useVisualStore.use.selectedPalette();

  const { t } = useTranslation();

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

  const dz = useMemo(() => (velocity / 2) * dt, [velocity, dt]);

  const xDomainRange = useMemo(() => {
    const xMin = dx * wxMin;
    const xMax = dx * wxMax;
    return d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([wxMin * scale + shiftX, wxMax * scale + shiftX]);
  }, [dx, wxMin, wxMax, scale, shiftX]);

  const tDomainRange = useMemo(() => {
    const tMin = (-indexTimeZero + wyMin) * dt;
    const tMax = (-indexTimeZero + wyMax) * dt;
    return d3
      .scaleLinear()
      .domain([tMin, tMax])
      .range([wyMin * scale + shiftY, wyMax * scale + shiftY]);
  }, [indexTimeZero, dt, scale, shiftY, wyMin, wyMax]);

  const zDomainRange = useMemo(() => {
    const zMin = (-indexTimeZero + wyMin) * dz;
    const zMax = (-indexTimeZero + wyMax) * dz;
    return d3
      .scaleLinear()
      .domain([zMin, zMax])
      .range([wyMin * scale + shiftY, wyMax * scale + shiftY]);
  }, [indexTimeZero, dz, scale, shiftY, wyMin, wyMax]);

  const axisYShift = useMemo(() => {
    return Math.max(
      0,
      Math.min(shiftY - LENGTH_AXIS_HEIGHT, size.height - LENGTH_AXIS_HEIGHT),
    );
  }, [shiftY, size.height]);

  const timeLabelY = useMemo(() => {
    const [r0, r1] = tDomainRange.range();
    return (r0 + r1) / 2;
  }, [tDomainRange]);

  const paletteLut = useMemo(() => getPalette(palette), [palette]);

  // const paletteStops = useMemo(() => {
  //   const n = 256;
  //   return Array.from({ length: n }, (_, i) => ({
  //     offset: i / (n - 1),
  //     color: `rgb(${paletteLut[i * 4]}, ${paletteLut[i * 4 + 1]}, ${paletteLut[i * 4 + 2]})`,
  //   }));
  // }, [paletteLut]);

  const paletteStops = useMemo(() => {
    const n = 64;
    return Array.from({ length: n }, (_, i) => ({
      offset: i / (n - 1),
      color: `rgb(${paletteLut[i * 16]}, ${paletteLut[i * 16 + 1]}, ${paletteLut[i * 16 + 2]})`,
    }));
  }, [paletteLut]);

  const axisXShift = useMemo(
    () =>
      Math.max(
        TIME_AXIS_WIDTH - 2,
        Math.min(shiftX - 2, size.width - PALLETTE_WIDTH - 2),
      ),
    [shiftX, size.width],
  );

  const lengthLabelX = useMemo(() => {
    const [r0, r1] = xDomainRange.range();
    return (r0 + r1) / 2;
  }, [xDomainRange]);

  const xAxisRef = useRef<SVGGElement | null>(null);

  const axisXDepthShift = useMemo(
    () =>
      Math.max(
        0,
        Math.min(
          Math.max(
            (wxMax - wxMin) * scale - TIME_AXIS_WIDTH,
            shiftX + (wxMax - wxMin) * scale - TIME_AXIS_WIDTH,
          ),
          size.width - TIME_AXIS_WIDTH - DEPTH_AXIS_WIDTH - PALLETTE_WIDTH,
        ),
      ),
    [shiftX, size.width, wxMax, wxMin, scale],
  );

  const depthLabelX = useMemo(() => {
    const [r0, r1] = zDomainRange.range();
    return (r0 + r1) / 2;
  }, [zDomainRange]);

  const depthAxisRef = useRef<SVGGElement | null>(null);

  const paletteHeight = useMemo(() => {
    const h = Math.max(
      0,
      Math.min(
        bScan.rows * scale + shiftY,
        size.height - BOTTOM_BORDER_HEIGHT,
      ) - Math.max(shiftY, LENGTH_AXIS_HEIGHT),
    );
    return h;
  }, [bScan.rows, scale, shiftY, size.height]);

  const axisXAmpShift = useMemo(
    () =>
      Math.max(
        DEPTH_AXIS_WIDTH,
        Math.min(
          Math.max(
            (wxMax - wxMin) * scale - TIME_AXIS_WIDTH + DEPTH_AXIS_WIDTH,
            shiftX +
              (wxMax - wxMin) * scale -
              TIME_AXIS_WIDTH +
              DEPTH_AXIS_WIDTH,
          ),
          size.width - TIME_AXIS_WIDTH - PALLETTE_WIDTH,
        ) - 5,
      ),
    [shiftX, size.width, wxMax, wxMin, scale],
  );

  useEffect(() => {
    const g = xAxisRef.current;
    if (!g) return;
    const [r0, r1] = xDomainRange.range();
    const pixelWidth = Math.abs(r1 - r0);
    const tickCount = Math.max(1, Math.round(pixelWidth / 70));
    const xAxis = d3
      .axisTop(xDomainRange)
      .ticks(tickCount)
      .tickFormat(d3.format('.3~f'));
    d3.select(g).call(xAxis).selectAll('.tick text').attr('font-size', '12px');
  }, [xDomainRange]);

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

  useEffect(() => {
    const g = depthAxisRef.current;
    if (!g) return;
    const [r0, r1] = zDomainRange.range();
    const pixelWidth = Math.abs(r1 - r0);
    const tickCount = Math.max(1, Math.round(pixelWidth / 50));
    const depthAxis = d3
      .axisRight(zDomainRange)
      .ticks(tickCount)
      .tickFormat(d3.format('.3~f'));
    d3.select(g)
      .call(depthAxis)
      .selectAll('.tick text')
      .attr('font-size', '12px')
      .attr('dx', '0.2em')
      .attr('dy', '0.7em')
      .attr('text-anchor', 'start');
  }, [zDomainRange]);

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
        <clipPath id="b-scan-chart">
          <rect x={0} y={0} width={size.width} height={size.height} />
        </clipPath>

        {/* Time axis */}
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
        <text
          x={axisXShift - TIME_AXIS_WIDTH + 12}
          y={timeLabelY}
          className="text-scan-foreground"
          fill="currentColor"
          fontSize={12}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(-90, ${axisXShift - TIME_AXIS_WIDTH + 12}, ${timeLabelY})`}
        >
          {t('Time')}
        </text>

        {/* Depth axis */}
        <rect
          x={axisXDepthShift + TIME_AXIS_WIDTH}
          y={0}
          width={DEPTH_AXIS_WIDTH}
          height={size.height}
          className="fill-scan"
        />
        <g
          ref={depthAxisRef}
          className="text-scan-foreground"
          transform={`translate(${axisXDepthShift + TIME_AXIS_WIDTH}, 0)`}
        ></g>
        <text
          x={axisXDepthShift + TIME_AXIS_WIDTH + 16}
          y={depthLabelX + 12}
          className="text-scan-foreground"
          fill="currentColor"
          fontSize={12}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(-90, ${axisXDepthShift + TIME_AXIS_WIDTH + 12}, ${timeLabelY - 12})`}
        >
          {t('Depth')}
        </text>

        {/* Amplitude axis */}
        <rect
          x={TIME_AXIS_WIDTH + axisXAmpShift - 3}
          y={axisYShift - 2}
          width={TIME_AXIS_WIDTH}
          height={size.height}
          className="fill-scan"
        />
        <defs>
          <linearGradient
            id="b-scan-palette"
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={axisYShift + LENGTH_AXIS_HEIGHT}
            x2={0}
            y2={axisYShift + LENGTH_AXIS_HEIGHT + paletteHeight}
          >
            {paletteStops.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
        <rect
          x={TIME_AXIS_WIDTH + axisXAmpShift}
          y={axisYShift + LENGTH_AXIS_HEIGHT}
          width={PALLETTE_WIDTH}
          height={paletteHeight}
          fill="url(#b-scan-palette)"
          stroke="gray"
        />

        {/* Length axis */}
        <rect
          x={0}
          y={axisYShift - 2}
          width={size.width}
          height={LENGTH_AXIS_HEIGHT + 2}
          className="fill-scan"
        />
        <g
          ref={xAxisRef}
          className="text-scan-foreground"
          transform={`translate(0, ${axisYShift + LENGTH_AXIS_HEIGHT - 2})`}
        ></g>
        <text
          x={lengthLabelX}
          y={axisYShift + LENGTH_AXIS_HEIGHT - 35}
          className="text-scan-foreground"
          fill="currentColor"
          fontSize={12}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {t('Length')}
        </text>

        {/* Hide corners */}
        <rect
          x={0}
          y={axisYShift + LENGTH_AXIS_HEIGHT - 8}
          width={TIME_AXIS_WIDTH}
          height={8}
          className="fill-scan"
        />
        <rect
          x={0}
          y={axisYShift}
          width={TIME_AXIS_WIDTH - 12}
          height={LENGTH_AXIS_HEIGHT}
          className="fill-scan"
        />
        <rect
          x={TIME_AXIS_WIDTH + axisXDepthShift - 2}
          y={axisYShift + LENGTH_AXIS_HEIGHT - 8}
          width={TIME_AXIS_WIDTH + DEPTH_AXIS_WIDTH}
          height={8}
          className="fill-scan"
        />
        <rect
          x={TIME_AXIS_WIDTH + axisXDepthShift + 12}
          y={axisYShift}
          width={TIME_AXIS_WIDTH + DEPTH_AXIS_WIDTH - 5}
          height={LENGTH_AXIS_HEIGHT}
          className="fill-scan"
        />
      </svg>
    </div>
  );
}

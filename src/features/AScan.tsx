import type { DataStore } from '@/stores/data-slice-stores';
import type Grid2D from '@/shared/grid2d';
import useFileRegistryStore from '@/stores/file-registry-store';
import { useUiStore } from '@/stores/ui-store';
import {
  dataSliceStores,
  LENGTH_AXIS_HEIGHT,
} from '@/stores/data-slice-stores';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import * as d3 from 'd3';

const MARGIN = { right: 8, left: 8 };
const TOP_AXIS = LENGTH_AXIS_HEIGHT;

export default function AScan() {
  const { aScanVisible } = useUiStore();
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!aScanVisible || !store) return null;

  return (
    <div className="flex flex-col w-2xs border-pink-500 border-solid border-2">
      <AScanInternal store={store} />
    </div>
  );
}

const AScanInternal = ({ store }: { store: DataStore }) => {
  const indexSelectedAscan = useStore(store, (s) => s.indexSelectedAscan);
  const displayBuffer = useStore(store, (s) => s.displayBuffer);
  const scale = useStore(store, (s) => s.scale);
  const shiftY = useStore(store, (s) => s.shiftY);
  const roRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

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
      className="relative flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden bg-background text-foreground"
    >
      <AScanChart
        displayBuffer={displayBuffer}
        column={indexSelectedAscan}
        width={size.width}
        height={size.height}
        scale={scale}
        shiftY={shiftY}
      />
    </div>
  );
};

const AScanChart = ({
  displayBuffer,
  column,
  width,
  height,
  scale,
  shiftY,
}: {
  displayBuffer: Grid2D;
  column: number | undefined;
  width: number;
  height: number;
  scale: number;
  shiftY: number;
}) => {
  const chart = useMemo(() => {
    if (
      width <= 0 ||
      height <= 0 ||
      column == null ||
      column < 0 ||
      column >= displayBuffer.cols ||
      displayBuffer.rows === 0
    ) {
      return null;
    }

    const values = displayBuffer.getColumn(column);

    const [min = 0, max = 0] = d3.extent(displayBuffer.buffer);
    const xScale = d3
      .scaleLinear()
      .domain(min === max ? [min - 1, max + 1] : [min, max])
      .range([MARGIN.left, width - MARGIN.right]);

    const aScan = d3
      .line<number>()
      .x((v) => xScale(v))
      .y((_, i) => shiftY + i * scale);

    const verticalLine = d3
      .line<number>()
      .x(() => xScale(0))
      .y((_, i) => shiftY + i * scale);

    return { d: aScan(values), xScale, verticalLineD: verticalLine(values) };
  }, [displayBuffer, column, width, height, scale, shiftY]);

  const axisRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!axisRef.current || !chart) return;
    const g = d3.select(axisRef.current);
    g.call(d3.axisTop(chart.xScale).ticks(4));
    g.selectAll('path, line').attr('stroke', 'currentColor');
    g.selectAll('text').attr('fill', 'currentColor');
  }, [chart]);

  const shift = useMemo(
    () => Math.max(0, Math.min(Math.max(TOP_AXIS, shiftY), height)) - 3,
    [shiftY, height],
  );

  if (width <= 0 || height <= 0) return null;

  return (
    <svg
      width={width}
      height={height}
      className="block"
      style={{ overflow: 'hidden' }}
    >
      <clipPath id="ascan-plot">
        <rect x={0} y={TOP_AXIS} width={width} height={height - TOP_AXIS} />
      </clipPath>
      {chart?.d && (
        <path
          d={chart.d}
          clipPath="url(#ascan-plot)"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      )}
      {chart?.verticalLineD && (
        <path
          d={chart.verticalLineD}
          clipPath="url(#ascan-plot)"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
        />
      )}

      {chart && <g ref={axisRef} transform={`translate(0, ${shift})`} />}
    </svg>
  );
};

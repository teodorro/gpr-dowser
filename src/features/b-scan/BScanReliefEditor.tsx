import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import useVisualStore from '@/stores/visual-store';
import { useCallback, useMemo, useState } from 'react';
import { useRef } from 'react';
import { useStore } from 'zustand';
import { selectScaleX, selectScaleY } from '@/stores/visual-slice';
import * as d3 from 'd3';

export default function BScanReliefEditor() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <BScanReliefEditorInternal store={store} />;
}

function BScanReliefEditorInternal({ store }: { store: DataStore }) {
  const roRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const scaleX = useStore(store, selectScaleX);
  const scaleY = useStore(store, selectScaleY);
  const shiftX = useStore(store, (s) => s.shiftX);
  const shiftY = useStore(store, (s) => s.shiftY);

  const bScan = useStore(store, (s) => s.bScan);
  const bScanLinesColor = useVisualStore.use.bScanLinesColor();
  const bScanLinesWidth = useVisualStore.use.bScanLinesWidth();

  const relief = useStore(store, (s) => s.relief);

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

  const tToWy = useMemo(
    () => d3.scaleLinear().domain([0, bScan.rows]).range([0, bScan.rows]),
    [bScan.rows],
  );

  const xToWx = useMemo(
    () => d3.scaleLinear().domain([0, bScan.cols]).range([0, bScan.cols]),
    [bScan.cols],
  );

  const distanceToX = useCallback(
    (distance: number) => xToWx(distance) * scaleX + shiftX,
    [scaleX, shiftX, xToWx],
  );

  const timeToY = useCallback(
    (time: number) => tToWy(time) * scaleY + shiftY,
    [scaleY, shiftY, tToWy],
  );

  const pathLineGenerator = useMemo(
    () =>
      d3
        .line<[number, number]>()
        .x((d) => distanceToX(d[0]))
        .y((d) => timeToY(d[1]))
        .curve(d3.curveMonotoneX),
    [distanceToX, timeToY],
  );

  const reliefPoints = useMemo(() => {
    const points: [number, number][] = relief.map(([x, y]) => [
      xToWx(x),
      tToWy(y),
    ]);
    return points;
  }, [relief, xToWx, tToWy]);

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
        <clipPath id="relief">
          <rect x={0} y={0} width={size.width} height={size.height} />
        </clipPath>
        <path
          d={pathLineGenerator(reliefPoints) ?? ''}
          clipPath="url(#relief)"
          fill="none"
          stroke={bScanLinesColor}
          strokeWidth={bScanLinesWidth}
        />
      </svg>
    </div>
  );
}

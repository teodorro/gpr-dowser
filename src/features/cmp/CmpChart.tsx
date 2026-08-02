import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { useCallback, useRef, useState } from 'react';

export default function CmpChart() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <CmpChartInternal store={store} />;
}

function CmpChartInternal({ store }: { store: DataStore }) {
  const roRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  console.log(store);

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
        <path
          d="M 0 0 L 300 300"
          clipPath="url(#cmp-chart)"
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

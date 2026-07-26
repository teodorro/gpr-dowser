import { useCallback, useRef, useState } from 'react';

export default function CmpChart() {
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

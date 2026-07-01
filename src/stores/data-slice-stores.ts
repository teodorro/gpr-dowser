import { create } from 'zustand';
import Grid2D from '@/shared/grid2d';
import type { VisualSlice } from './visual-slice';
import type { UnitSlice } from './unit-slice';
import type { DataSlice } from './data-slice';
import type { FileSlice } from './file-slice';

type DataSliceStore = { id: string } & FileSlice &
  DataSlice &
  UnitSlice &
  VisualSlice;

export const TIME_AXIS_WIDTH = 56;
export const LENGTH_AXIS_HEIGHT = 46;
export const DEPTH_AXIS_WIDTH = 66;
export const BOTTOM_BORDER_HEIGHT = 0;
export const PALLETTE_WIDTH = 30;

export const createDataSliceStore = (
  id: string,
  options: {
    [key: string]: unknown;
  },
) =>
  create<DataSliceStore>((set) => ({
    id,

    // FileSlice
    name: (options.name as string) ?? '',
    path: (options.path as string) ?? '',
    type: (options.type as string) ?? '',
    setName: (name) => set({ name }),
    setPath: (path) => set({ path }),
    setType: (type) => set({ type }),

    // DataSlice
    bScanInitial: (options.bScanInitial as Grid2D) ?? new Grid2D(0, 0),
    bScan: (options.bScan as Grid2D) ?? new Grid2D(0, 0),
    setBScanInitial: (bScanInitial) => set({ bScanInitial }),
    setBScan: (bScan) => set({ bScan }),

    // UnitSlice
    dt: (options.dt as number) ?? 1,
    dx: (options.dx as number) ?? 0.1,
    velocity: (options.velocity as number) ?? 0.1,
    permittivity: (options.permittivity as number) ?? 9,
    setDt: (dt) => set({ dt }),
    setDx: (dx) => set({ dx }),
    setVelocity: (velocity) => set({ velocity }),
    setPermittivity: (permittivity) => set({ permittivity }),

    // VisualSlice
    displayBuffer: (options.displayBuffer as Grid2D) ?? new Grid2D(0, 0),
    scale: (options.scale as number) ?? 1,
    shiftX: (options.shiftX as number) ?? TIME_AXIS_WIDTH,
    shiftY: (options.shiftY as number) ?? LENGTH_AXIS_HEIGHT,
    indexX: (options.indexX as number | undefined) ?? undefined,
    indexY: (options.indexY as number | undefined) ?? undefined,
    indexTimeZero: (options.indexTimeZero as number) ?? 0,
    averageAscan: (options.averageAscan as number[]) ?? [],
    indexSelectedAscan: (options.indexSelectedAscan as number) ?? 0,
    setDisplayBuffer: (displayBuffer) => set({ displayBuffer }),
    setScale: (scale) => set({ scale }),
    setShift: (shiftX, shiftY) => set({ shiftX, shiftY }),
    setIndexX: (indexX) => set({ indexX }),
    setIndexY: (indexY) => set({ indexY }),
    setIndexTimeZero: (indexTimeZero) => set({ indexTimeZero }),
    setAverageAscan: (averageAscan) => set({ averageAscan }),
    setIndexSelectedAscan: (indexSelectedAscan) => set({ indexSelectedAscan }),
  }));

// Registry of stores
export const dataSliceStores = new Map<
  string,
  ReturnType<typeof createDataSliceStore>
>();

export type DataStore = ReturnType<typeof createDataSliceStore>;

import { create } from 'zustand';
import Grid2D from '@/shared/grid2d';
import type { VisualSlice } from './visual-slice';
import type { UnitSlice } from './unit-slice';
import type { DataSlice } from './data-slice';
import type { FileSlice } from './file-slice';
import type { UndoRedoSlice } from './undo-redo-slice';
import type { Operation } from './undo-redo.types';
import type { CmpSlice } from './cmp-slice';

type DataSliceStore = { id: string } & FileSlice &
  DataSlice &
  UnitSlice &
  VisualSlice &
  UndoRedoSlice &
  CmpSlice;

export const TIME_AXIS_WIDTH = 56;
export const LENGTH_AXIS_HEIGHT = 46;
export const DEPTH_AXIS_WIDTH = 66;
export const BOTTOM_BORDER_HEIGHT = 0;
export const PALLETTE_WIDTH = 30;

export type CmpLayer = {
  id: string;
  velocity: number;
  time: number;
};

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

    // UndoRedoSlice
    history: (options.history as Map<number, Operation>) ?? new Map(),
    position: (options.position as number) ?? 0,
    undo: () =>
      set((state) => ({
        position: Math.max(0, state.position - 1),
      })),
    redo: () =>
      set((state) => ({
        position: Math.min(state.history.size, state.position + 1),
      })),
    addOperation: (operation: Operation) =>
      set((state) => {
        const history = new Map(
          [...state.history].filter(([key]) => key <= state.position),
        );
        history.set(state.position + 1, operation);
        return {
          history,
          position: state.position + 1,
        };
      }),

    // CmpSlice
    cmpData: (options.cmpData as Grid2D) ?? new Grid2D(0, 0),
    cmpDisplayBuffer: (options.cmpDisplayBuffer as Grid2D) ?? new Grid2D(0, 0),
    cmpScale: (options.cmpScale as number) ?? 1,
    cmpShiftX: (options.cmpShiftX as number) ?? TIME_AXIS_WIDTH,
    cmpShiftY: (options.cmpShiftY as number) ?? LENGTH_AXIS_HEIGHT,
    cmpIndexX: (options.cmpIndexX as number | undefined) ?? undefined,
    cmpIndexY: (options.cmpIndexY as number | undefined) ?? undefined,
    cmpLayers: (options.cmpLayers as CmpLayer[]) ?? [],
    setCmpData: (cmpData) => set({ cmpData }),
    setCmpDisplayBuffer: (cmpDisplayBuffer) => set({ cmpDisplayBuffer }),
    setCmpScale: (cmpScale) => set({ cmpScale }),
    setCmpShift: (cmpShiftX, cmpShiftY) => set({ cmpShiftX, cmpShiftY }),
    setCmpIndexX: (cmpIndexX) => set({ cmpIndexX }),
    setCmpIndexY: (cmpIndexY) => set({ cmpIndexY }),
    setCmpLayers: (cmpLayers) => set({ cmpLayers }),
    addCmpLayer: (time, velocity) =>
      set((state) => {
        const id = crypto.randomUUID();
        return {
          cmpLayers: [...state.cmpLayers, { id, time, velocity }],
        };
      }),
    removeCmpLayer: (id) =>
      set((state) => ({
        cmpLayers: state.cmpLayers.filter((layer) => layer.id !== id),
      })),
  }));

// Registry of stores
export const dataSliceStores = new Map<
  string,
  ReturnType<typeof createDataSliceStore>
>();

export type DataStore = ReturnType<typeof createDataSliceStore>;

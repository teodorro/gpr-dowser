import { create } from 'zustand';
import Grid2D from '@/shared/grid2d';
import type { VisualSlice } from './visual-slice';
import type { UnitSlice } from './unit-slice';
import type { DataSlice } from './data-slice';
import type { FileSlice } from './file-slice';
import type { UndoRedoSlice } from './undo-redo-slice';
import { OperationTypeList, type Operation } from './undo-redo.types';
import type { CmpSlice } from './cmp-slice';
import CmpLayersContainer from './cmp-layers-container';
import type { HyperbolaSlice } from './hyperbola-slice';
import { mirrorRelief, splitRelief, type ReliefSlice } from './relief-slice';

type DataSliceStore = { id: string } & FileSlice &
  DataSlice &
  UnitSlice &
  VisualSlice &
  UndoRedoSlice &
  CmpSlice &
  HyperbolaSlice &
  ReliefSlice;

// Initial values for a new store: any state field (actions are excluded).
type DataSliceStoreState = {
  [K in keyof DataSliceStore as DataSliceStore[K] extends (
    ...args: never[]
  ) => unknown
    ? never
    : K]: DataSliceStore[K];
};
export type DataSliceStoreOptions = Partial<Omit<DataSliceStoreState, 'id'>>;

export const TIME_AXIS_WIDTH = 56;
export const LENGTH_AXIS_HEIGHT = 46;
export const DEPTH_AXIS_WIDTH = 66;
export const BOTTOM_BORDER_HEIGHT = 0;
export const PALLETTE_WIDTH = 20;

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 40;

export const SEMBLANCE_MIN_WIDTH = 150;
export const SEMBLANCE_MAX_WIDTH = 500;

export type CmpLayer = {
  id: string;
  time: number;
  rmsVelocity: number;
  velocity: number;
  totalThickness: number;
  thickness: number;
  permittivity: number;
};

export const createDataSliceStore = (
  id: string,
  options: DataSliceStoreOptions = {},
) =>
  create<DataSliceStore>((set) => ({
    id,

    // FileSlice
    name: options.name ?? '',
    path: options.path ?? '',
    type: options.type ?? '',
    setName: (name) => set({ name }),
    setPath: (path) => set({ path }),
    setType: (type) => set({ type }),

    // DataSlice
    bScanInitial: options.bScanInitial ?? new Grid2D(0, 0),
    bScan: options.bScan ?? new Grid2D(0, 0),
    setBScanInitial: (bScanInitial) => set({ bScanInitial }),
    setBScan: (bScan) => set({ bScan }),

    // UnitSlice
    dt: options.dt ?? 1,
    dx: options.dx ?? 0.1,
    velocity: options.velocity ?? 0.1,
    permittivity: options.permittivity ?? 9,
    setDt: (dt) => set({ dt }),
    setDx: (dx) => set({ dx }),
    setVelocity: (velocity) => set({ velocity }),
    setPermittivity: (permittivity) => set({ permittivity }),

    // VisualSlice
    displayBuffer: options.displayBuffer ?? new Grid2D(0, 0),
    scale: options.scale ?? 1,
    shiftX: options.shiftX ?? TIME_AXIS_WIDTH,
    shiftY: options.shiftY ?? LENGTH_AXIS_HEIGHT,
    indexX: options.indexX ?? undefined,
    indexY: options.indexY ?? undefined,
    indexTimeZero: options.indexTimeZero ?? 0,
    averageAscan: options.averageAscan ?? [],
    indexSelectedAscan: options.indexSelectedAscan ?? 0,
    pointAspectRatioWidth: options.pointAspectRatioWidth ?? 1,
    pointAspectRatioHeight: options.pointAspectRatioHeight ?? 1,
    setDisplayBuffer: (displayBuffer) => set({ displayBuffer }),
    setScale: (scale) => set({ scale }),
    setShift: (shiftX, shiftY) => set({ shiftX, shiftY }),
    setIndexX: (indexX) => set({ indexX }),
    setIndexY: (indexY) => set({ indexY }),
    setIndexTimeZero: (indexTimeZero) => set({ indexTimeZero }),
    setAverageAscan: (averageAscan) => set({ averageAscan }),
    setIndexSelectedAscan: (indexSelectedAscan) => set({ indexSelectedAscan }),
    setPointAspectRatioWidth: (pointAspectRatioWidth) =>
      set({ pointAspectRatioWidth }),
    setPointAspectRatioHeight: (pointAspectRatioHeight) =>
      set({ pointAspectRatioHeight }),

    // UndoRedoSlice
    history: options.history ?? new Map(),
    position: options.position ?? 0,
    undo: () =>
      set((state) => ({
        position: Math.max(0, state.position - 1),
        ...getReliefAfterUndo(state.history.get(state.position), state),
      })),
    redo: () =>
      set((state) => ({
        position: Math.min(state.history.size, state.position + 1),
        ...getReliefAfterRedo(state.history.get(state.position + 1), state),
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
    replaceOperation: (operation: Operation) =>
      set((state) => {
        const history = new Map(
          [...state.history].filter(([key]) => key < state.position),
        );
        history.set(state.position, operation);
        return { history };
      }),

    // CmpSlice
    cmpData: options.cmpData ?? new Grid2D(0, 0),
    cmpDisplayBuffer: options.cmpDisplayBuffer ?? new Grid2D(0, 0),
    cmpScale: options.cmpScale ?? 1,
    cmpShiftX: options.cmpShiftX ?? TIME_AXIS_WIDTH,
    cmpShiftY: options.cmpShiftY ?? LENGTH_AXIS_HEIGHT,
    cmpIndexX: options.cmpIndexX ?? undefined,
    cmpIndexY: options.cmpIndexY ?? undefined,
    cmpLayers: options.cmpLayers ?? new CmpLayersContainer(),
    cmpHalfwave: options.cmpHalfwave ?? 1,
    lozaMode: options.lozaMode ?? true,
    backshift: options.backshift ?? true,
    setCmpData: (cmpData) => set({ cmpData }),
    setCmpDisplayBuffer: (cmpDisplayBuffer) => set({ cmpDisplayBuffer }),
    setCmpHalfwave: (cmpHalfwave) => set({ cmpHalfwave }),
    setCmpScale: (cmpScale) => set({ cmpScale }),
    setCmpShift: (cmpShiftX, cmpShiftY) => set({ cmpShiftX, cmpShiftY }),
    setCmpIndexX: (cmpIndexX) => set({ cmpIndexX }),
    setCmpIndexY: (cmpIndexY) => set({ cmpIndexY }),
    setCmpLayersContainer: (cmpLayers) => set({ cmpLayers }),
    addCmpLayer: (time, rmsVelocity) =>
      set((state) => {
        const cmpLayers = state.cmpLayers.clone();
        cmpLayers.addLayer(time, rmsVelocity);
        return { cmpLayers };
      }),
    removeCmpLayer: (id) =>
      set((state) => {
        const cmpLayers = state.cmpLayers.clone();
        cmpLayers.removeLayer(id);
        return { cmpLayers };
      }),
    updateCmpLayer: (id, time, rmsVelocity) =>
      set((state) => {
        const cmpLayers = state.cmpLayers.clone();
        cmpLayers.updateLayer(id, time, rmsVelocity);
        return { cmpLayers };
      }),
    setLozaMode: (lozaMode) => set({ lozaMode }),
    setBackshift: (backshift) => set({ backshift }),

    // HyperbolaSlice
    hyperbolaApex: options.hyperbolaApex ?? [0, 0],
    setHyperbolaApex: (hyperbolaApex: [number, number]) =>
      set({ hyperbolaApex }),

    // ReliefSlice
    relief: options.relief ?? [],
    selectedReliefPoint: options.selectedReliefPoint ?? undefined,
    setRelief: (relief: [number, number][]) => set({ relief }),
    setSelectedReliefPoint: (
      selectedReliefPoint: [number, number] | undefined,
    ) => set({ selectedReliefPoint }),
  }));

const getReliefAfterUndo = (
  operation: Operation | undefined,
  state: DataSliceStore,
): Partial<DataSliceStore> => {
  switch (operation?.type) {
    case OperationTypeList.ApplyRelief:
      return {
        relief: operation.previousPoints,
        selectedReliefPoint: undefined,
      };
    case OperationTypeList.TurnAroundBscan:
      return {
        relief: mirrorRelief(state.relief, state.bScan.cols),
        selectedReliefPoint: undefined,
      };
    case OperationTypeList.SplitBscan:
      return { relief: operation.relief, selectedReliefPoint: undefined };
    default:
      return {};
  }
};

const getReliefAfterRedo = (
  operation: Operation | undefined,
  state: DataSliceStore,
): Partial<DataSliceStore> => {
  switch (operation?.type) {
    case OperationTypeList.ApplyRelief:
      return { relief: operation.points, selectedReliefPoint: undefined };
    case OperationTypeList.TurnAroundBscan:
      return {
        relief: mirrorRelief(state.relief, state.bScan.cols),
        selectedReliefPoint: undefined,
      };
    case OperationTypeList.SplitBscan:
      return {
        relief: splitRelief(operation.relief, operation.splitIndex)[0],
        selectedReliefPoint: undefined,
      };
    default:
      return {};
  }
};

// Registry of stores
export const dataSliceStores = new Map<
  string,
  ReturnType<typeof createDataSliceStore>
>();

export type DataStore = ReturnType<typeof createDataSliceStore>;

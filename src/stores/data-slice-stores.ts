import { create } from "zustand";
import Grid2D from "@/shared/grid2d";
import type { VisualSlice } from "./visual-slice";
import type { UnitSlice } from "./unit-slice";
import type { DataSlice } from "./data-slice";
import type { FileSlice } from "./file-slice";

type DataSliceStore = { id: string } & FileSlice &
  DataSlice &
  UnitSlice &
  VisualSlice;

export const createDataSliceStore = (
  id: string,
  options: {
    [key: string]: unknown;
  },
) =>
  create<DataSliceStore>((set) => ({
    id,

    // FileSlice
    name: (options.name as string) ?? "",
    path: (options.path as string) ?? "",
    type: (options.type as string) ?? "",
    setName: (name) => set({ name }),
    setPath: (path) => set({ path }),
    setType: (type) => set({ type }),

    // DataSlice
    bScanInitial: (options.bScanInitial as Grid2D) ?? new Grid2D(0, 0),
    bScan: (options.bScan as Grid2D) ?? new Grid2D(0, 0),
    setBScanInitial: (bScanInitial) => set({ bScanInitial }),
    setBScan: (bScan) => set({ bScan }),

    // UnitSlice
    dt: (options.dt as number) ?? 0,
    dx: (options.dx as number) ?? 0,
    velocity: (options.velocity as number) ?? 0.1,
    permittivity: (options.permittivity as number) ?? 9,
    setDt: (dt) => set({ dt }),
    setDx: (dx) => set({ dx }),
    setVelocity: (velocity) => set({ velocity }),
    setPermittivity: (permittivity) => set({ permittivity }),

    // VisualSlice
    displayBuffer: (options.displayBuffer as Grid2D) ?? new Grid2D(0, 0),
    selectedPalette: (options.selectedPalette as string) ?? "greys",
    scale: (options.scale as number) ?? 1,
    tx: (options.tx as number) ?? 0,
    ty: (options.ty as number) ?? 0,
    setDisplayBuffer: (displayBuffer) => set({ displayBuffer }),
    setSelectedPalette: (selectedPalette) => set({ selectedPalette }),
    setScale: (scale) => set({ scale }),
    setPosition: (tx, ty) => set({ tx, ty }),
  }));

// Registry of stores
export const dataSliceStores = new Map<
  string,
  ReturnType<typeof createDataSliceStore>
>();

export type DataStore = ReturnType<typeof createDataSliceStore>;

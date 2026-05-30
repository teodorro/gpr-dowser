import type Grid2D from "@/shared/grid2d";

type DataState = {
  bScanInitial: Grid2D;
  bScan: Grid2D;
};

type DataActions = {
  setBScanInitial: (bScanInitial: Grid2D) => void;
  setBScan: (bScan: Grid2D) => void;
};

export type DataSlice = DataState & DataActions;

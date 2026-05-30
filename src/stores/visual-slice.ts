import type Grid2D from "@/shared/grid2d";

type VisualState = {
  displayBuffer: Grid2D;
};

type VisualActions = {
  setDisplayBuffer: (displayBuffer: Grid2D) => void;
};

export type VisualSlice = VisualState & VisualActions;

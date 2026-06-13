import type Grid2D from "@/shared/grid2d";

type VisualState = {
  displayBuffer: Grid2D;
  selectedPalette: string;
  scale: number;
  shiftX: number;
  shiftY: number;
};

type VisualActions = {
  setDisplayBuffer: (displayBuffer: Grid2D) => void;
  setSelectedPalette: (selectedPalette: string) => void;
  setScale: (scale: number) => void;
  setShift: (shiftX: number, shiftY: number) => void;
};

export type VisualSlice = VisualState & VisualActions;

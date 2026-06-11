import type Grid2D from "@/shared/grid2d";

type VisualState = {
  displayBuffer: Grid2D;
  selectedPalette: string;
  scale: number;
  tx: number;
  ty: number;
};

type VisualActions = {
  setDisplayBuffer: (displayBuffer: Grid2D) => void;
  setSelectedPalette: (selectedPalette: string) => void;
  setScale: (scale: number) => void;
  setPosition: (tx: number, ty: number) => void;
};

export type VisualSlice = VisualState & VisualActions;

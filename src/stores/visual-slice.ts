import type Grid2D from '@/shared/grid2d';

type VisualState = {
  displayBuffer: Grid2D;
  scale: number;
  shiftX: number;
  shiftY: number;
};

type VisualActions = {
  setDisplayBuffer: (displayBuffer: Grid2D) => void;
  setScale: (scale: number) => void;
  setShift: (shiftX: number, shiftY: number) => void;
};

export type VisualSlice = VisualState & VisualActions;

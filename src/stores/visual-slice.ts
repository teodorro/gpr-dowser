import type Grid2D from '@/shared/grid2d';

type VisualState = {
  displayBuffer: Grid2D;
  scale: number;
  shiftX: number;
  shiftY: number;
  indexX: number | undefined;
  indexY: number | undefined;
  indexTimeZero: number;
};

type VisualActions = {
  setDisplayBuffer: (displayBuffer: Grid2D) => void;
  setScale: (scale: number) => void;
  setShift: (shiftX: number, shiftY: number) => void;
  setIndexX: (indexX: number | undefined) => void;
  setIndexY: (indexY: number | undefined) => void;
  setIndexTimeZero: (indexTimeZero: number) => void;
};

export type VisualSlice = VisualState & VisualActions;

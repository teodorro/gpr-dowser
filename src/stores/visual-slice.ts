import type Grid2D from '@/shared/grid2d';

type VisualState = {
  displayBuffer: Grid2D;
  scale: number;
  shiftX: number;
  shiftY: number;
  indexX: number | undefined;
  indexY: number | undefined;
  indexTimeZero: number;
  averageAscan: number[];
  indexSelectedAscan: number | undefined;
};

type VisualActions = {
  setDisplayBuffer: (displayBuffer: Grid2D) => void;
  setScale: (scale: number) => void;
  setShift: (shiftX: number, shiftY: number) => void;
  setIndexX: (indexX: number | undefined) => void;
  setIndexY: (indexY: number | undefined) => void;
  setIndexTimeZero: (indexTimeZero: number) => void;
  setAverageAscan: (averageAscan: number[]) => void;
  setIndexSelectedAscan: (indexSelectedAscan: number | undefined) => void;
};

export type VisualSlice = VisualState & VisualActions;

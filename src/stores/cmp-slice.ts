import type Grid2D from '@/shared/grid2d';
import type { CmpLayer } from './data-slice-stores';

type CmpState = {
  cmpData: Grid2D;
  cmpDisplayBuffer: Grid2D;
  cmpScale: number;
  cmpShiftX: number;
  cmpShiftY: number;
  cmpIndexX: number | undefined;
  cmpIndexY: number | undefined;
  cmpLayers: CmpLayer[];
};

type CmpActions = {
  setCmpData: (cmpData: Grid2D) => void;
  setCmpDisplayBuffer: (cmpDisplayBuffer: Grid2D) => void;
  setCmpScale: (cmpScale: number) => void;
  setCmpShift: (cmpShiftX: number, cmpShiftY: number) => void;
  setCmpIndexX: (cmpIndexX: number | undefined) => void;
  setCmpIndexY: (cmpIndexY: number | undefined) => void;
  setCmpLayers: (layers: CmpLayer[]) => void;
  addCmpLayer: (time: number, velocity: number) => void;
  removeCmpLayer: (id: string) => void;
};

export type CmpSlice = CmpState & CmpActions;

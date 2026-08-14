import type Grid2D from '@/shared/grid2d';
import type CmpLayersContainer from './cmp-layers-container';

type CmpState = {
  cmpData: Grid2D;
  cmpDisplayBuffer: Grid2D;
  cmpScale: number;
  cmpShiftX: number;
  cmpShiftY: number;
  cmpIndexX: number | undefined;
  cmpIndexY: number | undefined;
  cmpLayers: CmpLayersContainer;
  cmpGate: number;
};

type CmpActions = {
  setCmpData: (cmpData: Grid2D) => void;
  setCmpDisplayBuffer: (cmpDisplayBuffer: Grid2D) => void;
  setCmpScale: (cmpScale: number) => void;
  setCmpShift: (cmpShiftX: number, cmpShiftY: number) => void;
  setCmpIndexX: (cmpIndexX: number | undefined) => void;
  setCmpIndexY: (cmpIndexY: number | undefined) => void;
  setCmpLayersContainer: (layers: CmpLayersContainer) => void;
  addCmpLayer: (time: number, rmsVelocity: number) => void;
  removeCmpLayer: (id: string) => void;
  updateCmpLayer: (id: string, time: number, rmsVelocity: number) => void;
  setCmpGate: (cmpGate: number) => void;
};

export type CmpSlice = CmpState & CmpActions;

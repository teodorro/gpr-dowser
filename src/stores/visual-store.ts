import { createSelectors } from '@/shared/create-selectors';
import { create } from 'zustand';

export const DEFAULT_DELTA_TO_UPDATE_LAYER = 10;

type VisualState = {
  selectedPalette: string;
  cmpSemblanceLinesColor: string;
  cmpSemblanceLinesWidth: number;
  bScanLinesColor: string;
  bScanLinesWidth: number;
  deltaToUpdateLayer: number;
  bScanTransparency: number;
  cmpTransparency: number;
  showDepthAxis: boolean;
};

type VisualActions = {
  setSelectedPalette: (selectedPalette: string) => void;
  setCmpSemblanceLinesColor: (color: string) => void;
  setCmpSemblanceLinesWidth: (width: number) => void;
  setBScanLinesColor: (color: string) => void;
  setBScanLinesWidth: (width: number) => void;
  setDeltaToUpdateLayer: (delta: number) => void;
  setBScanTransparency: (transparency: number) => void;
  setCmpTransparency: (transparency: number) => void;
  setShowDepthAxis: (showDepthAxis: boolean) => void;
};

type VisualStore = VisualState & VisualActions;

const INITIAL_STATE: VisualState = {
  selectedPalette: 'greys',
  cmpSemblanceLinesColor: '#000',
  cmpSemblanceLinesWidth: 2,
  bScanLinesColor: '#ffff00',
  bScanLinesWidth: 2,
  deltaToUpdateLayer: DEFAULT_DELTA_TO_UPDATE_LAYER,
  bScanTransparency: 0.0,
  cmpTransparency: 0.33,
  showDepthAxis: true,
};

const useVisualBase = create<VisualStore>((set) => ({
  ...INITIAL_STATE,
  setSelectedPalette: (selectedPalette) => set({ selectedPalette }),
  setCmpSemblanceLinesColor: (color) => set({ cmpSemblanceLinesColor: color }),
  setBScanLinesColor: (color) => set({ bScanLinesColor: color }),
  setBScanLinesWidth: (width) => set({ bScanLinesWidth: width }),
  setCmpSemblanceLinesWidth: (width) => set({ cmpSemblanceLinesWidth: width }),
  setDeltaToUpdateLayer: (delta) => set({ deltaToUpdateLayer: delta }),
  setBScanTransparency: (transparency: number) =>
    set({ bScanTransparency: transparency }),
  setCmpTransparency: (transparency: number) =>
    set({ cmpTransparency: transparency }),
  setShowDepthAxis: (showDepthAxis: boolean) =>
    set({ showDepthAxis: showDepthAxis }),
}));

const useVisualStore = createSelectors(useVisualBase);

export default useVisualStore;

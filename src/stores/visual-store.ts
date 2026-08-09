import { createSelectors } from '@/shared/create-selectors';
import { create } from 'zustand';

export const DEFAULT_DELTA_TO_UPDATE_LAYER = 10;

type VisualState = {
  selectedPalette: string;
  cmpSemblanceLinesColor: string;
  cmpBScanLinesColor: string;
  deltaToUpdateLayer: number;
};

type VisualActions = {
  setSelectedPalette: (selectedPalette: string) => void;
  setCmpSemblanceLinesColor: (color: string) => void;
  setCmpBScanLinesColor: (color: string) => void;
  setDeltaToUpdateLayer: (delta: number) => void;
};

type VisualStore = VisualState & VisualActions;

const INITIAL_STATE: VisualState = {
  selectedPalette: 'greys',
  cmpSemblanceLinesColor: '#888888',
  cmpBScanLinesColor: '#ffff00',
  deltaToUpdateLayer: DEFAULT_DELTA_TO_UPDATE_LAYER,
};

const useVisualBase = create<VisualStore>((set) => ({
  ...INITIAL_STATE,
  setSelectedPalette: (selectedPalette) => set({ selectedPalette }),
  setCmpSemblanceLinesColor: (color) => set({ cmpSemblanceLinesColor: color }),
  setCmpBScanLinesColor: (color) => set({ cmpBScanLinesColor: color }),
  setDeltaToUpdateLayer: (delta) => set({ deltaToUpdateLayer: delta }),
}));

const useVisualStore = createSelectors(useVisualBase);

export default useVisualStore;

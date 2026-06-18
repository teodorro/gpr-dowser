import { createSelectors } from '@/shared/create-selectors';
import { create } from 'zustand';

type VisualState = {
  selectedPalette: string;
};

type VisualActions = {
  setSelectedPalette: (selectedPalette: string) => void;
};

type VisualStore = VisualState & VisualActions;

const INITIAL_STATE: VisualState = {
  selectedPalette: 'greys',
};

const useVisualBase = create<VisualStore>((set) => ({
  ...INITIAL_STATE,
  setSelectedPalette: (selectedPalette) => set({ selectedPalette }),
}));

const useVisualStore = createSelectors(useVisualBase);

export default useVisualStore;

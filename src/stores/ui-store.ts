import { create } from 'zustand';
import { createSelectors } from '@/shared/create-selectors';

type UiState = {
  sideBarVisible: boolean;
  aScanVisible: boolean;
  splitBscanMode: boolean;
};

type UiActions = {
  setSideBarVisible: (visible: boolean) => void;
  setAScanVisible: (visible: boolean) => void;
  setSplitBscanMode: (mode: boolean) => void;
};

type Ui = UiState & UiActions;

const INITIAL_STATE: UiState = {
  sideBarVisible: true,
  aScanVisible: true,
  splitBscanMode: false,
};

const useUiBase = create<Ui>((set) => ({
  ...INITIAL_STATE,

  setSideBarVisible: (visible) => {
    set((s) => ({ ...s, sideBarVisible: visible }));
  },
  setAScanVisible: (visible) => {
    set((s) => ({ ...s, aScanVisible: visible }));
  },
  setSplitBscanMode: (mode) => {
    set((s) => ({ ...s, splitBscanMode: mode }));
  },
}));

export const useUiStore = createSelectors(useUiBase);

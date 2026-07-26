import { create } from 'zustand';
import { createSelectors } from '@/shared/create-selectors';

type UiState = {
  sideBarVisible: boolean;
  aScanVisible: boolean;
  splitBscanMode: boolean;
  cmpMode: boolean;
};

type UiActions = {
  setSideBarVisible: (visible: boolean) => void;
  setAScanVisible: (visible: boolean) => void;
  setSplitBscanMode: (mode: boolean) => void;
  setCmpMode: (mode: boolean) => void;
};

type Ui = UiState & UiActions;

const INITIAL_STATE: UiState = {
  sideBarVisible: true,
  aScanVisible: true,
  splitBscanMode: false,
  cmpMode: false,
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
  setCmpMode: (mode) => {
    set((s) => ({ ...s, cmpMode: mode }));
  },
}));

export const useUiStore = createSelectors(useUiBase);

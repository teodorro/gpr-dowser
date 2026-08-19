import { create } from 'zustand';
import { createSelectors } from '@/shared/create-selectors';
import { unreachable } from '@/shared/unreachable';

type UiState = {
  sideBarVisible: boolean;
  aScanVisible: boolean;
  splitBScanMode: boolean;
  cmpMode: boolean;
  hyperbolaMode: boolean;
  cmpTableVisible: boolean;
  progress: number[];
  showProgressBar: boolean;
};

export const BScanMode = {
  split: 'split',
  cmp: 'cmp',
  hyperbola: 'hyperbola',
  none: 'none',
} as const;

export type BScanMode = (typeof BScanMode)[keyof typeof BScanMode];

type UiActions = {
  setSideBarVisible: (visible: boolean) => void;
  setAScanVisible: (visible: boolean) => void;
  setBScanMode: (mode: BScanMode) => void;
  setCmpTableVisible: (visible: boolean) => void;
  addProgress: (progress: number) => void;
  clearProgress: () => void;
  setShowProgressBar: (show: boolean) => void;
};

type Ui = UiState & UiActions;

const INITIAL_STATE: UiState = {
  sideBarVisible: true,
  aScanVisible: true,
  splitBScanMode: false,
  cmpMode: false,
  hyperbolaMode: false,
  cmpTableVisible: true,
  progress: [],
  showProgressBar: false,
};

const useUiBase = create<Ui>((set) => ({
  ...INITIAL_STATE,

  setSideBarVisible: (visible: boolean) => {
    set((s) => ({ ...s, sideBarVisible: visible }));
  },
  setAScanVisible: (visible: boolean) => {
    set((s) => ({ ...s, aScanVisible: visible }));
  },
  setBScanMode: (mode: BScanMode) => {
    switch (mode) {
      case BScanMode.none:
        set((s) => ({
          ...s,
          splitBScanMode: false,
          cmpMode: false,
          hyperbolaMode: false,
        }));
        break;
      case BScanMode.split:
        set((s) => ({
          ...s,
          splitBScanMode: true,
          cmpMode: false,
          hyperbolaMode: false,
        }));
        break;
      case BScanMode.cmp:
        set((s) => ({
          ...s,
          cmpMode: true,
          splitBScanMode: false,
          hyperbolaMode: false,
        }));
        break;
      case BScanMode.hyperbola:
        set((s) => ({
          ...s,
          hyperbolaMode: true,
          splitBScanMode: false,
          cmpMode: false,
        }));
        break;
      default:
        unreachable(mode);
    }
  },
  setCmpTableVisible: (visible: boolean) => {
    set((s) => ({ ...s, cmpTableVisible: visible }));
  },
  addProgress: (progress: number) => {
    set((s) => ({ ...s, progress: [...s.progress, progress] }));
  },
  clearProgress: () => {
    set((s) => ({ ...s, progress: [] }));
  },
  setShowProgressBar: (show: boolean) => {
    set((s) => ({ ...s, showProgressBar: show }));
  },
}));

const useUiStore = createSelectors(useUiBase);

export default useUiStore;

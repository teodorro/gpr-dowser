import { create } from 'zustand';
import { createSelectors } from '@/shared/create-selectors';
import { unreachable } from '@/shared/unreachable';

type UiState = {
  sideBarVisible: boolean;
  aScanVisible: boolean;
  splitBScanMode: boolean;
  cmpMode: boolean;
  hyperbolaMode: boolean;
  selectMode: boolean;
  cmpTableVisible: boolean;
  progress: number[];
  inProgress: boolean;
};

export const BScanMode = {
  select: 'select',
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
  setSelectMode: (mode: boolean) => void;
  setCmpTableVisible: (visible: boolean) => void;
  addProgress: (progress: number) => void;
  clearProgress: () => void;
  setInProgress: (show: boolean) => void;
};

type Ui = UiState & UiActions;

const INITIAL_STATE: UiState = {
  sideBarVisible: true,
  aScanVisible: true,
  splitBScanMode: false,
  cmpMode: false,
  hyperbolaMode: false,
  selectMode: false,
  cmpTableVisible: true,
  progress: [],
  inProgress: false,
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
          selectMode: false,
        }));
        break;
      case BScanMode.split:
        set((s) => ({
          ...s,
          splitBScanMode: true,
          cmpMode: false,
          hyperbolaMode: false,
          selectMode: false,
        }));
        break;
      case BScanMode.cmp:
        set((s) => ({
          ...s,
          cmpMode: true,
          splitBScanMode: false,
          hyperbolaMode: false,
          selectMode: false,
        }));
        break;
      case BScanMode.hyperbola:
        set((s) => ({
          ...s,
          hyperbolaMode: true,
          splitBScanMode: false,
          cmpMode: false,
          selectMode: false,
        }));
        break;
      case BScanMode.select:
        set((s) => ({
          ...s,
          selectMode: true,
          splitBScanMode: false,
          cmpMode: false,
          hyperbolaMode: false,
        }));
        break;
      default:
        unreachable(mode);
    }
  },
  setSelectMode: (mode: boolean) => {
    set((s) => ({ ...s, selectMode: mode }));
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
  setInProgress: (show: boolean) => {
    set((s) => ({ ...s, inProgress: show }));
  },
}));

const useUiStore = createSelectors(useUiBase);

export default useUiStore;

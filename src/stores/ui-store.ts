import { create } from 'zustand';
import { createSelectors } from '@/shared/create-selectors';
import { unreachable } from '@/shared/unreachable';

type UiState = {
  sideBarVisible: boolean;
  aScanVisible: boolean;
  splitBScanMode: boolean;
  cmpMode: boolean;
  hyperbolaMode: boolean;
  cmpSemblanceLinesColor: string;
  cmpBScanLinesColor: string;
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
  setCmpSemblanceLinesColor: (color: string) => void;
  setCmpBScanLinesColor: (color: string) => void;
};

type Ui = UiState & UiActions;

const INITIAL_STATE: UiState = {
  sideBarVisible: true,
  aScanVisible: true,
  splitBScanMode: false,
  cmpMode: false,
  hyperbolaMode: false,
  cmpSemblanceLinesColor: '#000000',
  cmpBScanLinesColor: '#ffff00',
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
  setCmpSemblanceLinesColor: (color: string) => {
    set((s) => ({ ...s, cmpSemblanceLinesColor: color }));
  },
  setCmpBScanLinesColor: (color: string) => {
    set((s) => ({ ...s, cmpBScanLinesColor: color }));
  },
}));

export const useUiStore = createSelectors(useUiBase);

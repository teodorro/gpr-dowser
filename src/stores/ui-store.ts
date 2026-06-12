import { create } from "zustand";
import { createSelectors } from "@/shared/create-selectors";

type UiState = {
  sideBarVisible: boolean;
  aScanVisible: boolean;
};

type UiActions = {
  setSideBarVisible: (visible: boolean) => void;
  setAScanVisible: (visible: boolean) => void;
};

type Ui = UiState & UiActions;

const INITIAL_STATE: UiState = {
  sideBarVisible: true,
  aScanVisible: true,
};

const useUiBase = create<Ui>((set) => ({
  ...INITIAL_STATE,

  setSideBarVisible: (visible) => {
    set((s) => ({ ...s, sideBarVisible: visible }));
  },
  setAScanVisible: (visible) => {
    set((s) => ({ ...s, aScanVisible: visible }));
  },
}));

export const useUiStore = createSelectors(useUiBase);

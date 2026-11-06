export const RELIEF_POINT_GAP = 5;

type ReliefState = {
  relief: [number, number][];
  selectedReliefPoint: [number, number] | undefined;
};

type ReliefActions = {
  setRelief: (relief: [number, number][]) => void;
  setSelectedReliefPoint: (
    selectedReliefPoint: [number, number] | undefined,
  ) => void;
};

export type ReliefSlice = ReliefState & ReliefActions;

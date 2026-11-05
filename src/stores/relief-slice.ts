type ReliefState = {
  relief: [number, number][];
};

type ReliefActions = {
  setRelief: (relief: [number, number][]) => void;
};

export type ReliefSlice = ReliefState & ReliefActions;

type HyperbolaState = {
  hyperbolaApex: [number, number];
};

type HyperbolaActions = {
  setHyperbolaApex: (hyperbolaApex: [number, number]) => void;
};

export type HyperbolaSlice = HyperbolaState & HyperbolaActions;

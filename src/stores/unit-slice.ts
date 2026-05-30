type UnitState = {
  dt: number;
  dx: number;
  velocity: number;
  epsilon: number;
};

type UnitActions = {
  setDt: (dt: number) => void;
  setDx: (dx: number) => void;
  setVelocity: (velocity: number) => void;
  setEpsilon: (epsilon: number) => void;
};

export type UnitSlice = UnitState & UnitActions;

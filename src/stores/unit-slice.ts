type UnitState = {
  dt: number;
  dx: number;
  velocity: number;
  permittivity: number;
};

type UnitActions = {
  setDt: (dt: number) => void;
  setDx: (dx: number) => void;
  setVelocity: (velocity: number) => void;
  setPermittivity: (permittivity: number) => void;
};

export type UnitSlice = UnitState & UnitActions;

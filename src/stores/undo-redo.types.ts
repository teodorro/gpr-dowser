import type Grid2D from '@/shared/grid2d';

export const OperationTypeList = {
  Dewow: 'dewow',
  SubtractMedian: 'subtract_median',
  SubtractMean: 'subtract_mean',
  SplitBscan: 'split_bscan',
  SavitzkyGolay: 'savitzky_golay',
  GaussSmooth: 'gauss_smooth',
  CmpAlignSignal: 'cmp_align_signal',
  SetLeftAScansToZero: 'set_left_ascans_to_zero',
  AddLozaCmpShift: 'add_loza_cmp_shift',
  TurnAroundBscan: 'turn_around_bscan',
  ApplyRelief: 'apply_relief',
} as const;

export type OperationType =
  (typeof OperationTypeList)[keyof typeof OperationTypeList];

export type Operation =
  | {
      type: typeof OperationTypeList.Dewow;
      snapshot: Grid2D;
      windowSize: number;
    }
  | {
      type: typeof OperationTypeList.SubtractMedian;
      snapshot: Grid2D;
      windowSize: number;
    }
  | {
      type: typeof OperationTypeList.SubtractMean;
      snapshot: Grid2D;
      windowSize: number;
    }
  | {
      type: typeof OperationTypeList.SplitBscan;
      snapshot: Grid2D;
      splitIndex: number;
      leftDataSliceId: string;
      rightDataSliceId: string;
      relief: [number, number][];
    }
  | {
      type: typeof OperationTypeList.SavitzkyGolay;
      snapshot: Grid2D;
      horizontalWindowSize: number;
      horizontalPolynomialSize: number;
      verticalWindowSize: number;
      verticalPolynomialSize: number;
    }
  | {
      type: typeof OperationTypeList.GaussSmooth;
      snapshot: Grid2D;
      sigmaHorizontal: number;
      sigmaVertical: number;
    }
  | {
      type: typeof OperationTypeList.CmpAlignSignal;
      snapshot: Grid2D;
      ampBreakpoint: number;
    }
  | {
      type: typeof OperationTypeList.SetLeftAScansToZero;
      snapshot: Grid2D;
      zeroBreakpoint: number;
    }
  | {
      type: typeof OperationTypeList.AddLozaCmpShift;
      snapshot: Grid2D;
      dx: number;
      dt: number;
    }
  | {
      type: typeof OperationTypeList.TurnAroundBscan;
      snapshot: Grid2D;
    }
  | {
      type: typeof OperationTypeList.ApplyRelief;
      snapshot: Grid2D;
      previousPoints: [number, number][];
      points: [number, number][];
    };

export type ReliefOperation = Extract<
  Operation,
  { type: typeof OperationTypeList.ApplyRelief }
>;

export type OperationHistory = {
  undo: Operation[];
  redo: Operation[];
};

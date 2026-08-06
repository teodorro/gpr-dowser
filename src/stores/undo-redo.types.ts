export const OperationTypeList = {
  Dewow: 'dewow',
  SubtractMedian: 'subtract_median',
  SubtractMean: 'subtract_mean',
  SplitBscan: 'split_bscan',
  SavitzkyGolay: 'savitzky_golay',
  GaussSmooth: 'gauss_smooth',
  CmpAlignSignal: 'cmp_align_signal',
} as const;

export type OperationType =
  (typeof OperationTypeList)[keyof typeof OperationTypeList];

export type Operation =
  | {
      type: typeof OperationTypeList.Dewow;
      windowSize: number;
    }
  | {
      type: typeof OperationTypeList.SubtractMedian;
    }
  | {
      type: typeof OperationTypeList.SubtractMean;
    }
  | {
      type: typeof OperationTypeList.SplitBscan;
      splitIndex: number;
      leftDataSliceId: string;
      rightDataSliceId: string;
    }
  | {
      type: typeof OperationTypeList.SavitzkyGolay;
      horizontalWindowSize: number;
      horizontalPolynomialSize: number;
      verticalWindowSize: number;
      verticalPolynomialSize: number;
    }
  | {
      type: typeof OperationTypeList.GaussSmooth;
      sigmaHorizontal: number;
      sigmaVertical: number;
    }
  | {
      type: typeof OperationTypeList.CmpAlignSignal;
      ampBreakpoint: number;
    };

export type OperationHistory = {
  undo: Operation[];
  redo: Operation[];
};

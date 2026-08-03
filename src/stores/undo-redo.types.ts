export const OperationTypeList = {
  Dewow: 'dewow',
  SubtractMedian: 'subtract_median',
  SubtractMean: 'subtract_mean',
  SavitzkyGolay: 'savitzky_golay',
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
      type: typeof OperationTypeList.SavitzkyGolay;
      horizontalWindowSize: number;
      horizontalPolynomialSize: number;
      verticalWindowSize: number;
      verticalPolynomialSize: number;
    };

export type OperationHistory = {
  undo: Operation[];
  redo: Operation[];
};

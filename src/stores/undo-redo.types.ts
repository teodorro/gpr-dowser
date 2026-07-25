export const OperationTypeList = {
  Dewow: 'dewow',
  SubtractMedian: 'subtract_median',
  SubtractMean: 'subtract_mean',
  SplitBscan: 'split_bscan',
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
    };

export type OperationHistory = {
  undo: Operation[];
  redo: Operation[];
};

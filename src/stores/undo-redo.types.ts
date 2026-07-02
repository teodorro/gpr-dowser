export const OperationTypeList = {
  Dewow: 'dewow',
  SubtractMedian: 'subtract_median',
  SubtractMean: 'subtract_mean',
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
    };

export type OperationHistory = {
  undo: Operation[];
  redo: Operation[];
};

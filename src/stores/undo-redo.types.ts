export const OperationTypeList = {
  Dewow: 'dewow',
  SubtractMedian: 'subtract_median',
  SubtractAverage: 'subtract_average',
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
      type: typeof OperationTypeList.SubtractAverage;
    };

export type OperationHistory = {
  undo: Operation[];
  redo: Operation[];
};

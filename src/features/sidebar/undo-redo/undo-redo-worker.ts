import Grid2D from '@/shared/grid2d';
import { unreachable } from '@/shared/unreachable';
import { OperationTypeList, type Operation } from '@/stores/undo-redo.types';
import subtractMean from '../processing/statistical-processing/subtract-avg/subtract-mean';
import subtractMedian from '../processing/statistical-processing/subtract-avg/subtract-median';
import dewow from '../processing/statistical-processing/dewow/dewow';
import { splitBscan } from '@/features/b-scan/splitBscan';
import { savGolayFilter } from '../processing/statistical-processing/savitzky-golay/sav-golay-filter';
import { gaussianSmooth } from '../processing/statistical-processing/gauss-smooth/gaussian-smooth';
import { alignSignal } from '../cmp/signal-aligner/align-signal';
import { setLeftAScansToZero } from '../cmp/left-ascans-to-zero/set-left-ascans-to-zero';

export type UndoRedoMessage =
  | {
      type: 'progress';
      progress: number;
    }
  | {
      type: 'complete';
      result: Grid2D;
      operationType: 'undo' | 'redo';
    };

export type DataContainer = {
  bScan: Grid2D;
  history: Map<number, Operation>;
  target: number;
  operationType: 'undo' | 'redo';
};

self.onmessage = (e: MessageEvent<DataContainer>) => {
  const operationType = e.data.operationType;
  const target = e.data.target;
  const history = e.data.history;
  let bScan = new Grid2D(
    e.data.bScan.cols,
    e.data.bScan.rows,
    e.data.bScan.buf,
  );
  for (let i = 1; i <= target; i++) {
    const operation = history.get(i);
    if (!operation) {
      continue;
    }
    switch (operation.type) {
      case OperationTypeList.SubtractMean:
        bScan = subtractMean(bScan);
        break;
      case OperationTypeList.SubtractMedian:
        bScan = subtractMedian(bScan);
        break;
      case OperationTypeList.Dewow:
        bScan = dewow(bScan, operation.windowSize);
        break;
      case OperationTypeList.SplitBscan:
        [bScan] = splitBscan(
          bScan,
          operation.splitIndex,
          operation.leftDataSliceId,
          operation.rightDataSliceId,
        );
        break;
      case OperationTypeList.SavitzkyGolay:
        bScan = Grid2D.fromArray(
          savGolayFilter(
            bScan.toArray(),
            operation.horizontalWindowSize,
            operation.horizontalPolynomialSize,
            operation.verticalWindowSize,
            operation.verticalPolynomialSize,
          ),
        );
        break;
      case OperationTypeList.GaussSmooth:
        bScan = gaussianSmooth(
          bScan,
          operation.sigmaHorizontal,
          operation.sigmaVertical,
        );
        break;
      case OperationTypeList.CmpAlignSignal:
        bScan = alignSignal(bScan, operation.ampBreakpoint);
        break;
      case OperationTypeList.SetLeftAScansToZero:
        bScan = setLeftAScansToZero(bScan, operation.zeroBreakpoint);
        break;
      default:
        unreachable(operation);
    }
    self.postMessage({ type: 'progress', progress: i / target });
  }
  self.postMessage({
    type: 'complete',
    result: bScan,
    operationType,
  });
};

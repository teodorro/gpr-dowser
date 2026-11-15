import applyRelief from '@/features/b-scan/apply-relief';
import addLozaShift from '@/features/sidebar/cmp/add-loza-cmp-shift/add-loza-shift';
import { setLeftAScansToZero } from '@/features/sidebar/cmp/left-ascans-to-zero/set-left-ascans-to-zero';
import { alignSignal } from '@/features/sidebar/cmp/signal-aligner/align-signal';
import dewow from '@/features/sidebar/processing/statistical-processing/dewow/dewow';
import { gaussianSmooth } from '@/features/sidebar/processing/statistical-processing/gauss-smooth/gaussian-smooth';
import { savGolayFilter } from '@/features/sidebar/processing/statistical-processing/savitzky-golay/sav-golay-filter';
import subtractMean from '@/features/sidebar/processing/statistical-processing/subtract-avg/subtract-mean';
import subtractMedian from '@/features/sidebar/processing/statistical-processing/subtract-avg/subtract-median';
import turnAroundBscan from '@/features/sidebar/processing/statistical-processing/turn-around/turn-around-bscan';
import Grid2D from '@/shared/grid2d';
import { unreachable } from '@/shared/unreachable';
import { OperationTypeList } from '@/stores/undo-redo.types';
import type { OperationParams, OperationResult } from './operation-params';

export const executeOperation = (
  bScan: Grid2D,
  params: OperationParams,
): OperationResult => {
  switch (params.type) {
    case OperationTypeList.Dewow:
      return { bScan: dewow(bScan, params.windowSize) };
    case OperationTypeList.SubtractMedian:
      return { bScan: subtractMedian(bScan, params.windowSize) };
    case OperationTypeList.SubtractMean:
      return { bScan: subtractMean(bScan, params.windowSize) };
    case OperationTypeList.SplitBscan: {
      if (params.splitIndex <= 0 || params.splitIndex >= bScan.cols) {
        throw new RangeError(
          `Split index ${params.splitIndex} is outside of the radargram (${bScan.cols} traces)`,
        );
      }
      const [left, right] = bScan.split(params.splitIndex);
      return { bScan: left, right };
    }
    case OperationTypeList.SavitzkyGolay:
      return {
        bScan: Grid2D.fromArray(
          savGolayFilter(
            bScan.toArray(),
            params.horizontalWindowSize,
            params.horizontalPolynomialSize,
            params.verticalWindowSize,
            params.verticalPolynomialSize,
          ),
        ),
      };
    case OperationTypeList.GaussSmooth:
      return {
        bScan: gaussianSmooth(
          bScan,
          params.sigmaHorizontal,
          params.sigmaVertical,
        ),
      };
    case OperationTypeList.CmpAlignSignal:
      return { bScan: alignSignal(bScan.clone(), params.ampBreakpoint) };
    case OperationTypeList.SetLeftAScansToZero:
      return { bScan: setLeftAScansToZero(bScan, params.zeroBreakpoint) };
    case OperationTypeList.AddLozaCmpShift:
      return { bScan: addLozaShift(bScan, params.dx, params.dt) };
    case OperationTypeList.TurnAroundBscan:
      return { bScan: turnAroundBscan(bScan) };
    case OperationTypeList.ApplyRelief:
      return {
        bScan: applyRelief(bScan, params.previousPoints, params.points),
      };
    default:
      return unreachable(params);
  }
};

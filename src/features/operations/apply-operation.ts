import { registerSplitRight } from '@/features/b-scan/splitBscan';
import i18n from 'i18next';
import { unreachable } from '@/shared/unreachable';
import type { DataStore } from '@/stores/data-slice-stores';
import { mirrorRelief } from '@/stores/relief-slice';
import useUiStore from '@/stores/ui-store';
import { OperationTypeList, type Operation } from '@/stores/undo-redo.types';
import { toast } from 'sonner';
import { computeOperation } from './operations-client';
import type { OperationParams } from './operation-params';

export const reportOperationError = (
  error: unknown,
  type?: Operation['type'],
) => {
  const message = error instanceof Error ? error.message : String(error);
  toast.error(
    type
      ? `${i18n.t('OperationFailed')} (${i18n.t(type)}): ${message}`
      : `${i18n.t('OperationFailed')}: ${message}`,
  );
};

export const withOperationsLock = async <T>(
  task: () => Promise<T>,
): Promise<T | undefined> => {
  if (useUiStore.getState().operationsBusy) return undefined;
  useUiStore.getState().setOperationsBusy(true);
  try {
    return await task();
  } finally {
    useUiStore.getState().setOperationsBusy(false);
  }
};

export const applyOperation = async (
  store: DataStore,
  params: OperationParams,
): Promise<void> => {
  const before = store.getState();
  const result = await computeOperation(before.bScan, params);
  const state = store.getState();
  const snapshot = result.bScan;

  switch (params.type) {
    case OperationTypeList.SplitBscan: {
      if (!result.right) {
        throw new Error('Split did not produce the right radargram');
      }
      const rightDataSliceId = registerSplitRight(
        result.right,
        params.splitIndex,
        state.id,
      );
      state.setBScan(snapshot);
      state.addOperation({
        type: params.type,
        snapshot,
        splitIndex: params.splitIndex,
        leftDataSliceId: state.id,
        rightDataSliceId,
        relief: before.relief,
      });
      return;
    }
    case OperationTypeList.TurnAroundBscan:
      state.setBScan(snapshot);
      state.setRelief(mirrorRelief(state.relief, before.bScan.cols));
      state.addOperation({ ...params, snapshot });
      return;
    case OperationTypeList.ApplyRelief:
      state.setBScan(snapshot);
      state.setRelief(params.points);
      state.addOperation({ ...params, snapshot });
      return;
    case OperationTypeList.Dewow:
    case OperationTypeList.SubtractMedian:
    case OperationTypeList.SubtractMean:
    case OperationTypeList.SavitzkyGolay:
    case OperationTypeList.GaussSmooth:
    case OperationTypeList.CmpAlignSignal:
    case OperationTypeList.SetLeftAScansToZero:
    case OperationTypeList.AddLozaCmpShift:
      state.setBScan(snapshot);
      state.addOperation({ ...params, snapshot });
      return;
    default:
      unreachable(params);
  }
};

export const runOperation = async (
  store: DataStore,
  params: OperationParams,
): Promise<boolean> => {
  const applied = await withOperationsLock(async () => {
    try {
      await applyOperation(store, params);
      return true;
    } catch (error) {
      reportOperationError(error, params.type);
      return false;
    }
  });
  return applied ?? false;
};

export const getTransferParams = (
  operation: Operation,
  target: DataStore,
): OperationParams => {
  const state = target.getState();
  switch (operation.type) {
    case OperationTypeList.Dewow:
    case OperationTypeList.SubtractMedian:
    case OperationTypeList.SubtractMean:
      return { type: operation.type, windowSize: operation.windowSize };
    case OperationTypeList.SplitBscan:
      return { type: operation.type, splitIndex: operation.splitIndex };
    case OperationTypeList.SavitzkyGolay:
      return {
        type: operation.type,
        horizontalWindowSize: operation.horizontalWindowSize,
        horizontalPolynomialSize: operation.horizontalPolynomialSize,
        verticalWindowSize: operation.verticalWindowSize,
        verticalPolynomialSize: operation.verticalPolynomialSize,
      };
    case OperationTypeList.GaussSmooth:
      return {
        type: operation.type,
        sigmaHorizontal: operation.sigmaHorizontal,
        sigmaVertical: operation.sigmaVertical,
      };
    case OperationTypeList.CmpAlignSignal:
      return { type: operation.type, ampBreakpoint: operation.ampBreakpoint };
    case OperationTypeList.SetLeftAScansToZero:
      return { type: operation.type, zeroBreakpoint: operation.zeroBreakpoint };
    case OperationTypeList.AddLozaCmpShift:
      return { type: operation.type, dx: state.dx, dt: state.dt };
    case OperationTypeList.TurnAroundBscan:
      return { type: operation.type };
    case OperationTypeList.ApplyRelief:
      return {
        type: operation.type,
        previousPoints: state.relief,
        points: operation.points,
      };
    default:
      return unreachable(operation);
  }
};

export const transferOperations = async (
  target: DataStore,
  operations: Operation[],
): Promise<number> => {
  if (operations.length === 0) return 0;
  const done = await withOperationsLock(async () => {
    const { setTransfer } = useUiStore.getState();
    const total = operations.length;
    let applied = 0;
    setTransfer({ done: 0, total });
    try {
      for (const operation of operations) {
        try {
          await applyOperation(target, getTransferParams(operation, target));
        } catch (error) {
          reportOperationError(error, operation.type);
          break;
        }
        applied += 1;
        setTransfer({ done: applied, total });
      }
    } finally {
      setTransfer(null);
    }
    return applied;
  });
  return done ?? 0;
};

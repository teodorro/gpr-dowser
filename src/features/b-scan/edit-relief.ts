import type Grid2D from '@/shared/grid2d';
import type { DataStore } from '@/stores/data-slice-stores';
import {
  OperationTypeList,
  type ReliefOperation,
} from '@/stores/undo-redo.types';
import applyRelief from './apply-relief';

type ReliefSession = {
  operation: ReliefOperation;
  base: Grid2D;
};

const sessions = new WeakMap<DataStore, ReliefSession>();

export const editRelief = (store: DataStore, points: [number, number][]) => {
  const state = store.getState();

  const session = sessions.get(store);
  const isSameSession =
    session != null && state.history.get(state.position) === session.operation;

  const base = isSameSession ? session.base : state.bScan;
  const previousPoints = isSameSession
    ? session.operation.previousPoints
    : state.relief;

  const newBScan = applyRelief(base, previousPoints, points);
  const operation: ReliefOperation = {
    type: OperationTypeList.ApplyRelief,
    snapshot: newBScan,
    previousPoints,
    points,
  };
  if (isSameSession) {
    state.replaceOperation(operation);
  } else {
    state.addOperation(operation);
  }
  state.setBScan(newBScan);
  state.setRelief(points);
  sessions.set(store, { operation, base });
};

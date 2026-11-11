// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import Grid2D from '@/shared/grid2d';
import { createDataSliceStore } from '@/stores/data-slice-stores';
import { OperationTypeList } from '@/stores/undo-redo.types';
import { useUndoRedo } from './use-undo-redo';

const createStore = () => {
  const bScan = Grid2D.fromArray([
    [1, 2],
    [3, 4],
    [5, 6],
  ]);
  const store = createDataSliceStore('test-id', {
    bScanInitial: bScan,
    bScan,
  });
  store
    .getState()
    .addOperation({ type: OperationTypeList.TurnAroundBscan, snapshot: bScan });
  store.getState().addOperation({
    type: OperationTypeList.SplitBscan,
    snapshot: bScan,
    splitIndex: 2,
    leftDataSliceId: 'left',
    rightDataSliceId: 'right',
    relief: [],
  });
  return store;
};

describe('useUndoRedo', () => {
  it('undo works properly', () => {
    const store = createStore();
    const { result } = renderHook(() => useUndoRedo(store));

    result.current.handleUndo();
    result.current.handleUndo();

    expect(store.getState().bScan).toEqual(store.getState().bScanInitial);
  });

  it('replays the history from the start on undo', () => {
    const store = createStore();
    const { result } = renderHook(() => useUndoRedo(store));
    const b = store.getState().bScan.clone();

    result.current.handleUndo();
    result.current.handleRedo();

    expect(store.getState().bScan).toEqual(b);
  });
});

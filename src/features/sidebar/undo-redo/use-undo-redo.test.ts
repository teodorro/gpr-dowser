// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import Grid2D from '@/shared/grid2d';
import { createDataSliceStore } from '@/stores/data-slice-stores';
import { OperationTypeList } from '@/stores/undo-redo.types';
import { useUndoRedo } from './use-undo-redo';

class FakeWorker {
  static last: FakeWorker;
  posted: Record<string, unknown>[] = [];
  terminated = false;
  onmessage: ((e: { data: unknown }) => void) | null = null;

  constructor() {
    FakeWorker.last = this;
  }
  postMessage(message: Record<string, unknown>) {
    this.posted.push(message);
  }
  terminate() {
    this.terminated = true;
  }
}

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
  store.getState().addOperation({ type: OperationTypeList.TurnAroundBscan });
  store.getState().addOperation({
    type: OperationTypeList.SplitBscan,
    splitIndex: 2,
    leftDataSliceId: 'left',
    rightDataSliceId: 'right',
    relief: [],
  });
  return store;
};

describe('useUndoRedo', () => {
  beforeEach(() => vi.stubGlobal('Worker', FakeWorker));
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('replays the history from the start on undo', () => {
    const store = createStore();
    const { result } = renderHook(() => useUndoRedo(store));

    result.current.handleUndo();

    expect(FakeWorker.last.posted).toEqual([
      {
        bScan: store.getState().bScanInitial,
        history: store.getState().history,
        start: 1,
        target: 1,
        operationType: 'undo',
      },
    ]);
  });

  it('replays the history from the start on redo', () => {
    const store = createStore();
    store.getState().undo();
    const { result } = renderHook(() => useUndoRedo(store));

    result.current.handleRedo();

    expect(FakeWorker.last.posted[0]).toMatchObject({
      start: 1,
      target: 2,
      operationType: 'redo',
    });
  });

  it('moves the position and sets bScan when the replay completes', () => {
    const store = createStore();
    renderHook(() => useUndoRedo(store));

    act(() =>
      FakeWorker.last.onmessage?.({
        data: {
          type: 'complete',
          operationType: 'undo',
          result: { cols: 1, rows: 2, buf: new Float32Array([7, 8]) },
        },
      }),
    );

    expect(store.getState().position).toBe(1);
    expect(store.getState().bScan.toArray()).toEqual([[7, 8]]);
  });

  it('continues after a split with the left part', () => {
    const store = createStore();
    renderHook(() => useUndoRedo(store));

    FakeWorker.last.onmessage?.({
      data: {
        type: 'split-bscan',
        start: 2,
        target: 3,
        operationType: 'redo',
        operation: { splitIndex: 1 },
        result: { cols: 2, rows: 1, buf: new Float32Array([7, 8]) },
      },
    });

    const message = FakeWorker.last.posted[0];
    expect((message.bScan as Grid2D).toArray()).toEqual([[7]]);
    expect(message).toMatchObject({
      start: 3,
      target: 3,
      operationType: 'redo',
    });
  });

  it('stops the worker on unmount', () => {
    const store = createStore();
    const { unmount } = renderHook(() => useUndoRedo(store));
    const worker = FakeWorker.last;

    unmount();

    expect(worker.terminated).toBe(true);
  });
});

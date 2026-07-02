import { describe, expect, it } from 'vitest';
import Grid2D from '@/shared/grid2d';
import { createDataSliceStore } from './data-slice-stores';
import { OperationTypeList, type Operation } from './undo-redo.types';

const dewow = (windowSize: number): Operation => ({
  type: OperationTypeList.Dewow,
  windowSize,
});

const subtractMedian: Operation = { type: OperationTypeList.SubtractMedian };
const subtractMean: Operation = { type: OperationTypeList.SubtractMean };

function createTestStore() {
  const grid = new Grid2D(2, 2);
  return createDataSliceStore('test-id', {
    bScanInitial: grid,
    bScan: grid,
    displayBuffer: grid,
  });
}

function historyEntries(store: ReturnType<typeof createTestStore>) {
  return [...store.getState().history.entries()].sort(([a], [b]) => a - b);
}

describe('undo/redo history', () => {
  it('starts with empty history and position 0', () => {
    const store = createTestStore();
    expect(store.getState().history.size).toBe(0);
    expect(store.getState().position).toBe(0);
  });

  it('addOperation appends when position is at the end', () => {
    const store = createTestStore();

    store.getState().addOperation(dewow(5));
    store.getState().addOperation(subtractMedian);

    expect(store.getState().position).toBe(2);
    expect(historyEntries(store)).toEqual([
      [1, dewow(5)],
      [2, subtractMedian],
    ]);
  });

  it('undo decreases position', () => {
    const store = createTestStore();
    store.getState().addOperation(dewow(5));
    store.getState().addOperation(subtractMedian);

    store.getState().undo();

    expect(store.getState().position).toBe(1);
    expect(historyEntries(store)).toEqual([
      [1, dewow(5)],
      [2, subtractMedian],
    ]);
  });

  it('redo increases position', () => {
    const store = createTestStore();
    store.getState().addOperation(dewow(5));
    store.getState().addOperation(subtractMedian);
    store.getState().undo();

    store.getState().redo();

    expect(store.getState().position).toBe(2);
  });

  it('undo does not go below 0', () => {
    const store = createTestStore();

    store.getState().undo();
    store.getState().undo();

    expect(store.getState().position).toBe(0);
  });

  it('redo does not go past history size', () => {
    const store = createTestStore();
    store.getState().addOperation(dewow(5));

    store.getState().redo();
    store.getState().redo();

    expect(store.getState().position).toBe(1);
    expect(store.getState().history.size).toBe(1);
  });

  it('addOperation drops future history when position is in the middle', () => {
    const store = createTestStore();
    store.getState().addOperation(dewow(5));
    store.getState().addOperation(subtractMedian);
    store.getState().addOperation(subtractMean);
    expect(store.getState().position).toBe(3);

    store.getState().undo();
    store.getState().undo();
    expect(store.getState().position).toBe(1);

    store.getState().addOperation(dewow(7));

    expect(store.getState().position).toBe(2);
    expect(historyEntries(store)).toEqual([
      [1, dewow(5)],
      [2, dewow(7)],
    ]);
  });

  it('does not mutate the previous history map when adding', () => {
    const store = createTestStore();
    store.getState().addOperation(dewow(5));
    const historyBefore = store.getState().history;

    store.getState().addOperation(subtractMedian);

    expect(historyBefore.size).toBe(1);
    expect(historyBefore.get(1)).toEqual(dewow(5));
    expect(historyBefore.has(2)).toBe(false);
  });
});

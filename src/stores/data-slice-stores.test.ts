import { describe, expect, it } from 'vitest';
import Grid2D from '@/shared/grid2d';
import { createDataSliceStore } from './data-slice-stores';
import { OperationTypeList, type Operation } from './undo-redo.types';

const dewow = (windowSize: number): Operation => ({
  type: OperationTypeList.Dewow,
  snapshot: new Grid2D(2, 2),
  windowSize,
});

const subtractMedian = (windowSize: number): Operation => ({
  type: OperationTypeList.SubtractMedian,
  snapshot: new Grid2D(2, 2),
  windowSize,
});
const subtractMean = (windowSize: number): Operation => ({
  type: OperationTypeList.SubtractMean,
  snapshot: new Grid2D(2, 2),
  windowSize,
});

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
    store.getState().addOperation(subtractMedian(1));

    expect(store.getState().position).toBe(2);
    expect(historyEntries(store)).toEqual([
      [1, dewow(5)],
      [2, subtractMedian(1)],
    ]);
  });

  it('undo decreases position', () => {
    const store = createTestStore();
    store.getState().addOperation(dewow(5));
    store.getState().addOperation(subtractMedian(1));

    store.getState().undo();

    expect(store.getState().position).toBe(1);
    expect(historyEntries(store)).toEqual([
      [1, dewow(5)],
      [2, subtractMedian(1)],
    ]);
  });

  it('redo increases position', () => {
    const store = createTestStore();
    store.getState().addOperation(dewow(5));
    store.getState().addOperation(subtractMedian(1));
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
    store.getState().addOperation(subtractMedian(1));
    store.getState().addOperation(subtractMean(1));
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

    store.getState().addOperation(subtractMedian(1));

    expect(historyBefore.size).toBe(1);
    expect(historyBefore.get(1)).toEqual(dewow(5));
    expect(historyBefore.has(2)).toBe(false);
  });

  describe('relief', () => {
    const previousPoints: [number, number][] = [
      [0, 0],
      [1, 0],
    ];
    const points: [number, number][] = [
      [0, 3],
      [1, 5],
    ];
    const applyRelief: Operation = {
      type: OperationTypeList.ApplyRelief,
      snapshot: new Grid2D(2, 2),
      previousPoints,
      points,
    };

    it('undo brings back the curve before the relief operation', () => {
      const store = createTestStore();
      store.getState().addOperation(applyRelief);
      store.getState().setRelief(points);
      store.getState().setSelectedReliefPoint([1, 5]);

      store.getState().undo();

      expect(store.getState().relief).toEqual(previousPoints);
      expect(store.getState().selectedReliefPoint).toBeUndefined();
    });

    it('redo brings back the curve of the relief operation', () => {
      const store = createTestStore();
      store.getState().addOperation(applyRelief);
      store.getState().undo();

      store.getState().redo();

      expect(store.getState().relief).toEqual(points);
    });

    it('undo and redo of turn around mirror the curve', () => {
      const store = createTestStore();
      store.getState().setRelief(points);
      store.getState().addOperation({
        type: OperationTypeList.TurnAroundBscan,
        snapshot: new Grid2D(2, 2),
      });

      store.getState().undo();
      expect(store.getState().relief).toEqual([
        [0, 5],
        [1, 3],
      ]);

      store.getState().redo();
      expect(store.getState().relief).toEqual(points);
    });

    it('undo of a split brings back the whole curve', () => {
      const store = createTestStore();
      const whole: [number, number][] = [
        [0, 2],
        [10, 2],
      ];
      store.getState().addOperation({
        type: OperationTypeList.SplitBscan,
        snapshot: new Grid2D(2, 2),
        splitIndex: 4,
        leftDataSliceId: 'left',
        rightDataSliceId: 'right',
        relief: whole,
      });
      store.getState().setRelief([
        [0, 2],
        [4, 2],
      ]);

      store.getState().undo();
      expect(store.getState().relief).toEqual(whole);

      store.getState().redo();
      expect(store.getState().relief).toEqual([
        [0, 2],
        [4, 2],
      ]);
    });

    it('replaceOperation swaps the current step and drops later ones', () => {
      const store = createTestStore();
      store.getState().addOperation(dewow(5));
      store.getState().addOperation(applyRelief);
      store.getState().addOperation(dewow(7));
      store.getState().undo();

      store.getState().replaceOperation(subtractMean(1));

      expect(store.getState().position).toBe(2);
      expect(historyEntries(store)).toEqual([
        [1, dewow(5)],
        [2, subtractMean(1)],
      ]);
    });

    it('other operations leave the curve alone', () => {
      const store = createTestStore();
      store.getState().setRelief(points);
      store.getState().addOperation(dewow(5));

      store.getState().undo();
      expect(store.getState().relief).toEqual(points);

      store.getState().redo();
      expect(store.getState().relief).toEqual(points);
    });
  });
});

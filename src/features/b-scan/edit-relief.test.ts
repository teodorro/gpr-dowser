import { describe, expect, it } from 'vitest';
import Grid2D from '@/shared/grid2d';
import { createDataSliceStore } from '@/stores/data-slice-stores';
import { OperationTypeList } from '@/stores/undo-redo.types';
import { editRelief } from './edit-relief';

const FLAT: [number, number][] = [
  [0, 0],
  [2, 0],
];

const createStore = () => {
  const bScan = Grid2D.fromArray([
    [1, 2],
    [3, 4],
    [5, 6],
  ]);
  return createDataSliceStore('test-id', {
    bScanInitial: bScan,
    bScan,
    relief: FLAT,
  });
};

const operations = (store: ReturnType<typeof createStore>) => [
  ...store.getState().history.values(),
];

describe('editRelief', () => {
  it('applies the curve to bScan straight away', () => {
    const store = createStore();

    editRelief(store, [
      [0, 0],
      [2, 2],
    ]);

    expect(store.getState().bScan.toArray()).toEqual([
      [1, 2, 0, 0],
      [0, 3, 4, 0],
      [0, 0, 5, 6],
    ]);
    expect(store.getState().relief).toEqual([
      [0, 0],
      [2, 2],
    ]);
  });

  it('squashes edits in a row into one history step', () => {
    const store = createStore();
    const points: [number, number][] = [
      [0, 1],
      [2, 1],
    ];

    editRelief(store, [
      [0, 0],
      [2, 2],
    ]);
    editRelief(store, points);

    expect(store.getState().position).toBe(1);
    expect(operations(store)).toEqual([
      { type: OperationTypeList.ApplyRelief, previousPoints: FLAT, points },
    ]);
    expect(store.getState().bScan.toArray()).toEqual([
      [0, 1, 2],
      [0, 3, 4],
      [0, 5, 6],
    ]);
  });

  it('starts a new step after another operation', () => {
    const store = createStore();
    const first: [number, number][] = [
      [0, 0],
      [2, 2],
    ];
    editRelief(store, first);
    store
      .getState()
      .addOperation({ type: OperationTypeList.Dewow, windowSize: 3 });

    editRelief(store, FLAT);

    expect(store.getState().position).toBe(3);
    expect(operations(store)[2]).toEqual({
      type: OperationTypeList.ApplyRelief,
      previousPoints: first,
      points: FLAT,
    });
    expect(store.getState().bScan.toArray()).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it('starts a new step after undo', () => {
    const store = createStore();
    editRelief(store, [
      [0, 0],
      [2, 2],
    ]);
    store.getState().undo();

    editRelief(store, [
      [0, 1],
      [2, 1],
    ]);

    expect(store.getState().position).toBe(1);
    expect(operations(store)).toHaveLength(1);
    expect(operations(store)[0]).toMatchObject({ previousPoints: FLAT });
  });
});

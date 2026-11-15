import { afterEach, describe, expect, it } from 'vitest';
import Grid2D from '@/shared/grid2d';
import {
  createDataSliceStore,
  dataSliceStores,
} from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import useUiStore from '@/stores/ui-store';
import {
  OperationTypeList,
  type Operation,
  type OperationType,
} from '@/stores/undo-redo.types';
import {
  getTransferParams,
  runOperation,
  transferOperations,
} from './apply-operation';
import { executeOperation } from './execute-operation';

const COLS = 6;
const ROWS = 8;

const createGrid = () => {
  const grid = new Grid2D(COLS, ROWS);
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      grid.set(col, row, Math.sin(col * 1.7 + row * 0.9) * 10 + col);
    }
  }
  return grid;
};

const createStore = (id: string, relief: [number, number][] = []) => {
  const bScan = createGrid();
  const store = createDataSliceStore(id, {
    name: id,
    bScanInitial: bScan,
    bScan,
    relief,
    dx: 0.5,
    dt: 2,
  });
  dataSliceStores.set(id, store);
  return store;
};

const snapshot = new Grid2D(0, 0);

// One operation of every type, as it would sit in a source history.
const SOURCE_OPERATIONS: { [T in OperationType]: Operation & { type: T } } = {
  dewow: { type: 'dewow', snapshot, windowSize: 3 },
  subtract_median: { type: 'subtract_median', snapshot, windowSize: 3 },
  subtract_mean: { type: 'subtract_mean', snapshot, windowSize: 3 },
  split_bscan: {
    type: 'split_bscan',
    snapshot,
    splitIndex: 4,
    leftDataSliceId: 'source',
    rightDataSliceId: 'source-right',
    relief: [],
  },
  savitzky_golay: {
    type: 'savitzky_golay',
    snapshot,
    horizontalWindowSize: 5,
    horizontalPolynomialSize: 3,
    verticalWindowSize: 5,
    verticalPolynomialSize: 3,
  },
  gauss_smooth: {
    type: 'gauss_smooth',
    snapshot,
    sigmaHorizontal: 0.7,
    sigmaVertical: 0.7,
  },
  cmp_align_signal: { type: 'cmp_align_signal', snapshot, ampBreakpoint: 0 },
  set_left_ascans_to_zero: {
    type: 'set_left_ascans_to_zero',
    snapshot,
    zeroBreakpoint: 2,
  },
  add_loza_cmp_shift: { type: 'add_loza_cmp_shift', snapshot, dx: 9, dt: 9 },
  turn_around_bscan: { type: 'turn_around_bscan', snapshot },
  apply_relief: {
    type: 'apply_relief',
    snapshot,
    previousPoints: [],
    points: [
      [0, 0],
      [5, 2],
    ],
  },
};

afterEach(() => {
  dataSliceStores.clear();
  useFileRegistryStore.setState({ fileIds: [], selectedFileId: undefined });
});

describe('transferOperations', () => {
  it.each(Object.values(SOURCE_OPERATIONS))(
    'performs $type on the target radargram',
    async (operation) => {
      const target = createStore('target');
      const before = target.getState().bScan;
      const expected = executeOperation(
        before,
        getTransferParams(operation, target),
      ).bScan;

      const applied = await transferOperations(target, [operation]);

      const state = target.getState();
      expect(applied).toBe(1);
      expect(state.position).toBe(1);
      expect(state.bScan.toArray()).toEqual(expected.toArray());
      expect(state.history.get(1)).toMatchObject({ type: operation.type });
      // the history keeps the target's own result, not the source snapshot
      expect(state.history.get(1)?.snapshot).toBe(state.bScan);
      expect(state.bScan).not.toBe(before);
    },
  );

  it('chains operations and reports progress after every one', async () => {
    const target = createStore('target');
    const operations = [
      SOURCE_OPERATIONS.dewow,
      SOURCE_OPERATIONS.gauss_smooth,
      SOURCE_OPERATIONS.turn_around_bscan,
    ];
    const seen: (number | null)[] = [];
    const busy: boolean[] = [];
    const unsubscribe = useUiStore.subscribe((state, previous) => {
      if (state.transfer !== previous.transfer) {
        seen.push(state.transfer ? state.transfer.done : null);
        busy.push(state.operationsBusy);
      }
    });

    let expected = target.getState().bScan;
    for (const operation of operations) {
      expected = executeOperation(
        expected,
        getTransferParams(operation, target),
      ).bScan;
    }

    await transferOperations(target, operations);
    unsubscribe();

    expect(seen).toEqual([0, 1, 2, 3, null]);
    expect(busy).toEqual([true, true, true, true, true]);
    expect(useUiStore.getState().operationsBusy).toBe(false);
    expect(target.getState().position).toBe(3);
    expect(target.getState().bScan.toArray()).toEqual(expected.toArray());
  });

  it('uses the geometry and the relief of the target', () => {
    const target = createStore('target', [
      [0, 1],
      [5, 1],
    ]);

    expect(
      getTransferParams(SOURCE_OPERATIONS.add_loza_cmp_shift, target),
    ).toEqual({ type: 'add_loza_cmp_shift', dx: 0.5, dt: 2 });
    expect(getTransferParams(SOURCE_OPERATIONS.apply_relief, target)).toEqual({
      type: 'apply_relief',
      previousPoints: [
        [0, 1],
        [5, 1],
      ],
      points: SOURCE_OPERATIONS.apply_relief.points,
    });
  });

  it('splits the target and registers its right part', async () => {
    const target = createStore('target');

    await transferOperations(target, [SOURCE_OPERATIONS.split_bscan]);

    const operation = target.getState().history.get(1);
    if (operation?.type !== OperationTypeList.SplitBscan) {
      throw new Error('split operation expected');
    }
    expect(target.getState().bScan.cols).toBe(4);
    expect(operation.leftDataSliceId).toBe('target');
    expect(
      dataSliceStores.get(operation.rightDataSliceId)?.getState().bScan.cols,
    ).toBe(2);
  });

  it('stops at an operation that cannot be performed on the target', async () => {
    const target = createStore('target');

    const applied = await transferOperations(target, [
      SOURCE_OPERATIONS.dewow,
      { type: 'dewow', snapshot, windowSize: ROWS + 1 },
      SOURCE_OPERATIONS.gauss_smooth,
    ]);

    expect(applied).toBe(1);
    expect(target.getState().position).toBe(1);
    expect(useUiStore.getState().transfer).toBeNull();
    expect(useUiStore.getState().operationsBusy).toBe(false);
  });

  it('does not start while another operation is running', async () => {
    const target = createStore('target');

    const first = runOperation(target, { type: 'turn_around_bscan' });
    const second = await transferOperations(target, [SOURCE_OPERATIONS.dewow]);

    expect(second).toBe(0);
    expect(await first).toBe(true);
    expect(target.getState().position).toBe(1);
  });
});

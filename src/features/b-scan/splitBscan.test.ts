import { afterEach, describe, expect, it } from 'vitest';
import Grid2D from '@/shared/grid2d';
import {
  createDataSliceStore,
  dataSliceStores,
} from '@/stores/data-slice-stores';
import { splitBscan } from './splitBscan';

describe('splitBscan relief', () => {
  afterEach(() => dataSliceStores.clear());

  it('keeps the curve value at the split in both parts', () => {
    const bScan = new Grid2D(11, 2);
    const store = createDataSliceStore('left', {
      bScan,
      relief: [
        [0, 10],
        [4, 20],
        [10, 40],
      ],
    });
    dataSliceStores.set('left', store);

    const [, rightId] = splitBscan(bScan, 6, 'left');

    const left = store.getState().relief;
    const right = dataSliceStores.get(rightId)?.getState().relief;
    const splitValue = left[left.length - 1][1];

    expect(splitValue).toBeGreaterThan(20);
    expect(splitValue).toBeLessThan(40);
    expect(left).toEqual([
      [0, 10],
      [4, 20],
      [6, splitValue],
    ]);
    expect(right).toEqual([
      [0, splitValue],
      [4, 40],
    ]);
  });
});

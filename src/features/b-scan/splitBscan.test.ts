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

describe('splitBscan units', () => {
  afterEach(() => dataSliceStores.clear());

  it('copies file type and units of measurement to the right part', () => {
    const bScan = new Grid2D(10, 2);
    const store = createDataSliceStore('left', {
      name: 'river.gem',
      type: 'gem',
      bScan,
      dt: 0.5,
      dx: 0.25,
      velocity: 0.12,
      permittivity: 6.25,
      relief: [
        [0, 0],
        [9, 0],
      ],
    });
    dataSliceStores.set('left', store);

    const [, rightId] = splitBscan(bScan, 4, 'left');
    const right = dataSliceStores.get(rightId)?.getState();

    expect(right).toMatchObject({
      type: 'gem',
      dt: 0.5,
      dx: 0.25,
      velocity: 0.12,
      permittivity: 6.25,
    });
  });
});

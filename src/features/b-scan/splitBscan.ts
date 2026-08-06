import { getNextName } from '@/shared/get-next-name';
import Grid2D from '@/shared/grid2d';
import { logTransformGrid2D } from '@/shared/log-transform';
import {
  createDataSliceStore,
  dataSliceStores,
} from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';

export const splitBscan = (
  bscan: Grid2D,
  splitIndex: number,
  leftDataSliceId: string,
  rightDataSliceId?: string,
): [Grid2D, string] => {
  const [leftBScan, rightBScan] = bscan.split(splitIndex);
  const dataSlice = dataSliceStores.get(leftDataSliceId);
  if (!dataSlice) {
    throw new Error('Data slice not found');
  }

  if (!rightDataSliceId) {
    rightDataSliceId = `__from__${leftDataSliceId}__${crypto.randomUUID()}`;
  } else {
    useFileRegistryStore.getState().removeFile(rightDataSliceId);
  }
  const names = Array.from(dataSliceStores).map(
    (keyAndStore) => dataSliceStores.get(keyAndStore[0])?.getState().name ?? '',
  );
  dataSliceStores.set(
    rightDataSliceId,
    createDataSliceStore(rightDataSliceId, {
      name: getNextName(dataSlice.getState().name, names),
      path: '',
      type: 'txt',
      bScanInitial: rightBScan,
      bScan: rightBScan,
      dt: 1,
      dx: 0.1,
      velocity: 0.1,
      epsilon: 9,
      displayBuffer: logTransformGrid2D(rightBScan),
    }),
  );
  useFileRegistryStore.getState().addFile(rightDataSliceId, false);

  return [leftBScan, rightDataSliceId];
};

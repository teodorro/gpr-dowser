import { getNextName } from '@/shared/get-next-name';
import Grid2D from '@/shared/grid2d';
import { logTransformGrid2D } from '@/shared/log-transform';
import {
  createDataSliceStore,
  dataSliceStores,
  type DataStore,
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

  dataSlice.getState().setRelief(getLeftBscanRelief(dataSlice, splitIndex));

  if (!rightDataSliceId) {
    rightDataSliceId = `__from__${leftDataSliceId}__${crypto.randomUUID()}`;
  } else {
    useFileRegistryStore.getState().removeFile(rightDataSliceId);
  }
  const names = Array.from(dataSliceStores).map(
    (keyAndStore) => dataSliceStores.get(keyAndStore[0])?.getState().name ?? '',
  );
  const gridRight = logTransformGrid2D(rightBScan);
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
      displayBuffer: gridRight,
      relief: getRightBscanRelief(dataSlice, splitIndex),
    }),
  );
  useFileRegistryStore.getState().addFile(rightDataSliceId, false);

  return [leftBScan, rightDataSliceId];
};

const getLeftBscanRelief = (dataSlice: DataStore, splitIndex: number) => {
  return [
    ...dataSlice.getState().relief.filter((i) => i[0] < splitIndex),
    [splitIndex, 0],
  ] as [number, number][];
};

const getRightBscanRelief = (dataSlice: DataStore, splitIndex: number) => {
  return [
    [0, 0],
    ...(dataSlice
      .getState()
      .relief.filter((i) => i[0] > splitIndex)
      .map((i) => [i[0] - splitIndex, i[1]]) as [number, number][]),
  ];
};

import { unreachable } from '@/shared/unreachable';
import { readKrotTxtFile } from './read-krot-txt-file';
import Grid2D from '@/shared/grid2d';
import {
  createDataSliceStore,
  dataSliceStores,
} from '@/stores/data-slice-stores';
import { toast } from 'sonner';
import { readGemFile } from './read-gem-file';
import useFileRegistryStore from '@/stores/file-registry-store';
import { readGeoFile } from './read-geo-file';
import i18n from '@/i18n';

type FileExtension = 'txt' | 'geo' | 'gem';

export const loadDataFile = (file: File) => {
  const extension = file.name.split('.')[
    file.name.split('.').length - 1
  ] as FileExtension;
  switch (extension) {
    case 'txt':
      loadTxtFile(file);
      break;
    case 'geo':
      loadGeoFile(file);
      break;
    case 'gem':
      loadGemFile(file);
      break;
    default:
      unreachable(extension);
  }
};

const loadTxtFile = async (file: File) => {
  try {
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('File is large; consider streaming.', {
        position: 'bottom-center',
      });
    }
    const raw = await file.text();
    const data = readKrotTxtFile(raw);
    const id = crypto.randomUUID();
    dataSliceStores.set(
      id,
      createDataSliceStore(id, {
        name: file.name,
        path: file.name,
        type: 'txt',
        bScanInitial: Grid2D.fromArray(data),
        bScan: Grid2D.fromArray(data),
        dt: 1,
        dx: 0.1,
        velocity: 0.1,
        epsilon: 9,
        displayBuffer: Grid2D.fromArray(data),
      }),
    );
    useFileRegistryStore.getState().addFile(id);
  } catch (err) {
    toast.error(
      `${i18n.t('FailedToReadFile')}:
      ${err}`,
      {
        position: 'bottom-center',
      },
    );
  }
};

const loadGemFile = async (file: File) => {
  const reader = new FileReader();

  reader.onload = () => {
    const buffer = reader.result as ArrayBuffer;
    const uint8 = new Uint8Array(buffer);
    const data = readGemFile(uint8);
    const id = crypto.randomUUID();
    dataSliceStores.set(
      id,
      createDataSliceStore(id, {
        name: file.name,
        path: file.name,
        type: 'gem',
        bScanInitial: Grid2D.fromArray(data),
        bScan: Grid2D.fromArray(data),
        dt: 1,
        dx: 0.1,
        velocity: 0.1,
        epsilon: 9,
        displayBuffer: Grid2D.fromArray(data),
      }),
    );
    useFileRegistryStore.getState().addFile(id);
  };

  reader.onerror = (err: ProgressEvent<FileReader>) => {
    toast.error(
      `${i18n.t('FailedToReadFile')}:
      ${err}`,
      {
        position: 'bottom-center',
      },
    );
  };

  reader.readAsArrayBuffer(file);
};

const loadGeoFile = async (file: File) => {
  const reader = new FileReader();

  reader.onload = () => {
    const buffer = reader.result as ArrayBuffer;
    const uint8 = new Uint8Array(buffer);
    const data = readGeoFile(uint8);
    const id = crypto.randomUUID();
    dataSliceStores.set(
      id,
      createDataSliceStore(id, {
        name: file.name,
        path: file.name,
        type: 'geo',
        bScanInitial: Grid2D.fromArray(data),
        bScan: Grid2D.fromArray(data),
        dt: 1,
        dx: 0.1,
        velocity: 0.1,
        epsilon: 9,
        displayBuffer: Grid2D.fromArray(data),
      }),
    );
    useFileRegistryStore.getState().addFile(id);
  };

  reader.onerror = (err: ProgressEvent<FileReader>) => {
    toast.error(
      `${i18n.t('FailedToReadFile')}:
      ${err}`,
      {
        position: 'bottom-center',
      },
    );
  };

  reader.readAsArrayBuffer(file);
};
